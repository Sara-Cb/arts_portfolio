/**
 * Gallery: caricamento manifest immagini e idratazione gallery progetti.
 *
 * Manifest immagini:
 * - Generato build-time da build-images-manifest.mjs
 * - Scansiona public/images/{category}/{projectId}/
 * - Estrae dimensioni width/height con image-size package
 * - Struttura: {category: {projectId: {cover, items: [{url, type, width, height}]}}}
 *
 * Idratazione progetti:
 * - Aggiunge gallery.items[] con dimensioni/ratio/orientation a ogni progetto
 * - Calcola orientation da ratio (landscape ≥1.15, portrait ≤0.85, square default)
 * - Genera alt text descrittivi per accessibilità
 *
 * Cache-bust: usa __BUILD_TIME__ per forzare reload manifest post-deploy
 */

let _manifestCache = null;

// ========== MANIFEST LOADING ==========
// Carica manifest con cache in-memory, cache-bust query param da buildTimeVar
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

// ========== ALT TEXT GENERATION ==========
// Genera testo alternativo descrittivo in base a tipo immagine per accessibilità
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

// Determina orientamento da aspect ratio
function orientationFromRatio(ratio) {
  if (!ratio) return "square";
  if (ratio >= 1.15) return "landscape";
  if (ratio <= 0.85) return "portrait";
  return "square";
}

// ========== IDRATAZIONE PROGETTI ==========
// Unisce dati progetti da JSON con metadata immagini da manifest
// Aggiunge gallery.items[] completi di width/height/ratio/orientation/alt
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
          orientation,
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

// ========== GALLERY ON-DEMAND ==========
// Ottiene gallery per singolo progetto senza caricare tutto lo store
// Utile per caricamenti asincroni o preview
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

// ========== FALLBACK RUNTIME DIMENSIONS ==========
// Misura dimensioni immagini runtime se mancanti da manifest
// Usato come fallback se manifest non contiene dimensioni (deployment issues, cache stale, etc)
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
