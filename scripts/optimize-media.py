"""Build small, content-addressed web media without changing source artwork.

Requires Python with Pillow, Node.js 24+ and an FFmpeg executable. Run from any
directory; paths are resolved from this script's repository. Source portfolio
data remains authoritative and original media stay available for archiving.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import struct
import subprocess
import tempfile
import time

from PIL import Image, ImageChops, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
REPORT_DIR = ROOT / ".tmp" / "performance-media"
FFMPEG_DEFAULT = (
    ROOT / ".tmp/hero-media-tooling/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe"
)


def content_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:12]


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def project_image_urls() -> list[str]:
    # Node 24 strips the source file's type annotations; there is no duplicated
    # list of project filenames for this script to get out of sync with.
    code = """
      import { pathToFileURL } from 'node:url';
      const { projects } = await import(pathToFileURL(process.argv[1]).href);
      process.stdout.write(JSON.stringify([...new Set(projects.flatMap(p => [p.cover, ...p.images]))]));
    """
    result = subprocess.run(
        ["node", "--input-type=module", "-e", code, str(ROOT / "src/data/portfolio.ts")],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(result.stdout)


def webp_variant(image: Image.Image, source: Path, max_width: int, output_dir: Path) -> tuple[str, int, int, int, bool]:
    width = min(max_width, image.width)
    height = max(1, round(image.height * width / image.width))
    resized = image if image.size == (width, height) else image.resize((width, height), Image.Resampling.LANCZOS)
    with tempfile.SpooledTemporaryFile(max_size=8 * 1024 * 1024) as buffer:
        resized.save(
            buffer,
            format="WEBP",
            quality=88,
            method=6,
            icc_profile=image.info.get("icc_profile", b""),
        )
        buffer.seek(0)
        data = buffer.read()

    # Never replace an already efficient asset with a larger generated file.
    # Existing source WebP/JPEG may therefore remain the primary URL.
    if len(data) >= source.stat().st_size:
        return "/" + source.relative_to(PUBLIC).as_posix(), image.width, image.height, source.stat().st_size, False

    filename = f"{source.stem}-{content_hash(data)}-{width}.webp"
    output = output_dir / filename
    output.write_bytes(data)
    return "/" + output.relative_to(PUBLIC).as_posix(), width, height, len(data), True


def compare_at_display_size(source: Path, output: Path, display_width: int = 800) -> dict:
    with Image.open(source) as raw_source, Image.open(output) as raw_output:
        original = ImageOps.exif_transpose(raw_source).convert("RGB")
        optimized = ImageOps.exif_transpose(raw_output).convert("RGB")
        width = min(display_width, original.width)
        height = round(original.height * width / original.width)
        original = original.resize((width, height), Image.Resampling.LANCZOS)
        optimized = optimized.resize((width, height), Image.Resampling.LANCZOS)
        stats = ImageStat.Stat(ImageChops.difference(original, optimized))
        rms = math.sqrt(sum(value * value for value in stats.rms) / 3)
        return {"displayWidth": width, "psnrDb": round(20 * math.log10(255 / rms), 2) if rms else None}


def optimize_logo() -> tuple[str, dict, dict]:
    url = "/portfolio/logo-liwei-mark.png"
    source = PUBLIC / url.lstrip("/")
    output_dir = PUBLIC / "optimized"
    output_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        width = 160
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        with tempfile.SpooledTemporaryFile(max_size=1024 * 1024) as buffer:
            resized.save(buffer, format="WEBP", lossless=True, quality=100, method=6)
            buffer.seek(0)
            data = buffer.read()
    output = output_dir / f"logo-liwei-mark-{content_hash(data)}-160.webp"
    output.write_bytes(data)
    result_url = "/" + output.relative_to(PUBLIC).as_posix()
    manifest = {"src": result_url, "smallSrc": result_url, "width": width, "height": height, "smallWidth": width, "smallHeight": height}
    return url, manifest, {"sourceBytes": source.stat().st_size, "outputBytes": len(data), "width": width, "height": height, "lossless": True}


def optimize_images() -> dict:
    output_dir = PUBLIC / "optimized/works"
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest = {}
    records = []
    started = time.monotonic()

    for index, url in enumerate(project_image_urls(), 1):
        source = PUBLIC / url.lstrip("/")
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            primary = webp_variant(image, source, 1600, output_dir)
            small = webp_variant(image, source, 800, output_dir)

        manifest[url] = {
            "src": primary[0],
            "smallSrc": small[0],
            "width": primary[1],
            "height": primary[2],
            "smallWidth": small[1],
            "smallHeight": small[2],
        }
        records.append({
            "source": url,
            "sourceBytes": source.stat().st_size,
            "primaryBytes": primary[3],
            "smallBytes": small[3],
            "generatedPrimary": primary[4],
            "generatedSmall": small[4],
        })
        if index % 15 == 0:
            print(f"Images: {index} converted in {round(time.monotonic() - started)}s", flush=True)

    logo_url, logo_manifest, logo_report = optimize_logo()
    manifest[logo_url] = logo_manifest
    write_json(ROOT / "src/data/optimizedImages.json", manifest)
    samples = []
    for record in sorted(records, key=lambda row: row["sourceBytes"], reverse=True)[:6]:
        original = PUBLIC / record["source"].lstrip("/")
        optimized = PUBLIC / manifest[record["source"]]["src"].lstrip("/")
        samples.append({"source": record["source"], **compare_at_display_size(original, optimized)})

    report = {
        "count": len(records),
        "sourceBytes": sum(row["sourceBytes"] for row in records),
        "primaryBytes": sum(row["primaryBytes"] for row in records),
        "smallBytes": sum(row["smallBytes"] for row in records),
        "quality": 88,
        "maxWidth": 1600,
        "smallMaxWidth": 800,
        "displayComparisons": samples,
        "logo": logo_report,
        "files": records,
    }
    write_json(REPORT_DIR / "image-report.json", report)
    print(json.dumps({key: value for key, value in report.items() if key != "files"}, ensure_ascii=False), flush=True)
    return report


def mp4_faststart(path: Path) -> bool:
    atoms = {}
    with path.open("rb") as stream:
        while stream.tell() < path.stat().st_size:
            offset = stream.tell()
            header = stream.read(8)
            if len(header) < 8:
                break
            size, kind = struct.unpack(">I4s", header)
            if size == 1:
                size = struct.unpack(">Q", stream.read(8))[0]
            elif size == 0:
                size = path.stat().st_size - offset
            if size < 8:
                raise ValueError(f"Invalid MP4 atom in {path}")
            atoms[kind] = offset
            stream.seek(offset + size)
    return atoms[b"moov"] < atoms[b"mdat"]


def inspect_video(ffmpeg: Path, path: Path, report_dir: Path) -> dict:
    """Decode every frame and inspect the input stream without an ffprobe install."""
    result = subprocess.run(
        [str(ffmpeg), "-hide_banner", "-nostats", "-progress", "pipe:1", "-threads", "2", "-i", str(path), "-map", "0:v:0", "-an", "-sn", "-dn", "-f", "null", "-"],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    log = result.stderr
    (report_dir / f"{path.name}.decode.log").write_text(log + "\n" + result.stdout, encoding="utf-8")
    frames = int(re.findall(r"^frame=(\d+)", result.stdout, flags=re.MULTILINE)[-1])
    duration = re.search(r"Duration: ([\d:.]+)", log).group(1)
    video_stream = re.search(r"Stream #[^\n]*?Video: ([^\n]+)", log).group(1)
    frame_rate = re.search(r", ([\d.]+) fps", video_stream).group(1)
    dimensions = re.search(r"(?:,|\s)(\d{2,})x(\d{2,})(?:[ ,\[])", video_stream)
    hours, minutes, seconds = [float(value) for value in duration.split(":")]
    report = {
        "frames": frames,
        "duration": duration,
        "durationSeconds": hours * 3600 + minutes * 60 + seconds,
        "fps": float(frame_rate),
        "width": int(dimensions.group(1)),
        "height": int(dimensions.group(2)),
        "audio": bool(re.search(r"Stream #0:\d+.*Audio:", log)),
        "bytes": path.stat().st_size,
        "pixelFormat": "yuv420p" if "yuv420p" in video_stream else video_stream,
    }
    return report


def verify_video(ffmpeg: Path, path: Path, source: dict, report_dir: Path) -> dict:
    report = inspect_video(ffmpeg, path, report_dir)
    tolerance = 1 / source["fps"] + 0.01
    if (report["frames"] != source["frames"]
            or abs(report["durationSeconds"] - source["durationSeconds"]) > tolerance
            or abs(report["fps"] - source["fps"]) > 0.01):
        raise ValueError(f"Timing changed: {path}: source={source}, output={report}")
    if report["audio"]:
        raise ValueError(f"Unexpected audio stream: {path}")
    if report["pixelFormat"] != "yuv420p":
        raise ValueError(f"Unexpected pixel format: {path}")
    if path.suffix == ".mp4":
        report["faststart"] = mp4_faststart(path)
        if not report["faststart"]:
            raise ValueError(f"MP4 metadata is not at start: {path}")
    return report


def save_poster(image: Image.Image, output_dir: Path, basename: str, extension: str, **options) -> dict:
    with tempfile.SpooledTemporaryFile(max_size=8 * 1024 * 1024) as buffer:
        image.save(buffer, **options)
        buffer.seek(0)
        data = buffer.read()
    output = output_dir / f"{basename}-{content_hash(data)}{extension}"
    output.write_bytes(data)
    return {"src": "/" + output.relative_to(PUBLIC).as_posix(), "bytes": len(data), "width": image.width, "height": image.height}


def optimize_posters(ffmpeg: Path, source: Path, output_dir: Path, report_dir: Path, desktop_width: int, mobile_poster_width: int, frames: int, mobile_poster_quality: int = 78) -> dict:
    """Use frame zero and the same uncropped aspect ratio for poster and video.

    The browser applies object-fit and object-position to both, so a narrow
    viewport does not jump from a pre-cropped poster to a different video crop.
    """
    frame_path = report_dir / "poster-first-frame.png"
    subprocess.run(
        [str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error", "-threads", "2", "-i", str(source), "-map", "0:v:0", "-vf", f"scale={desktop_width}:-2:flags=lanczos,setsar=1", "-frames:v", "1", "-update", "1", str(frame_path)],
        check=True, capture_output=True,
    )
    with Image.open(frame_path) as raw:
        desktop = raw.convert("RGB")
        mobile = desktop.resize((mobile_poster_width, round(desktop.height * mobile_poster_width / desktop.width)), Image.Resampling.LANCZOS)
        records = {
            "posterWebp": save_poster(desktop, output_dir, f"hero-rooftop-poster-{desktop.width}", ".webp", format="WEBP", quality=86, method=6),
            "posterJpg": save_poster(desktop, output_dir, f"hero-rooftop-poster-{desktop.width}", ".jpg", format="JPEG", quality=88, optimize=True, progressive=True),
            "posterMobile": save_poster(mobile, output_dir, f"hero-rooftop-poster-{mobile.width}", ".webp", format="WEBP", quality=mobile_poster_quality, method=6),
        }
    indices = [min(frames - 1, round(frames * index / 4)) for index in range(4)]
    selection = "+".join(f"eq(n,{index})" for index in indices)
    subprocess.run(
        [str(ffmpeg), "-y", "-hide_banner", "-loglevel", "error", "-threads", "2", "-i", str(source), "-vf", f"select='{selection}',scale=640:-2:flags=lanczos,tile=2x2", "-frames:v", "1", "-update", "1", str(report_dir / "source-contact-sheet.jpg")],
        check=True, capture_output=True,
    )
    return records


def optimize_videos(ffmpeg: Path, source: Path, report_dir: Path, webm_crf: int = 36, mp4_crf: int = 26, mobile_mp4_crf: int = 28, desktop_width: int = 1920, mobile_width: int = 1280, desktop_webm_only: bool = False, mobile_poster_width: int = 960, mobile_poster_quality: int = 78) -> dict:
    output_dir = PUBLIC / "hero/optimized"
    output_dir.mkdir(parents=True, exist_ok=True)
    report_dir.mkdir(parents=True, exist_ok=True)
    source = source.resolve(strict=True)
    source_report = {"path": str(source), "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), **inspect_video(ffmpeg, source, report_dir)}
    # Avoid upscaling and use even dimensions for browser-compatible yuv420p.
    desktop_width = min(desktop_width, source_report["width"]) // 2 * 2
    mobile_width = min(mobile_width, desktop_width) // 2 * 2
    mobile_poster_width = min(mobile_poster_width, desktop_width) // 2 * 2
    variants = [
        ("desktopWebm", desktop_width, ".webm", ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", str(webm_crf), "-deadline", "good", "-cpu-used", "4", "-row-mt", "1"]),
        ("desktopMp4", desktop_width, ".mp4", ["-c:v", "libx264", "-preset", "slow", "-crf", str(mp4_crf), "-movflags", "+faststart"]),
        ("mobileMp4", mobile_width, ".mp4", ["-c:v", "libx264", "-preset", "slow", "-crf", str(mobile_mp4_crf), "-movflags", "+faststart"]),
    ]
    records = {}
    if desktop_webm_only:
        previous = json.loads((report_dir / "video-report.json").read_text(encoding="utf-8"))
        if previous.get("source", {}).get("sha256") != source_report["sha256"]:
            raise ValueError("Source differs from the previous report; re-encode all variants")
        records = previous["variants"]
        variants = variants[:1]
    for key, width, extension, options in variants:
        basename = f"hero-rooftop-{width}"
        temporary_output = report_dir / (basename + extension)
        print(f"Encoding {key}: {width}px, {source_report['durationSeconds']} seconds at {source_report['fps']} fps; preserving all {source_report['frames']} frames", flush=True)
        result = subprocess.run(
            [str(ffmpeg), "-y", "-hide_banner", "-threads", "2", "-i", str(source), "-map", "0:v:0", "-an", "-sn", "-dn", "-map_metadata", "-1", "-vf", f"scale={width}:-2:flags=lanczos,setsar=1", *options, "-threads", "2", "-pix_fmt", "yuv420p", "-fps_mode", "passthrough", str(temporary_output)],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        (report_dir / f"{key}.encode.log").write_text(result.stderr, encoding="utf-8")
        verification = verify_video(ffmpeg, temporary_output, source_report, report_dir)
        data = temporary_output.read_bytes()
        output = output_dir / f"{basename}-{content_hash(data)}{extension}"
        output.write_bytes(data)
        records[key] = {"src": "/" + output.relative_to(PUBLIC).as_posix(), **verification}
        print(json.dumps({key: records[key]}, ensure_ascii=False), flush=True)

    posters = optimize_posters(ffmpeg, source, output_dir, report_dir, desktop_width, mobile_poster_width, source_report["frames"], mobile_poster_quality)
    report = {"source": source_report, "settings": {"webmCrf": webm_crf, "mp4Crf": mp4_crf, "mobileMp4Crf": mobile_mp4_crf, "desktopWidth": desktop_width, "mobileWidth": mobile_width, "mobilePosterWidth": mobile_poster_width, "mobilePosterQuality": mobile_poster_quality, "posterFrame": 0, "posterCrop": "none; match video object-fit/object-position"}, "variants": records, "posters": posters, "contactSheet": str(report_dir / "source-contact-sheet.jpg")}
    write_json(report_dir / "video-report.json", report)
    write_json(ROOT / "src/data/optimizedVideos.json", {
        **{key: value["src"] for key, value in records.items()},
        **{key: value["src"] for key, value in posters.items()},
        "posterWidth": posters["posterWebp"]["width"],
        "posterHeight": posters["posterWebp"]["height"],
        "posterMobileWidth": posters["posterMobile"]["width"],
        "posterMobileHeight": posters["posterMobile"]["height"],
    })
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", action="store_true", help="Create responsive project images and manifest")
    parser.add_argument("--videos", action="store_true", help="Create and verify optimized Hero videos")
    parser.add_argument("--video-source", type=Path, default=PUBLIC / "hero/hero-rooftop-loop-1080p.mp4", help="Original complete Hero loop to optimize; its timing is preserved")
    parser.add_argument("--report-dir", type=Path, default=REPORT_DIR, help="Directory for video metadata, decode logs, and visual contact sheet")
    parser.add_argument("--desktop-width", type=int, default=1920)
    parser.add_argument("--mobile-width", type=int, default=1280)
    parser.add_argument("--mobile-poster-width", type=int, default=960, help="Independent mobile poster width; preserves the video aspect ratio")
    parser.add_argument("--mobile-poster-quality", type=int, default=78, help="Mobile WebP poster quality (0-100)")
    parser.add_argument("--webm-crf", type=int, default=36, help="VP9 quality setting (0-63); higher means smaller")
    parser.add_argument("--mp4-crf", type=int, default=26, help="H.264 quality setting (0-51); higher means smaller")
    parser.add_argument("--mobile-mp4-crf", type=int, default=28, help="Mobile H.264 quality setting (0-51)")
    parser.add_argument("--desktop-webm-only", action="store_true", help="Re-encode only VP9 and keep existing MP4 records")
    parser.add_argument("--ffmpeg", type=Path, default=Path(os.environ.get("FFMPEG_BINARY", FFMPEG_DEFAULT)))
    args = parser.parse_args()
    if not (0 <= args.webm_crf <= 63 and 0 <= args.mp4_crf <= 51 and 0 <= args.mobile_mp4_crf <= 51):
        parser.error("CRF must be between 0-63 for WebM and 0-51 for MP4")
    if not 0 <= args.mobile_poster_quality <= 100:
        parser.error("Mobile poster quality must be between 0-100")
    if min(args.desktop_width, args.mobile_width, args.mobile_poster_width) < 2:
        parser.error("Video widths must be at least 2 pixels")
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    if not (args.images or args.videos):
        parser.error("Select --images, --videos, or both")
    if args.images:
        optimize_images()
    if args.videos:
        if not args.ffmpeg.is_file():
            raise FileNotFoundError("Provide an FFmpeg executable with --ffmpeg or FFMPEG_BINARY")
        optimize_videos(args.ffmpeg, args.video_source, args.report_dir, args.webm_crf, args.mp4_crf, args.mobile_mp4_crf, args.desktop_width, args.mobile_width, args.desktop_webm_only, args.mobile_poster_width, args.mobile_poster_quality)


if __name__ == "__main__":
    main()
