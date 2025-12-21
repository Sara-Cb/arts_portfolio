import { promises as fs } from "fs";
import path from "path";
import { imageSize } from "image-size"; // <-- nuovo

const ROOT = process.cwd();
const IMAGES_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(ROOT, "public", "projects");
const OUT_FILE = path.join(OUT_DIR, "_images-manifest.json");
const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function parseType(filename) {
  const name = filename.toLowerCase();
  if (name.startsWith("cover.")) return { type: "cover" };
  if (name.startsWith("profilo.")) return { type: "profilo" };
  if (name.startsWith("full.")) return { type: "full" };
  const m = name.match(/^dettaglio-(\d+)\./);
  if (m) return { type: "dettaglio", order: Number(m[1]) };
  return { type: "extra" };
}

function sortItems(a, b) {
  const rank = { cover: 0, profilo: 1, full: 2, dettaglio: 3, extra: 4 };
  const ra = rank[a.type] ?? 9,
    rb = rank[b.type] ?? 9;
  if (ra !== rb) return ra - rb;
  if (a.type === "dettaglio" && b.type === "dettaglio")
    return (a.order || 0) - (b.order || 0);
  return a.filename.localeCompare(b.filename);
}

async function walkCategory(category) {
  const catDir = path.join(IMAGES_DIR, category);
  let entries = [];
  try {
    entries = await fs.readdir(catDir, { withFileTypes: true });
  } catch {
    return {};
  }

  const result = {};
  for (const dirent of entries) {
    if (!dirent.isDirectory()) continue;
    const projectId = dirent.name;
    const projDir = path.join(catDir, projectId);
    const files = await fs.readdir(projDir);

    const items = [];
    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase();
      if (!ALLOWED.has(ext)) continue;

      const filePath = path.join(projDir, filename);
      let width, height;
      try {
        const dim = imageSize(filePath);
        width = dim?.width || undefined;
        height = dim?.height || undefined;
      } catch {
        /* noop */
      }

      const meta = parseType(filename);
      const url = `/images/${category}/${projectId}/${filename}`;
      items.push({ url, filename, ...meta, width, height });
    }

    items.sort(sortItems);
    if (items.length) {
      const cover =
        items.find((i) => i.type === "cover")?.url || items[0]?.url || null;
      result[projectId] = { cover, items };
    }
  }
  return result;
}

const manifest = {
  materical: await walkCategory("materical"),
  visual: await walkCategory("visual"),
  _generatedAt: new Date().toISOString(),
};

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(OUT_FILE, JSON.stringify(manifest, null, 2), "utf8");
console.log(`[manifest] written ${OUT_FILE}`);
