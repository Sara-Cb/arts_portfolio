// seed deterministico (FNV-1a) + PRNG semplice ma riproducibile
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  // xorshift32
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}
const byType = (items) => ({
  cover: items.find((i) => i.type === "cover") || null,
  full: items.find((i) => i.type === "full") || null,
  profilo: items.find((i) => i.type === "profilo") || null,
  dettagli: items.filter((i) => i.type === "dettaglio"),
  extra: items.filter(
    (i) => !["cover", "full", "profilo", "dettaglio"].includes(i.type)
  ),
});

/**
 * Scelta layout deterministica, con fallback robusti per dataset corti.
 * Ritorna { name, slots: Array<{kind, images: []}> }
 */
export function chooseLayout(projectId, items) {
  const seed = hashStr(projectId || "");
  const rand = rng(seed);

  // sicurezza: niente undefined, niente buchi
  const flat = (items || []).filter(Boolean);
  if (!flat.length) return { name: "empty", slots: [] };

  const t = byType(flat);
  const gallery = {
    cover: t.cover || flat[0],
    full: t.full,
    profilo: t.profilo,
    dettagli: t.dettagli,
    rest: flat.filter(
      (i) =>
        i !== t.cover &&
        i !== t.full &&
        i !== t.profilo &&
        !t.dettagli.includes(i)
    ),
  };

  // helper per “prendere” un certo numero, senza errori
  const take = (arr, n) => arr.slice(0, Math.max(0, n));

  // PATTERN 1 — full hero + due griglie di dettagli
  if (gallery.full && gallery.dettagli.length >= 2) {
    return {
      name: "full+grid-dettagli",
      slots: [
        { kind: "hero", images: [gallery.full] },
        { kind: "grid-2", images: take(gallery.dettagli, 2) },
        {
          kind: "strip",
          images: take(gallery.dettagli.slice(2).concat(gallery.rest), 3),
        },
      ],
    };
  }

  // PATTERN 2 — profilo grande a sinistra + pila di dettagli
  if (gallery.profilo && gallery.dettagli.length + gallery.rest.length >= 1) {
    return {
      name: "profilo+stack-dettagli",
      slots: [
        { kind: "left-big", images: [gallery.profilo] },
        {
          kind: "stack",
          images: take(gallery.dettagli.concat(gallery.rest), 4),
        },
      ],
    };
  }

  // PATTERN 3 — cover + grid + stack (default elegante)
  if (flat.length >= 4 && rand() < 0.6) {
    const afterHero = flat.filter((i) => i !== gallery.cover);
    return {
      name: "cover+grid",
      slots: [
        { kind: "hero", images: [gallery.cover] },
        { kind: "grid-3", images: take(afterHero, 3) },
        { kind: "stack", images: take(afterHero.slice(3), 3) },
      ],
    };
  }

  // PATTERN 4 — masonry (per tante immagini diverse)
  if (flat.length >= 5) {
    return {
      name: "masonry",
      slots: [{ kind: "masonry", images: take(flat, 8) }],
    };
  }

  // PATTERN 5 — mini fallback per dataset corti (1–3 img)
  if (flat.length === 1) {
    return { name: "solo-hero", slots: [{ kind: "hero", images: [flat[0]] }] };
  }
  if (flat.length === 2) {
    return { name: "grid-2-min", slots: [{ kind: "grid-2", images: flat }] };
  }
  // length === 3
  return {
    name: "grid-3-min",
    slots: [{ kind: "grid-3", images: flat }],
  };
}
