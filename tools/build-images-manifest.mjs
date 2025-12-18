import { promises as fs } from "fs";
import path from "path";

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
    const items = files
      .filter((f) => ALLOWED.has(path.extname(f).toLowerCase()))
      .map((filename) => {
        const meta = parseType(filename);
        const url = `/images/${category}/${projectId}/${filename}`;
        return { url, filename, ...meta };
      })
      .sort(sortItems);

    if (items.length) {
      const cover = items.find((i) => i.type === "cover") || items[0];
      result[projectId] = { cover: cover?.url || null, items };
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
