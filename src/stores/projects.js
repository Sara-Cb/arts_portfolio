// src/stores/projects.js
// Store Pinia per progetti + immagini (manifest statico)

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useProjectsStore = defineStore("projects", () => {
  // stato di caricamento globale
  const loaded = ref(false);
  const loading = ref(false);
  const error = ref(null);

  // collezioni per categoria e indice rapido per slug
  const byCategory = ref({ materical: [], visual: [] });
  const indexBySlug = ref({ materical: new Map(), visual: new Map() });

  // base url per deploy in sottocartelle
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

  // ----------------------------------------
  // utility base
  // ----------------------------------------

  // normalizzare stringhe in slug
  const slugify = (s = "") =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");

  // pulizia path
  const cleanPathSegment = (s = "") =>
    String(s)
      .trim()
      .replace(/\s*\/\s*/g, "/")
      .replace(/\/{2,}/g, "/");

  // comporre URL rispettando BASE_URL
  function withBase(p) {
    if (!p) return BASE + "/";
    if (p.startsWith("http")) return p;
    const clean = p.replace(/^\/+/, "");
    return `${BASE}/${clean}`;
  }

  // fetch JSON con controlli minimi
  async function fetchJsonSafe(pathLike) {
    const url = withBase(pathLike);
    const res = await fetch(url, { cache: "no-cache" });
    const ct = res.headers.get("content-type") || "";
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} on ${url}\n${text.slice(0, 120)}`);
    }
    if (ct.includes("html")) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Expected JSON but got HTML at ${url}\nPreview: ${text.slice(0, 120)}…`
      );
    }
    return res.json();
  }

  // risolvere cover dal baseDir progetto (solo se presente in JSON)
  const resolveCoverSrc = (category, id, src) => {
    if (!src) return null;
    const cleaned = cleanPathSegment(src);
    if (cleaned.startsWith("http") || cleaned.startsWith("/")) return cleaned;
    return cleanPathSegment(`/images/${category}/${id}/${cleaned}`);
  };

  // ----------------------------------------
  // normalizzazione progetto (senza imgs)
  // ----------------------------------------

  // creare oggetto progetto coerente dal JSON (senza imgs)
  const normalizeProject = (raw, category) => {
    const id = raw.id ? slugify(raw.id) : slugify(raw.title || "");
    const coverFromJson = resolveCoverSrc(category, id, raw.cover);

    return {
      id,
      slug: id,
      category,
      title: raw.title || "",
      subtitle: raw.subtitle || "",
      date: raw.date || null,
      materials: raw.materials || raw.technics || [],
      cover: coverFromJson || null, // sarà sovrascritta dall’idratazione manifest
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      description: raw.description || raw.desc || "",
      ...raw,
      // contenitore immagini idratate dal manifest
      gallery: { cover: coverFromJson || null, items: [] },
    };
  };

  // ----------------------------------------
  // caricamento liste progetti per categoria
  // ----------------------------------------

  // leggere il JSON di categoria, normalizzare e indicizzare
  const loadCategory = async (category, jsonPath) => {
    const data = await fetchJsonSafe(jsonPath);
    if (!Array.isArray(data))
      throw new Error(`Invalid JSON format for ${category}: expected array`);

    const normalized = data.map((raw) => normalizeProject(raw, category));

    const seen = new Set();
    for (const p of normalized) {
      if (seen.has(p.slug))
        console.warn(`[projects] slug duplicato in ${category}: "${p.slug}"`);
      seen.add(p.slug);
    }

    normalized.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      if (db !== da) return db - da;
      return a.title.localeCompare(b.title);
    });

    byCategory.value[category] = normalized;
    indexBySlug.value[category] = new Map(normalized.map((p) => [p.slug, p]));
  };

  // ----------------------------------------
  // manifest immagini (generato in build)
  // ----------------------------------------

  // cache locale del manifest
  let _imagesManifest = null;

  // ottenere il manifest con cache-busting opzionale
  async function getImagesManifest() {
    if (_imagesManifest) return _imagesManifest;
    const v =
      typeof __BUILD_TIME__ !== "undefined" ? `?v=${__BUILD_TIME__}` : "";
    const url = `${BASE}/projects/_images-manifest.json${v}`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`images manifest fetch failed: ${url}`);
    _imagesManifest = await res.json();
    return _imagesManifest;
  }

  // generare alt coerenti in base al tipo
  function buildAlt(title, item) {
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

  // idratare i progetti con le immagini dal manifest
  async function attachGalleriesToProjects() {
    const mf = await getImagesManifest();

    const hydrate = (category) => {
      const arr = byCategory.value[category] || [];
      for (const p of arr) {
        const entry = mf?.[category]?.[p.id];
        if (!entry) {
          p.gallery = { cover: p.cover || null, items: [] };
          continue;
        }
        const items = (entry.items || []).map((it) => ({
          ...it,
          alt: buildAlt(p.title || p.id, it),
          title: p.title || p.id,
        }));
        const cover = entry.cover || items[0]?.url || p.cover || null;

        p.gallery = { cover, items };
        p.cover = cover;
      }
    };

    hydrate("materical");
    hydrate("visual");
  }

  // ottenere la galleria puntuale da manifest
  async function getProjectGallery(category, projectId, projectTitle) {
    const mf = await getImagesManifest();
    const entry = mf?.[category]?.[projectId];
    if (!entry) return { cover: null, items: [] };
    const items = (entry.items || []).map((it) => ({
      ...it,
      alt: buildAlt(projectTitle || projectId, it),
      title: projectTitle || projectId,
    }));
    const cover = entry.cover || items[0]?.url || null;
    return { cover, items };
  }

  // ----------------------------------------
  // API di caricamento complessivo
  // ----------------------------------------

  // caricare progetti e idratare immagini una sola volta
  async function ensureLoaded() {
    if (loaded.value || loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        loadCategory("materical", "projects/materical.json"),
        loadCategory("visual", "projects/visual.json"),
      ]);
      await attachGalleriesToProjects();
      loaded.value = true;
    } catch (e) {
      console.error("[projects] load error:", e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  // ----------------------------------------
  // getters
  // ----------------------------------------

  // lista completa
  const all = computed(() => [
    ...byCategory.value.materical,
    ...byCategory.value.visual,
  ]);

  // liste per categoria
  const matericals = computed(() => byCategory.value.materical);
  const visuals = computed(() => byCategory.value.visual);

  // ottenere progetti per categoria
  function getByCategory(category) {
    return byCategory.value[category] || [];
  }

  // ottenere singolo progetto per categoria/slug
  function getOne(category, slug) {
    const map = indexBySlug.value[category];
    return map ? map.get(slug) || null : null;
  }

  // scorciatoie
  const getMaterical = (slug) => getOne("materical", slug);
  const getVisual = (slug) => getOne("visual", slug);

  // ----------------------------------------
  // export API
  // ----------------------------------------
  return {
    // state
    loaded,
    loading,
    error,

    // load
    ensureLoaded,

    // data
    all,
    matericals,
    visuals,
    getByCategory,
    getOne,
    getMaterical,
    getVisual,

    // immagini
    getProjectGallery,
  };
});
