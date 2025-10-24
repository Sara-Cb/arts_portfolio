// src/stores/projects.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Store progetti
 * - Legge due JSON in /public/projects: materical.json, visual.json
 * - Normalizza: slug, paths immagini, cover
 * - Espone: liste per categoria + lookup by (category, slug)
 */

export const useProjectsStore = defineStore("projects", () => {
  const loaded = ref(false);
  const loading = ref(false);
  const error = ref(null);

  const byCategory = ref({
    materical: [],
    visual: [],
  });

  const indexBySlug = ref({
    materical: new Map(),
    visual: new Map(),
  });

  // ---------- utils ----------
  const slugify = (s = "") =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");

  const cleanPathSegment = (s = "") =>
    String(s)
      .trim()
      .replace(/\s*\/\s*/g, "/") // rimuovi spazi attorno a "/"
      .replace(/\/{2,}/g, "/"); // niente // doppi

  const resolveImageSrc = (baseDir, src) => {
    if (!src) return null;
    const cleaned = cleanPathSegment(src);
    if (cleaned.startsWith("http") || cleaned.startsWith("/")) return cleaned;
    return cleanPathSegment(`${baseDir}/${cleaned}`);
  };

  const normalizeProject = (raw, category) => {
    const id = raw.id ? slugify(raw.id) : slugify(raw.title || "");
    const baseImgDir = `/images/${category}/${id}`;

    const imgs = Array.isArray(raw.imgs)
      ? raw.imgs
          .map((img) => {
            if (!img) return null;
            if (typeof img === "string") {
              return {
                src: resolveImageSrc(baseImgDir, img),
                alt: raw.title || id,
              };
            }
            if (typeof img === "object" && img.src) {
              return {
                src: resolveImageSrc(baseImgDir, img.src),
                alt: img.alt || raw.title || id,
              };
            }
            return null;
          })
          .filter(Boolean)
      : [];

    const cover = raw.cover
      ? resolveImageSrc(baseImgDir, raw.cover)
      : imgs[0]?.src || null;

    return {
      id,
      slug: id,
      category,
      title: raw.title || "",
      subtitle: raw.subtitle || "",
      date: raw.date || null,
      materials: raw.materials || raw.technics || [],
      cover,
      imgs,
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      description: raw.description || raw.desc || "",
      ...raw, // mantieni eventuali campi extra
    };
  };

  const loadCategory = async (category, jsonPath) => {
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error(`Fetch failed: ${jsonPath} (${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error(`Invalid JSON format for ${category}: expected array`);
    }

    const normalized = data.map((raw) => normalizeProject(raw, category));

    // dedup slug + sort (date desc, poi titolo)
    const seen = new Set();
    for (const p of normalized) {
      if (seen.has(p.slug)) {
        console.warn(`[projects] slug duplicato in ${category}: "${p.slug}"`);
      }
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

  // ---------- load API ----------
  async function ensureLoaded() {
    if (loaded.value || loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        loadCategory("materical", "/projects/materical.json"),
        loadCategory("visual", "/projects/visual.json"),
      ]);
      loaded.value = true;
    } catch (e) {
      console.error("[projects] load error:", e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  // ---------- getters ----------
  const all = computed(() => [
    ...byCategory.value.materical,
    ...byCategory.value.visual,
  ]);

  const matericals = computed(() => byCategory.value.materical);
  const visuals = computed(() => byCategory.value.visual);

  function getByCategory(category) {
    return byCategory.value[category] || [];
  }
  function getOne(category, slug) {
    const map = indexBySlug.value[category];
    return map ? map.get(slug) || null : null;
  }
  const getMaterical = (slug) => getOne("materical", slug);
  const getVisual = (slug) => getOne("visual", slug);

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
  };
});
