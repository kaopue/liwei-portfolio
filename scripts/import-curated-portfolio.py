"""Import the reviewed local portfolio plan without modifying source artwork.

Run with the system Python (Pillow and PyMuPDF are required)::

    python scripts/import-curated-portfolio.py --source "F:\\作品集  精选文件" \
        --plan docs/content/curated-plan-2026-10-26.json

The plan, complete source hashes, image/page provenance and hashed assets form
an auditable import. No source file or pre-existing public asset is deleted.
JSON manifests are replaced only after the complete import succeeds.
"""

from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
import hashlib
from io import BytesIO
import json
from pathlib import Path, PurePosixPath
import re
import sys
import tempfile
from typing import Any

from PIL import Image, ImageCms, ImageOps

try:
    import pymupdf
except ImportError:
    pymupdf = None


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
INVENTORY = ROOT / "docs/content/curated-inventory-2026-10-26.json"
RASTER_TYPES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}
Image.MAX_IMAGE_PIXELS = None
SRGB = ImageCms.createProfile("sRGB")
SRGB_BYTES = ImageCms.ImageCmsProfile(SRGB).tobytes()
PIPELINE = "curated-v1-srgb-white-webp-88-90-90-jpeg94"


class ImportFailure(Exception):
    pass


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha256(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def normalized_relative(value: Any) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ImportFailure(f"Expected a relative file path, received {value!r}")
    path = PurePosixPath(value.replace("\\", "/"))
    if path.is_absolute() or ":" in value or ".." in path.parts:
        raise ImportFailure(f"Source paths must stay within --source: {value}")
    return path.as_posix()


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() == data:
        return
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(data)
        temporary.replace(path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def write_json(path: Path, data: Any) -> None:
    atomic_write(path, (json.dumps(data, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))


@dataclass(frozen=True)
class Display:
    project: str
    file: str
    index: int
    page: int | None = None


def prepare(source: Path, plan: dict[str, Any]) -> tuple[list[dict], list[dict], dict, dict, dict]:
    if not source.is_dir():
        raise ImportFailure(f"Source directory does not exist: {source}")
    source_files = sorted((p for p in source.rglob("*") if p.is_file()), key=lambda p: p.relative_to(source).as_posix())
    actual = {p.relative_to(source).as_posix(): p for p in source_files}
    lookup = {name.casefold(): name for name in actual}
    if len(lookup) != len(actual):
        raise ImportFailure("Source contains file names that differ only by case")

    def canonical(value: Any) -> str:
        name = normalized_relative(value)
        if name.casefold() not in lookup:
            raise ImportFailure(f"Plan references a missing source file: {name}")
        result = lookup[name.casefold()]
        if not actual[result].resolve().is_relative_to(source):
            raise ImportFailure(f"Source link points outside --source: {result}")
        return result

    categories = plan.get("categories")
    projects = plan.get("projects")
    if not isinstance(categories, list) or not categories or not isinstance(projects, list) or not projects:
        raise ImportFailure("Plan must contain non-empty categories and projects arrays")
    labels = {}
    for category in categories:
        slug = category.get("slug", "")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or slug in labels:
            raise ImportFailure(f"Invalid or duplicate category slug: {slug!r}")
        if not isinstance(category.get("label"), str) or not category["label"].strip():
            raise ImportFailure(f"Missing category label: {slug}")
        labels[slug] = category["label"]

    assignments = {}
    seen_slugs = set()
    for project in projects:
        slug = project.get("slug", "")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or slug in seen_slugs:
            raise ImportFailure(f"Invalid or duplicate project slug: {slug!r}")
        seen_slugs.add(slug)
        for key in ("title", "summary", "description"):
            if not isinstance(project.get(key), str) or not project[key].strip():
                raise ImportFailure(f"Missing {key} in {slug}")
        if project.get("categorySlug") not in labels:
            raise ImportFailure(f"Unknown category for {slug}: {project.get('categorySlug')}")
        if not isinstance(project.get("files"), list) or not project["files"]:
            raise ImportFailure(f"No source files assigned to {slug}")
        project["files"] = [canonical(name) for name in project["files"]]
        project["coverFile"] = canonical(project.get("coverFile"))
        if project["coverFile"] not in project["files"]:
            raise ImportFailure(f"Cover is not assigned to its project: {slug}")
        for name in project["files"]:
            if name in assignments:
                raise ImportFailure(f"Unexpected repeated source assignment: {name} ({assignments[name]} / {slug})")
            if actual[name].suffix.lower() not in RASTER_TYPES | {".pdf"}:
                raise ImportFailure(f"Unsupported display source: {name}; provide an explicit exclusion if it is a duplicate")
            assignments[name] = slug
        project["skipPages"] = {canonical(name): pages for name, pages in project.get("skipPages", {}).items()}
        for name, pages in project["skipPages"].items():
            if name not in project["files"] or actual[name].suffix.lower() != ".pdf":
                raise ImportFailure(f"skipPages must reference a PDF in the same project: {name}")
            if not isinstance(pages, list) or any(not isinstance(n, int) or n < 1 for n in pages) or len(pages) != len(set(pages)):
                raise ImportFailure(f"skipPages must contain unique one-based page numbers: {name}")
        tags = project.get("tags", [])
        if not isinstance(tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in tags):
            raise ImportFailure(f"Invalid tags: {slug}")
        if "priority" in project and not isinstance(project["priority"], (int, float)):
            raise ImportFailure(f"Invalid priority: {slug}")

    exclusions = {}
    for exclusion in plan.get("exclusions", []):
        name = canonical(exclusion.get("file"))
        represented = exclusion.get("representedBy")
        if isinstance(represented, dict):
            represented = {**represented, "file": canonical(represented.get("file"))}
        else:
            represented = canonical(represented)
        if name in assignments or name in exclusions:
            raise ImportFailure(f"File is assigned more than once or is also excluded: {name}")
        if not isinstance(exclusion.get("reason"), str) or not exclusion["reason"].strip():
            raise ImportFailure(f"Every excluded source needs a review reason: {name}")
        exclusions[name] = {"file": name, "representedBy": represented, "reason": exclusion["reason"]}

    missing = sorted(set(actual) - assignments.keys() - exclusions.keys())
    if missing:
        raise ImportFailure("Source files missing from plan:\n  " + "\n  ".join(missing))
    for name, exclusion in exclusions.items():
        represented = exclusion["representedBy"]
        target = represented["file"] if isinstance(represented, dict) else represented
        visited = {name}
        while target in exclusions:
            if target in visited:
                raise ImportFailure(f"Cyclic duplicate mapping involving {name}")
            visited.add(target)
            represented = exclusions[target]["representedBy"]
            target = represented["file"] if isinstance(represented, dict) else represented
        if target not in assignments:
            raise ImportFailure(f"Duplicate must resolve to a displayed source: {name}")

    inventory = []
    included_hashes = {}
    for name, path in actual.items():
        digest = file_sha256(path)
        record = {"file": name, "sha256": digest, "bytes": path.stat().st_size, "extension": path.suffix.lower()}
        if name in assignments:
            if digest in included_hashes:
                raise ImportFailure(f"Exact duplicate sources both assigned for display: {included_hashes[digest]} / {name}")
            included_hashes[digest] = name
            record.update(status="project", project=assignments[name])
        else:
            record.update(status="duplicate", **{key: value for key, value in exclusions[name].items() if key != "file"})
        inventory.append(record)
    return projects, inventory, labels, actual, exclusions


def srgb_image(path: Path) -> tuple[Image.Image, dict]:
    with Image.open(path) as raw:
        raw.load()
        original_mode = raw.mode
        icc = raw.info.get("icc_profile")
        oriented = ImageOps.exif_transpose(raw)
        alpha = oriented.getchannel("A") if "A" in oriented.getbands() else None
        if alpha is None and "transparency" in oriented.info:
            alpha = oriented.convert("RGBA").getchannel("A")
        color = oriented
        if color.mode not in ("RGB", "CMYK", "L", "LAB"):
            color = color.convert("RGB")
        if icc:
            try:
                source_profile = ImageCms.ImageCmsProfile(BytesIO(icc))
                color = ImageCms.profileToProfile(color, source_profile, SRGB, outputMode="RGB", renderingIntent=0)
                conversion = "embedded ICC to sRGB"
            except (ImageCms.PyCMSError, ValueError, OSError) as error:
                raise ImportFailure(f"Cannot convert embedded color profile for {path.name}: {error}") from error
        else:
            color = color.convert("RGB")
            conversion = "RGB assumed sRGB" if original_mode != "CMYK" else "unprofiled CMYK converted by Pillow"
        if alpha is not None:
            white = Image.new("RGB", color.size, "white")
            white.paste(color, (0, 0), alpha)
            color = white
        return color.copy(), {"sourceMode": original_mode, "colorConversion": conversion, "flattenedOnWhite": alpha is not None}


def pdf_image(path: Path, page_number: int, width: int = 2400) -> Image.Image:
    if pymupdf is None:
        raise ImportFailure("PyMuPDF is required for PDF sources. Run this script with the system Python that has pymupdf installed.")
    with pymupdf.open(path) as document:
        page = document[page_number - 1]
        if page.rect.width <= 0 or page.rect.height <= 0:
            raise ImportFailure(f"Invalid PDF page size: {path.name} page {page_number}")
        scale = width / page.rect.width
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), colorspace=pymupdf.csRGB, alpha=False)
        return Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)


def expand_displays(projects: list[dict], actual: dict[str, Path]) -> tuple[list[Display], dict]:
    displays = []
    pdf_records = {}
    for project in projects:
        index = 0
        for name in project["files"]:
            if actual[name].suffix.lower() != ".pdf":
                index += 1
                displays.append(Display(project["slug"], name, index))
                continue
            if pymupdf is None:
                raise ImportFailure("PDF source found but PyMuPDF is unavailable; use the system Python")
            with pymupdf.open(actual[name]) as document:
                count = document.page_count
            skipped = set(project["skipPages"].get(name, []))
            if any(n > count for n in skipped) or len(skipped) >= count:
                raise ImportFailure(f"Invalid skipPages for {name}: PDF contains {count} pages")
            # A deterministic raster fingerprint catches identical PDF pages
            # even when their underlying drawing objects or metadata differ.
            fingerprints = {}
            unique_pages = []
            duplicate_pages = []
            page_hashes = {}
            for page in range(1, count + 1):
                preview = pdf_image(actual[name], page, width=1200)
                digest = sha256(f"{preview.width}x{preview.height}:".encode() + preview.tobytes())
                page_hashes[page] = digest
                preview.close()
                if page not in skipped:
                    if digest in fingerprints:
                        duplicate_pages.append({"page": page, "representedByPage": fingerprints[digest], "reason": "identical rendered PDF page"})
                    else:
                        fingerprints[digest] = page
                        unique_pages.append(page)
            for page in sorted(skipped):
                represented = fingerprints.get(page_hashes[page])
                if represented is None:
                    raise ImportFailure(f"Planned duplicate PDF page {page} has no identical displayed page in {name}")
                duplicate_pages.append({"page": page, "representedByPage": represented, "reason": "reviewed duplicate PDF page"})
            if not unique_pages:
                raise ImportFailure(f"No unique PDF pages remain for {name}")
            pdf_records[name] = {"pageCount": count, "displayedPages": unique_pages, "duplicatePages": sorted(duplicate_pages, key=lambda item: item["page"])}
            for page in unique_pages:
                index += 1
                displays.append(Display(project["slug"], name, index, page))
    return displays, pdf_records


def hashed_asset(directory: Path, stem: str, image: Image.Image, format_name: str, **options: Any) -> tuple[str, int]:
    output = BytesIO()
    image.save(output, format=format_name, icc_profile=SRGB_BYTES, **options)
    data = output.getvalue()
    extension = "jpg" if format_name == "JPEG" else "webp"
    target = directory / f"{stem}-{sha256(data)[:12]}.{extension}"
    atomic_write(target, data)
    return "/" + target.relative_to(PUBLIC).as_posix(), len(data)


def variant(image: Image.Image, max_width: int) -> Image.Image:
    scale = min(1, max_width / image.width, 16000 / image.height, 16000 / image.width)
    width, height = max(1, round(image.width * scale)), max(1, round(image.height * scale))
    return image.copy() if image.size == (width, height) else image.resize((width, height), Image.Resampling.LANCZOS)


def make_display(display: Display, actual: dict[str, Path]) -> dict:
    if display.page is None:
        image, color_info = srgb_image(actual[display.file])
    else:
        image = pdf_image(actual[display.file], display.page)
        color_info = {"sourceMode": "PDF", "colorConversion": "PyMuPDF device RGB", "flattenedOnWhite": True}
    try:
        original_size = image.size
        directory = PUBLIC / "selected" / display.project
        variants = {}
        assets = {}
        for width, quality in ((800, 88), (1600, 90), (2400, 90)):
            resized = variant(image, width)
            url, byte_count = hashed_asset(directory, f"image-{display.index:03}-{resized.width}", resized, "WEBP", quality=quality, method=4)
            variants[width] = {"src": url, "width": resized.width, "height": resized.height}
            assets[url] = byte_count
            resized.close()
        large = variants[2400]["src"]
        if image.width > 16383 or image.height > 16383:
            if max(image.size) > 65500:
                raise ImportFailure(f"Image exceeds JPEG encoder limits for original-size long view: {display.file}")
            large, byte_count = hashed_asset(directory, f"image-{display.index:03}-full-{image.width}", image, "JPEG", quality=94, subsampling=0, optimize=True)
            assets[large] = byte_count
        primary, small = variants[1600], variants[800]
        record = {
            "src": primary["src"], "smallSrc": small["src"],
            "width": primary["width"], "height": primary["height"],
            "smallWidth": small["width"], "smallHeight": small["height"],
            "largeSrc": large, "aspectRatio": original_size[0] / original_size[1],
        }
        source_display = {"file": display.file, "project": display.project, "image": primary["src"], "index": display.index, "sourceWidth": original_size[0], "sourceHeight": original_size[1], **color_info}
        if display.page is not None:
            source_display["page"] = display.page
        return {"display": display, "manifest": record, "sourceDisplay": source_display, "assets": assets}
    finally:
        image.close()


def cover_image(project: dict, actual: dict[str, Path], pdf_records: dict) -> tuple[Image.Image, Image.Image, dict]:
    name = project["coverFile"]
    if actual[name].suffix.lower() == ".pdf":
        page = project.get("coverPage", 1)
        if not isinstance(page, int) or not 1 <= page <= pdf_records[name]["pageCount"]:
            raise ImportFailure(f"Invalid coverPage for {project['slug']}")
        image = pdf_image(actual[name], page)
    else:
        page = None
        image, _ = srgb_image(actual[name])
    treatment = {"file": name, "mode": "contain"}
    if page is not None:
        treatment["page"] = page
    # Optional normalized crop is for reviewed spread covers. Full source
    # artwork remains untouched in the gallery and full-size viewer.
    crop = project.get("coverCrop")
    if crop is not None and crop != "top":
        if not isinstance(crop, list) or len(crop) != 4 or any(not isinstance(n, (int, float)) or n < 0 or n > 1 for n in crop):
            raise ImportFailure(f"coverCrop must be four normalized 0..1 coordinates: {project['slug']}")
        left, top, right, bottom = crop
        if left >= right or top >= bottom:
            raise ImportFailure(f"Empty coverCrop: {project['slug']}")
        cropped = image.crop((round(left * image.width), round(top * image.height), round(right * image.width), round(bottom * image.height)))
        image.close()
        image = cropped
        treatment.update(mode="reviewed crop then contain", crop=crop)
    elif crop == "top" or image.height / image.width >= 3.2:
        region_height = min(image.height, max(720, round(image.width * 1.2)))
        cropped = image.crop((0, 0, image.width, region_height))
        image.close()
        image = cropped
        treatment.update(mode="long image top section then contain", regionHeight=region_height)
    scale = min(1, 960 / image.width, 540 / image.height)
    resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (960, 540), "white")
    canvas.paste(resized, ((960 - resized.width) // 2, (540 - resized.height) // 2))
    resized.close()
    if project["categorySlug"] in {"brand-identity", "type-design"}:
        # Letterforms and marks need their full geometry at small sizes.
        portrait = Image.new("RGB", (320, 400), "white")
        mark = ImageOps.contain(image, (320, 400), Image.Resampling.LANCZOS)
        portrait.paste(mark, ((320 - mark.width) // 2, (400 - mark.height) // 2))
        mark.close()
    else:
        portrait = ImageOps.fit(image, (320, 400), Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    image.close()
    return canvas, portrait, treatment


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--plan", required=True, type=Path)
    parser.add_argument("--workers", type=int, default=2, help="Parallel image workers, 1..4 (default: 2)")
    parser.add_argument("--check-only", action="store_true", help="Validate coverage and PDF duplicate mappings without writing outputs")
    args = parser.parse_args()
    if not 1 <= args.workers <= 4:
        raise ImportFailure("--workers must be between 1 and 4")
    source = args.source.resolve()
    plan_path = args.plan if args.plan.is_absolute() else ROOT / args.plan
    plan_bytes = plan_path.read_bytes()
    plan = json.loads(plan_bytes.decode("utf-8-sig"))
    projects, inventory, labels, actual, exclusions = prepare(source, plan)
    displays, pdf_records = expand_displays(projects, actual)
    print(f"Validated {len(actual)} source files, {len(projects)} projects, {len(displays)} unique image/page displays, {len(exclusions)} duplicate source mappings.", flush=True)
    if args.check_only:
        return

    image_manifest = {}
    results = []
    assets = {}
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        for count, result in enumerate(executor.map(lambda display: make_display(display, actual), displays), 1):
            image_manifest[result["manifest"]["src"]] = result["manifest"]
            assets.update(result["assets"])
            results.append(result)
            if count == 1 or count % 10 == 0 or count == len(displays):
                print(f"Prepared {count}/{len(displays)} images", flush=True)

    covers = {}
    cover_sources = {}
    for project in projects:
        image, portrait, treatment = cover_image(project, actual, pdf_records)
        try:
            url, byte_count = hashed_asset(PUBLIC / "selected" / project["slug"], "cover-960", image, "WEBP", quality=90, method=4)
            thumbnail_fields = {}
            for width, height, field in ((320, 400, "thumbSrc"), (160, 200, "smallThumbSrc")):
                thumbnail = portrait.resize((width, height), Image.Resampling.LANCZOS)
                thumbnail_url, thumbnail_bytes = hashed_asset(PUBLIC / "selected" / project["slug"], f"cover-{width}", thumbnail, "WEBP", quality=88, method=4)
                thumbnail.close()
                thumbnail_fields[field] = thumbnail_url
                assets[thumbnail_url] = thumbnail_bytes
        finally:
            image.close()
            portrait.close()
        covers[project["slug"]] = {"src": url, "width": 960, "height": 540, **thumbnail_fields}
        cover_sources[project["slug"]] = {**treatment, "image": url}
        assets[url] = byte_count

    records = []
    for index, project in enumerate(projects):
        slug = project["slug"]
        category = labels[project["categorySlug"]]
        images = [result["manifest"]["src"] for result in results if result["display"].project == slug]
        matching = [result for result in results if result["display"].project == slug and result["display"].file == project["coverFile"]]
        if actual[project["coverFile"]].suffix.lower() == ".pdf":
            page = project.get("coverPage", 1)
            aliases = {item["page"]: item["representedByPage"] for item in pdf_records[project["coverFile"]]["duplicatePages"]}
            page = aliases.get(page, page)
            matching = [result for result in matching if result["display"].page == page]
        if not matching:
            raise ImportFailure(f"Cannot resolve displayed cover source: {slug}")
        cover = matching[0]["manifest"]["src"]
        records.append({
            "title": project["title"], "slug": slug, "category": category,
            "categorySlug": project["categorySlug"], "year": "", "image": cover,
            "cover": cover, "summary": project["summary"], "description": project["description"],
            "tags": project.get("tags") or [category], "detailSections": [], "images": images,
            "type": category, "featured": index < 8, "priority": project.get("priority", index + 1),
        })

    source_displays = [result["sourceDisplay"] for result in results]
    for record in inventory:
        if record["status"] == "project":
            record["displays"] = [{key: item[key] for key in ("page", "image") if key in item} for item in source_displays if item["file"] == record["file"]]
            if record["file"] in pdf_records:
                record.update(pdf_records[record["file"]])
    counts = [{**category, "count": sum(project["categorySlug"] == category["slug"] for project in projects)} for category in plan["categories"]]
    report = {
        "formatVersion": 1, "pipeline": PIPELINE, "sourceRoot": str(source),
        "plan": plan_path.relative_to(ROOT).as_posix() if plan_path.is_relative_to(ROOT) else str(plan_path),
        "planSha256": sha256(plan_bytes), "sourceFileCount": len(actual),
        "projectCount": len(records), "displayCount": len(source_displays),
        "duplicateSourceCount": len(exclusions), "assetCount": len(assets),
        "assetBytes": sum(assets.values()), "categories": counts,
        "files": inventory, "sourceDisplays": source_displays,
        "coverSources": cover_sources,
        "assets": [{"image": url, "bytes": count} for url, count in sorted(assets.items())],
    }
    if len(inventory) != len(actual) or len({record["file"] for record in inventory}) != len(actual):
        raise ImportFailure("Internal audit failed: source inventory does not match all source files")
    for url in assets:
        if not (PUBLIC / url.lstrip("/")).is_file():
            raise ImportFailure(f"Generated asset is missing: {url}")
    write_json(ROOT / "src/data/curatedProjects.json", records)
    write_json(ROOT / "src/data/curatedImages.json", image_manifest)
    write_json(ROOT / "src/data/curatedCovers.json", covers)
    write_json(INVENTORY, report)
    print(f"Import complete: {len(records)} projects / {len(source_displays)} displays / {len(actual)} source files fully accounted for / {sum(assets.values()) / 1048576:.2f} MiB generated.", flush=True)


if __name__ == "__main__":
    try:
        main()
    except (ImportFailure, OSError, ValueError) as error:
        print(f"Import failed: {error}", file=sys.stderr)
        raise SystemExit(1)
