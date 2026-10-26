/**
 * Verify the reviewed portfolio import and its production image delivery.
 *
 *   node scripts/verify-curated-portfolio.mjs
 *   node scripts/verify-curated-portfolio.mjs --base-url https://example.com
 *
 * Reads image headers rather than decoding image pixels. No source artwork is
 * changed. A network run records every HEAD result, including failed requests.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED = { projects: 30, sourceFiles: 217, displays: 291 };
const errors = [];
const warnings = [];
const metadataCache = new Map();

function check(condition, message) {
  if (!condition) errors.push(message);
  return Boolean(condition);
}

function readJson(relative) {
  const absolute = path.join(ROOT, relative);
  try {
    return JSON.parse(fs.readFileSync(absolute, "utf8").replace(/^\uFEFF/, ""));
  } catch (error) {
    throw new Error(`Cannot read ${relative}: ${error.message}. Finish the curated import before verification.`);
  }
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function publicPath(url, directory = "public") {
  if (typeof url !== "string" || !url.startsWith("/") || url.includes("\\") || /[?#]/.test(url)) {
    throw new Error(`Invalid local asset URL: ${JSON.stringify(url)}`);
  }
  const target = path.resolve(ROOT, directory, `.${url}`);
  const base = path.resolve(ROOT, directory);
  if (!target.startsWith(`${base}${path.sep}`)) throw new Error(`Asset escapes ${directory}: ${url}`);
  return target;
}

function parseDimensions(buffer, filename) {
  if (buffer.length >= 24 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    for (let offset = 12; offset + 8 <= buffer.length;) {
      const chunk = buffer.toString("ascii", offset, offset + 4);
      const length = buffer.readUInt32LE(offset + 4);
      const data = offset + 8;
      if (chunk === "VP8X" && data + 10 <= buffer.length) {
        return { width: buffer.readUIntLE(data + 4, 3) + 1, height: buffer.readUIntLE(data + 7, 3) + 1 };
      }
      if (chunk === "VP8 " && data + 10 <= buffer.length && buffer.subarray(data + 3, data + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
        return { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff };
      }
      if (chunk === "VP8L" && data + 5 <= buffer.length && buffer[data] === 0x2f) {
        const bits = buffer.readUInt32LE(data + 1);
        return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
      }
      offset = data + length + (length % 2);
    }
  }
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    let offset = 2;
    while (offset + 4 <= buffer.length) {
      if (buffer[offset] !== 0xff) break;
      while (buffer[offset] === 0xff) offset += 1;
      const marker = buffer[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > buffer.length) break;
      const length = buffer.readUInt16BE(offset);
      if (length < 2) break;
      if (startOfFrame.has(marker) && offset + 7 <= buffer.length) {
        return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
      }
      offset += length;
    }
  }
  throw new Error(`Cannot read image dimensions from header: ${filename}`);
}

function inspectImage(url) {
  if (metadataCache.has(url)) return metadataCache.get(url);
  const filename = publicPath(url);
  const stat = fs.statSync(filename);
  if (!stat.isFile() || stat.size === 0) throw new Error(`Missing or empty image: ${url}`);
  const descriptor = fs.openSync(filename, "r");
  let dimensions;
  try {
    // ICC metadata normally fits in 64 KiB. Retry a larger header only when
    // necessary; even a very long JPEG is never decoded or read in full.
    for (const limit of [65536, 1048576]) {
      const buffer = Buffer.alloc(Math.min(stat.size, limit));
      const bytesRead = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
      try {
        dimensions = parseDimensions(buffer.subarray(0, bytesRead), url);
        break;
      } catch (error) {
        if (limit === 1048576 || stat.size <= limit) throw error;
      }
    }
  } finally {
    fs.closeSync(descriptor);
  }
  if (!positiveInteger(dimensions?.width) || !positiveInteger(dimensions?.height)) throw new Error(`Invalid image dimensions: ${url}`);
  const result = { ...dimensions, bytes: stat.size };
  metadataCache.set(url, result);
  return result;
}

function verifyImage(url, expectedSize, context) {
  try {
    const actual = inspectImage(url);
    if (expectedSize) {
      check(actual.width === expectedSize.width && actual.height === expectedSize.height,
        `${context}: declared ${expectedSize.width}×${expectedSize.height}, actual ${actual.width}×${actual.height}: ${url}`);
    }
    return actual;
  } catch (error) {
    errors.push(`${context}: ${error.message}`);
    return null;
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(filename) : entry.isFile() ? [filename] : [];
  });
}

function verifyNoLegacy(directory) {
  const absolute = path.join(ROOT, directory);
  const forbidden = walkFiles(absolute)
    .map((filename) => path.relative(absolute, filename).split(path.sep).join("/"))
    .filter((relative) => /^(?:works\/|optimized\/works\/|hero\/covers\/|portfolio\/(?:page-|contact-sheet(?:[.-]|$)))/i.test(relative));
  check(forbidden.length === 0,
    `${directory} still contains ${forbidden.length} old work assets: ${forbidden.slice(0, 8).join(", ")}${forbidden.length > 8 ? " …" : ""}. Remove them from the published tree and rebuild.`);
}

function scaledSize(width, height, limit) {
  const factor = Math.min(1, limit / width, 16000 / height, 16000 / width);
  return { width: Math.max(1, Math.round(width * factor)), height: Math.max(1, Math.round(height * factor)) };
}

function parseArguments() {
  const args = process.argv.slice(2);
  if (args.length === 0) return null;
  if (args.length !== 2 || args[0] !== "--base-url") throw new Error("Usage: node scripts/verify-curated-portfolio.mjs [--base-url https://example.com]");
  const base = new URL(args[1]);
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("--base-url must use http:// or https://");
  return base;
}

function verifyStatic() {
  const projects = readJson("src/data/curatedProjects.json");
  const images = readJson("src/data/curatedImages.json");
  const covers = readJson("src/data/curatedCovers.json");
  const inventory = readJson("docs/content/curated-inventory-2026-10-26.json");
  const plan = readJson("docs/content/curated-plan-2026-10-26.json");
  const videos = readJson("src/data/optimizedVideos.json");
  if (!Array.isArray(projects) || !Array.isArray(inventory.files) || !Array.isArray(inventory.sourceDisplays) || !Array.isArray(inventory.assets)) {
    throw new Error("Curated projects and inventory arrays are malformed.");
  }
  const categories = new Map(plan.categories.map((category) => [category.slug, category.label]));
  const projectMap = new Map(projects.map((project) => [project.slug, project]));
  check(projects.length === EXPECTED.projects && projectMap.size === EXPECTED.projects, `Expected ${EXPECTED.projects} unique projects; found ${projects.length} records / ${projectMap.size} unique slugs.`);
  check(inventory.projectCount === projects.length, `Inventory projectCount ${inventory.projectCount} differs from metadata count ${projects.length}.`);
  check(inventory.sourceFileCount === EXPECTED.sourceFiles && inventory.files.length === EXPECTED.sourceFiles, `Expected ${EXPECTED.sourceFiles} source files; inventory declares ${inventory.sourceFileCount} and contains ${inventory.files.length}.`);
  check(inventory.displayCount === EXPECTED.displays && inventory.sourceDisplays.length === EXPECTED.displays, `Expected ${EXPECTED.displays} unique displays; inventory declares ${inventory.displayCount} and contains ${inventory.sourceDisplays.length}.`);
  const sourceMap = new Map(inventory.files.map((file) => [file.file, file]));
  check(sourceMap.size === inventory.files.length, "Inventory repeats a source file.");
  const displayMap = new Map(inventory.sourceDisplays.map((display) => [display.image, display]));
  check(displayMap.size === inventory.sourceDisplays.length, "Inventory repeats a generated display URL.");
  const assets = new Map(inventory.assets.map((asset) => [asset.image, asset]));
  check(assets.size === inventory.assets.length && inventory.assetCount === assets.size, "Inventory assetCount or duplicate asset URLs disagree with its assets list.");
  check(inventory.assetBytes === inventory.assets.reduce((total, asset) => total + asset.bytes, 0), "Inventory assetBytes does not equal the assets byte sum.");
  const planProjects = new Map(plan.projects.map((project) => [project.slug, project]));
  const allImages = [];
  for (const project of projects) {
    const context = `Project ${project.slug}`;
    check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug), `${context}: invalid slug.`);
    for (const key of ["title", "summary", "description"]) check(typeof project[key] === "string" && project[key].trim().length > 0, `${context}: missing ${key}.`);
    check(!/^(?:作品\s*\d+|设计展示)$/.test(project.title), `${context}: generic placeholder title.`);
    check(categories.has(project.categorySlug) && categories.get(project.categorySlug) === project.category && project.type === project.category, `${context}: category/type does not match the reviewed classification.`);
    check(project.year === "", `${context}: year must remain empty unless the reviewed source explicitly establishes and authorizes a year; found ${JSON.stringify(project.year)}.`);
    const planned = planProjects.get(project.slug);
    check(Boolean(planned), `${context}: absent from reviewed plan.`);
    if (planned) for (const key of ["title", "summary", "description", "categorySlug"]) check(project[key] === planned[key], `${context}: ${key} differs from reviewed plan.`);
    if (!Array.isArray(project.images) || project.images.length === 0) {
      errors.push(`${context}: no display images.`);
      continue;
    }
    const expectedImages = inventory.sourceDisplays.filter((display) => display.project === project.slug).map((display) => display.image);
    check(JSON.stringify(project.images) === JSON.stringify(expectedImages), `${context}: image order/count differs from inventory sourceDisplays.`);
    check(new Set(project.images).size === project.images.length, `${context}: duplicate gallery image URL.`);
    check(project.images.includes(project.cover) && project.image === project.cover, `${context}: cover must occur once among its display images.`);
    allImages.push(...project.images);
    const cover = covers[project.slug];
    if (!cover) {
      errors.push(`${context}: cover/hero-thumbnail metadata is missing.`);
    } else {
      for (const [key, size] of [["src", { width: 960, height: 540 }], ["thumbSrc", { width: 320, height: 400 }], ["smallThumbSrc", { width: 160, height: 200 }]]) {
        check(assets.has(cover[key]), `${context}: ${key} is absent from inventory.assets: ${cover[key]}`);
        verifyImage(cover[key], size, `${context} ${key}`);
      }
      check(cover.width === 960 && cover.height === 540, `${context}: cover dimensions must be 960×540.`);
    }
  }
  check(allImages.length === EXPECTED.displays && new Set(allImages).size === EXPECTED.displays, `Project images must map one-to-one to ${EXPECTED.displays} displays; found ${allImages.length} / ${new Set(allImages).size} unique.`);
  check(Object.keys(images).length === EXPECTED.displays && Object.keys(images).every((url) => displayMap.has(url)), "curatedImages keys do not exactly match inventory sourceDisplays.");
  check(Object.keys(covers).length === projects.length && Object.keys(covers).every((slug) => projectMap.has(slug)), "curatedCovers keys do not exactly match the current projects.");

  for (const display of inventory.sourceDisplays) {
    const context = `Display ${display.project} #${display.index} (${display.file}${display.page ? ` page ${display.page}` : ""})`;
    const source = sourceMap.get(display.file);
    check(source?.status === "project" && source.project === display.project, `${context}: source assignment does not match inventory.files.`);
    check(positiveInteger(display.sourceWidth) && positiveInteger(display.sourceHeight), `${context}: missing original dimensions.`);
    const image = images[display.image];
    if (!image) {
      errors.push(`${context}: missing curatedImages entry ${display.image}`);
      continue;
    }
    check(image.src === display.image, `${context}: manifest key and src differ.`);
    check(typeof image.aspectRatio === "number" && Math.abs(image.aspectRatio - display.sourceWidth / display.sourceHeight) < 0.000001, `${context}: incorrect original aspectRatio.`);
    verifyImage(image.src, { width: image.width, height: image.height }, context);
    verifyImage(image.smallSrc, { width: image.smallWidth, height: image.smallHeight }, `${context} small`);
    verifyImage(image.largeSrc, null, `${context} large`);
    for (const key of ["src", "smallSrc", "largeSrc"]) check(assets.has(image[key]), `${context}: ${key} absent from inventory.assets: ${image[key]}`);
    const prefix = `/selected/${display.project}/image-${String(display.index).padStart(3, "0")}-`;
    for (const width of [800, 1600, 2400]) {
      const expected = scaledSize(display.sourceWidth, display.sourceHeight, width);
      const variants = [...assets.keys()].filter((url) => url.startsWith(`${prefix}${expected.width}-`) && url.endsWith(".webp"));
      check(variants.length > 0, `${context}: missing ${width}px variant (expected encoded width ${expected.width}).`);
      for (const url of variants) {
        // Pillow and JavaScript differ only in tie rounding; manifest/header
        // equality is exact, while expected resize rounding allows one pixel.
        const actual = verifyImage(url, null, `${context} ${width}px variant`);
        if (actual) check(Math.abs(actual.width - expected.width) <= 1 && Math.abs(actual.height - expected.height) <= 1, `${context}: incorrect ${width}px variant dimensions ${actual.width}×${actual.height}, expected about ${expected.width}×${expected.height}.`);
      }
    }
    if (display.sourceWidth > 16383 || display.sourceHeight > 16383) {
      check(/\.jpe?g$/i.test(image.largeSrc), `${context}: long image requires original-size JPEG link.`);
      verifyImage(image.largeSrc, { width: display.sourceWidth, height: display.sourceHeight }, `${context} original-size long image`);
    }
  }
  for (const source of inventory.files) {
    if (source.status !== "project") continue;
    const actual = inventory.sourceDisplays.filter((display) => display.file === source.file).map((display) => ({ ...(display.page ? { page: display.page } : {}), image: display.image }));
    check(JSON.stringify(source.displays) === JSON.stringify(actual), `Source ${source.file}: displays differ from sourceDisplays.`);
  }
  for (const category of inventory.categories) {
    check(category.count === projects.filter((project) => project.categorySlug === category.slug).length, `Category ${category.slug}: incorrect inventory count ${category.count}.`);
  }
  const necessary = [
    "/optimized/logo-liwei-mark-d0d9b6c835bc-160.webp",
    videos.posterWebp,
    "/hero/about-profile.webp",
  ];
  for (const url of necessary) verifyImage(url, null, "Required non-work image");
  for (const [url, asset] of assets) {
    const actual = verifyImage(url, null, "Inventory asset");
    if (actual) check(actual.bytes === asset.bytes, `Asset byte count differs: ${url}, inventory ${asset.bytes}, actual ${actual.bytes}.`);
  }
  verifyNoLegacy("public");
  const distExists = fs.existsSync(path.join(ROOT, "dist/index.html"));
  if (distExists) {
    verifyNoLegacy("dist");
    for (const url of [...assets.keys(), ...necessary]) {
      const filename = publicPath(url, "dist");
      check(fs.existsSync(filename), `Built asset missing: dist${url}. Run npm run build after the latest import.`);
    }
  } else {
    warnings.push("dist/index.html is absent; build-output legacy and asset checks were skipped. Run npm run build and verify again before deployment.");
  }
  return { projects, inventory, assets, necessary, distChecked: distExists };
}

async function verifyNetwork(baseUrl, state) {
  const paths = [...new Set([...state.assets.keys(), ...state.necessary])];
  const results = new Array(paths.length);
  let cursor = 0;
  async function worker() {
    while (cursor < paths.length) {
      const index = cursor++;
      const assetPath = paths[index];
      const url = new URL(assetPath, baseUrl).href;
      const started = Date.now();
      const result = { path: assetPath, url, ok: false };
      try {
        const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(20000) });
        result.status = response.status;
        result.contentType = response.headers.get("content-type") ?? "";
        result.contentLength = response.headers.get("content-length");
        result.finalUrl = response.url;
        const mediaType = result.contentType.split(";", 1)[0].trim().toLowerCase();
        const expectedType = /\.(mp4|webm)$/i.test(assetPath) ? "video/" : "image/";
        result.ok = response.status >= 200 && response.status < 300 && mediaType.startsWith(expectedType);
        if (!result.ok) result.error = `Expected 2xx ${expectedType}*, received ${response.status} ${result.contentType || "(no Content-Type)"}${mediaType.includes("html") ? " (SPA fallback or login page)" : ""}`;
      } catch (error) {
        result.error = `${error.name}: ${error.message}`;
      }
      result.elapsedMs = Date.now() - started;
      results[index] = result;
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, paths.length) }, () => worker()));
  const failed = results.filter((result) => !result.ok);
  const report = {
    checkedAt: new Date().toISOString(), baseUrl: baseUrl.href, method: "HEAD", concurrency: 6,
    assetCount: results.length, passed: results.length - failed.length, failed: failed.length,
    results,
  };
  const host = baseUrl.host.replace(/[^a-zA-Z0-9.-]/g, "_");
  const relative = `.tmp/refresh-20261026/${host}-asset-check.json`;
  const filename = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  for (const result of failed) errors.push(`HTTP ${result.path}: ${result.error}`);
  console.log(`HTTP: ${report.passed}/${report.assetCount} assets passed; report: ${relative}`);
}

async function main() {
  const baseUrl = parseArguments();
  const state = verifyStatic();
  console.log(`Static: ${state.projects.length} projects / ${state.inventory.files.length} source files / ${state.inventory.sourceDisplays.length} displays / ${state.assets.size} assets; dist ${state.distChecked ? "checked" : "not built"}.`);
  if (baseUrl) await verifyNetwork(baseUrl, state);
  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
  if (errors.length) {
    console.error(`\nFAILED: ${errors.length} verification issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log("PASS: curated metadata, provenance, image headers, variants, covers and legacy-asset checks are consistent.");
  }
}

main().catch((error) => {
  console.error(`FAILED: ${error.message}`);
  process.exitCode = 1;
});
