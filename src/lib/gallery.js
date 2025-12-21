// helper unico per leggere il manifest immagini, costruire alt,
// idratare i progetti con gallery e (opzionale) misurare dimensioni runtime

let _manifestCache = null;

/** leggere il manifest con cache in memoria */
export async function getImagesManifest(base = "/", buildTimeVar) {
  if (_manifestCache) return _manifestCache;
  const baseClean = (base || "/").replace(/\/+$/, "");
  const v = typeof buildTimeVar !== "undefined" ? `?v=${buildTimeVar}` : "";
  const url = `${baseClean}/projects/_images-manifest.json${v}`;
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`images manifest fetch failed: ${url}`);
  _manifestCache = await res.json();
  return _manifestCache;
}

/** generare alt coerenti in base al tipo */
export function buildAlt(title, item) {
  switch (item.type) {
    case "cover":
      return `${title} — cover`;
    case "profilo":
      return `${title} — ritratto/verticale`;
    case "full":
      return `${title} — vista completa`;
    case "dettaglio":
      return `${title} — dettaglio${item.order ? " " + item.order : ""}`;
    default:
      return title || "";
  }
}
function orientationFromRatio(ratio) {
  if (!ratio) return "square";
  if (ratio >= 1.15) return "landscape";
  if (ratio <= 0.85) return "portrait";
  return "square";
}

export async function attachGalleriesToProjects(
  byCategory,
  { base = "/", buildTimeVar } = {}
) {
  const mf = await getImagesManifest(base, buildTimeVar);

  const hydrateCategory = (category) => {
    const arr = byCategory[category] || [];
    for (const p of arr) {
      const entry = mf?.[category]?.[p.id];
      if (!entry) {
        p.gallery = { cover: p.cover || null, items: [] };
        continue;
      }

      const items = (entry.items || []).map((it) => {
        const ratio = it.width && it.height ? it.width / it.height : null;
        const orientation = orientationFromRatio(ratio);
        return {
          ...it,
          alt: `${p.title || p.id}${
            it.type === "dettaglio"
              ? it.order
                ? ` — dettaglio ${it.order}`
                : " — dettaglio"
              : it.type
              ? ` — ${it.type}`
              : ""
          }`,
          title: p.title || p.id,
          ratio,
          orientation, // <- portrait|landscape|square
        };
      });

      const cover = entry.cover || items[0]?.url || p.cover || null;
      p.gallery = { cover, items };
      p.cover = cover;
    }
  };

  hydrateCategory("materical");
  hydrateCategory("visual");
  return byCategory;
}

// anche getProjectGallery, se lo usi, aggiungi ratio+orientation
export async function getProjectGallery(
  category,
  projectId,
  projectTitle,
  { base = "/", buildTimeVar } = {}
) {
  const mf = await getImagesManifest(base, buildTimeVar);
  const entry = mf?.[category]?.[projectId];
  if (!entry) return { cover: null, items: [] };

  const items = (entry.items || []).map((it) => {
    const ratio = it.width && it.height ? it.width / it.height : null;
    return {
      ...it,
      alt: `${projectTitle || projectId}${
        it.type === "dettaglio"
          ? it.order
            ? ` — dettaglio ${it.order}`
            : " — dettaglio"
          : it.type
          ? ` — ${it.type}`
          : ""
      }`,
      title: projectTitle || projectId,
      ratio,
      orientation: orientationFromRatio(ratio),
    };
  });

  const cover = entry.cover || items[0]?.url || null;
  return { cover, items };
}

/** misurare dimensioni runtime se mancanti (fallback) */
export async function ensureItemDimensions(items) {
  if (!Array.isArray(items) || !items.length) return items;

  const missing = items.filter((i) => !i.width || !i.height);
  if (!missing.length) return items;

  await Promise.all(
    missing.map((it) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          it.width = img.naturalWidth;
          it.height = img.naturalHeight;
          it.ratio = it.width && it.height ? it.width / it.height : null;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = it.url;
      });
    })
  );

  return items;
}
