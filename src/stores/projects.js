// src/stores/projects.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { attachGalleriesToProjects, getProjectGallery } from "@/lib/gallery";

export const useProjectsStore = defineStore("projects", () => {
  // stato
  const loaded = ref(false);
  const loading = ref(false);
  const error = ref(null);

  // dati
  const byCategory = ref({ materical: [], visual: [] });
  const indexBySlug = ref({ materical: new Map(), visual: new Map() });

  // base url
  const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

  // utils minime
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
      .replace(/\s*\/\s*/g, "/")
      .replace(/\/{2,}/g, "/");

  const resolveCoverSrc = (category, id, src) => {
    if (!src) return null;
    const cleaned = cleanPathSegment(src);
    if (cleaned.startsWith("http") || cleaned.startsWith("/")) return cleaned;
    return cleanPathSegment(`/images/${category}/${id}/${cleaned}`);
  };

  const withBase = (p) => {
    if (!p) return BASE + "/";
    if (p.startsWith("http")) return p;
    return `${BASE}/${p.replace(/^\/+/, "")}`;
  };

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

  // normalizzazione progetto (senza imgs)
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
      cover: coverFromJson || null,
      videos: Array.isArray(raw.videos) ? raw.videos : [],
      description: raw.description || raw.desc || "",
      ...raw,
      gallery: { cover: coverFromJson || null, items: [] }, // idratazione successiva
    };
  };

  // caricare e indicizzare
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

  // load complessivo
  async function ensureLoaded() {
    if (loaded.value || loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        loadCategory("materical", "projects/materical.json"),
        loadCategory("visual", "projects/visual.json"),
      ]);
      // idrata le gallery (usa helper; può includere width/height dal manifest)
      await attachGalleriesToProjects(byCategory.value, {
        base: BASE,
        buildTimeVar:
          typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : undefined,
      });
      loaded.value = true;
    } catch (e) {
      console.error("[projects] load error:", e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  }

  // getters
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

  // export
  return {
    loaded,
    loading,
    error,
    ensureLoaded,
    all,
    matericals,
    visuals,
    getByCategory,
    getOne,
    getMaterical,
    getVisual,
    // pass-through utile se vuoi ottenere gallery “on demand”
    getProjectGallery: (category, id, title) =>
      getProjectGallery(category, id, title, {
        base: BASE,
        buildTimeVar:
          typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : undefined,
      }),
  };
});
