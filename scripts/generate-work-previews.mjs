import { readFile, writeFile } from "node:fs/promises";

// Keep the overview lightweight: full image metadata stays in the lazy case-study bundle.
const dataDirectory = new URL("../src/data/", import.meta.url);
const [projects, images, covers] = await Promise.all([
  readFile(new URL("curatedProjects.json", dataDirectory), "utf8").then(JSON.parse),
  readFile(new URL("curatedImages.json", dataDirectory), "utf8").then(JSON.parse),
  readFile(new URL("curatedCovers.json", dataDirectory), "utf8").then(JSON.parse),
]);
const previews = {};
for (const project of projects) {
  if (covers[project.slug]?.layout === "triptych") continue;
  const hoverNumber = covers[project.slug]?.hoverImageNumber;
  const source = hoverNumber === undefined
    ? project.images.find((src) => src !== project.cover)
    : [...new Set([project.cover, ...project.images])][hoverNumber - 1];
  const image = images[source];
  if (hoverNumber !== undefined && !image) throw new Error(`Invalid hoverImageNumber for ${project.slug}`);
  if (image) previews[project.slug] = {
    smallSrc: image.smallSrc,
    smallWidth: image.smallWidth,
    smallHeight: image.smallHeight,
  };
}
await writeFile(new URL("workPreviews.json", dataDirectory), `${JSON.stringify(previews, null, 2)}\n`);
console.log(`Prepared hover previews for ${Object.keys(previews).length} projects.`);
