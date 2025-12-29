/**
 * Layout Chooser: genera layout grid responsive e deterministico per gallery.
 *
 * Sistema di packing automatico 12x12 con logica di:
 * - Seeding deterministico (stessi input → stesso layout sempre)
 * - Span variabili in base a orientamento immagine (landscape/portrait/square)
 * - Boost dimensioni tile quando poche immagini (gallerie piccole = tile grandi)
 * - Inserimento blocco testo tra immagini per leggibilità
 * - Jitter allineamento orizzontale (left/center/right) per variare ritmo visivo
 * - Grow phase post-packing: espande tile per riempire vuoti adiacenti
 *
 * Flow:
 * 1. Normalizza input e shuffle deterministico
 * 2. Decora items con span/size/classes basate su orientation
 * 3. Packing: posiziona su griglia 12x12 con fallback dimensioni ridotte
 * 4. Grow: espande tile nei vuoti adiacenti per layout denso
 */

// ========== SEEDING E RANDOM DETERMINISTICO ==========
// Hash FNV-1a per generare seed numerico da stringa (es. projectId)
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
// RNG xorshift: genera valori 0..1 deterministici partendo da seed
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

// ========== DIMENSIONAMENTO TILE ==========
// Calcola span x/y in base a orientamento immagine + size + boost per gallerie piccole
// landscape 6x4, portrait 4x6, square 4x5 (base), poi aggiustamenti per sm/lg e boost
function spanFor(node, boost = 0) {
  const size = node.size || "md";
  const ori = node.orientation || "square";
  let x = ori === "landscape" ? 6 : ori === "portrait" ? 4 : 4;
  let y = ori === "landscape" ? 4 : ori === "portrait" ? 6 : 5;
  if (size === "sm") {
    x--;
    y--;
  }
  if (size === "lg") {
    x++;
    y++;
  }
  x += boost;
  y += boost;
  x = Math.min(9, Math.max(3, x));
  y = Math.min(9, Math.max(3, y));
  return { x, y };
}

// ========== PACKING: PUNTI DI ANCORAGGIO ==========
// Genera lista punti [col, row] sparsi uniformemente su griglia 12x12
// Prima distribuisce su griglia sqrt(N)xsqrt(N), poi riempie con tutte le celle
// Questo evita clustering e migliora distribuzione visiva
function anchors(W, H, N) {
  const cols = Math.max(2, Math.round(Math.sqrt(N)));
  const rows = Math.max(2, Math.round(Math.sqrt(N)));
  const stepX = Math.max(1, Math.floor(W / cols));
  const stepY = Math.max(1, Math.floor(H / rows));
  const a = [];
  for (let r = 1; r <= H; r += stepY) {
    for (let c = 1; c <= W; c += stepX) {
      a.push([c, r]);
    }
  }
  for (let r = 1; r <= H; r++) {
    for (let c = 1; c <= W; c++) {
      a.push([c, r]);
    }
  }
  return a;
}

// ========== PACKING: COLLISION DETECTION ==========
// Verifica se rettangolo (c,r,w,h) entra in griglia senza sovrapporsi a celle occupate
function fits(grid, W, H, c, r, w, h) {
  if (c + w - 1 > W || r + h - 1 > H) return false;
  for (let y = r; y < r + h; y++) {
    for (let x = c; x < c + w; x++) {
      if (grid[y][x]) return false;
    }
  }
  return true;
}
// Marca celle della griglia come occupate dal rettangolo
function place(grid, c, r, w, h) {
  for (let y = r; y < r + h; y++) {
    for (let x = c; x < c + w; x++) {
      grid[y][x] = 1;
    }
  }
}

// ========== ALLINEAMENTO ORIZZONTALE VARIATO ==========
// Genera allineamento left/center/right deterministico per ogni tile
// Usa hash di projectId+url per garantire stabilità ma variare tra tile
function jitterAlign(seedStr) {
  const seed = hashStr(seedStr || "");
  const r = (seed % 1000) / 1000;
  if (r < 0.33) return "left";
  if (r < 0.66) return "right";
  return "center";
}

// ========== DECORAZIONE ITEMS ==========
// Genera classi CSS, span, size per ogni item (immagine o blocco testo)
// Cover diventa lg, ogni 5° elemento diventa sm se galleria grande (7+ items)
// Allineamento variato per ritmo visivo
function decorateItems(items, coverUrl, boost, projectId = "") {
  return items.map((it, idx) => {
    const isText = it.kind === "text";

    let size = isText ? it.size || "md" : "md";
    if (!isText) {
      if (it.url === coverUrl) size = "lg";
      else if (items.length >= 7 && (idx + 1) % 5 === 0) size = "sm";
    }

    const { x, y } = spanFor({ ...it, size }, boost);

    let alignClass = "";
    if (!isText) {
      const key = `${projectId}__${it.url || it.filename || idx}`;
      const a = jitterAlign(key);
      alignClass =
        a === "left" ? "align-left" : a === "right" ? "align-right" : "";
    }

    const classes = [
      isText ? "tile tile--text" : "img",
      !isText && it.orientation ? `img--${it.orientation}` : null,
      `size-${size}`,
      `span-x-${x}`,
      `span-y-${y}`,
      alignClass,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ...it,
      size,
      spanX: x,
      spanY: y,
      classes,
    };
  });
}

// ========== FUNZIONE PRINCIPALE ==========
/**
 * Genera layout automatico per gallery progetto.
 *
 * Input:
 * - projectId: per seeding deterministico
 * - images: array item gallery con url/type/orientation
 * - options.textBlock: blocco descrizione/materiali da inserire tra immagini
 *
 * Output:
 * - Layout object con slots contenenti items posizionati (startC, startR, spanX, spanY, style, classes)
 *
 * Fasi:
 * 1. Shuffle deterministico immagini
 * 2. Inserimento blocco testo dopo cover/full
 * 3. Decorazione items (size, span, classes)
 * 4. Packing su griglia 12x12 con fallback dimensioni ridotte
 * 5. Grow phase: espansione tiles in vuoti adiacenti
 */
export function chooseLayout(projectId, images, options = {}) {
  const seed = hashStr(projectId || "");
  const rand = rng(seed);

  const textNode =
    options?.textBlock && (options.textBlock.html || options.textBlock.text)
      ? {
          kind: "text",
          html: options.textBlock.html,
          text: options.textBlock.text,
          size: options.textBlock.size || "md",
        }
      : null;

  const flat = Array.isArray(images) ? [...images] : [];
  if (!flat.length && !textNode) return { name: "empty", slots: [] };

  const coverUrl =
    flat.find((i) => i.type === "cover")?.url ||
    flat.find((i) => i.type === "full")?.url ||
    flat[0]?.url;

  flat.sort(() => (rand() < 0.5 ? -1 : 1));

  // ========== INSERIMENTO BLOCCO TESTO ==========
  // Posiziona testo dopo cover/full per leggibilità, altrimenti all'inizio
  const list = [];
  let placedText = false;
  flat.forEach((it) => {
    list.push(it);
    if (
      textNode &&
      !placedText &&
      (it.url === coverUrl || it.type === "full")
    ) {
      list.push(textNode);
      placedText = true;
    }
  });
  if (textNode && !placedText) list.unshift(textNode);

  // ========== BOOST DIMENSIONI PER GALLERIE PICCOLE ==========
  // Gallerie con pochi item ottengono tile più grandi per riempire lo spazio
  const total = list.length;
  const boost = total <= 2 ? 3 : total <= 4 ? 2 : total <= 6 ? 1 : 0;

  const decorated = decorateItems(list, coverUrl, boost, projectId);

  // ========== PACKING SU GRIGLIA 12x12 ==========
  const W = 12,
    H = 12;
  const grid = Array.from({ length: H + 1 }, () => Array(W + 1).fill(0));
  const starter = anchors(W, H, decorated.length);

  const placed = [];
  for (const node of decorated) {
    const w = node.spanX,
      h = node.spanY;
    let done = false;

    // Tentativo 1: dimensione proposta
    for (const [c, r] of starter) {
      if (fits(grid, W, H, c, r, w, h)) {
        place(grid, c, r, w, h);
        placed.push({
          ...node,
          startC: c,
          startR: r,
          style: { "--c": c, "--r": r, "--sx": w, "--sy": h },
        });
        done = true;
        break;
      }
    }

    // Tentativo 2: riduci span di 1
    if (!done) {
      const w2 = Math.max(3, w - 1),
        h2 = Math.max(3, h - 1);
      for (const [c, r] of starter) {
        if (fits(grid, W, H, c, r, w2, h2)) {
          place(grid, c, r, w2, h2);
          placed.push({
            ...node,
            spanX: w2,
            spanY: h2,
            classes: node.classes
              .replace(`span-x-${w}`, `span-x-${w2}`)
              .replace(`span-y-${h}`, `span-y-${h2}`),
            startC: c,
            startR: r,
            style: { "--c": c, "--r": r, "--sx": w2, "--sy": h2 },
          });
          done = true;
          break;
        }
      }
    }

    // Tentativo 3: fallback minimo 3x3
    if (!done) {
      for (const [c, r] of starter) {
        if (fits(grid, W, H, c, r, 3, 3)) {
          place(grid, c, r, 3, 3);
          placed.push({
            ...node,
            spanX: 3,
            spanY: 3,
            classes: node.classes
              .replace(/span-x-\d+/, `span-x-3`)
              .replace(/span-y-\d+/, `span-y-3`),
            startC: c,
            startR: r,
            style: { "--c": c, "--r": r, "--sx": 3, "--sy": 3 },
          });
          break;
        }
      }
    }
  }

  // ========== GROW PHASE ==========
  // Espande ogni tile nei vuoti adiacenti per layout denso senza buchi
  // Limita crescita blocchi testo (1 step) vs immagini (3 steps)
  // Euristica: privilegia asse più corto per tendere a forme quadrate

  function canGrowRight(g, Wmax, node) {
    const c0 = node.startC,
      r0 = node.startR,
      w = node.spanX,
      h = node.spanY;
    if (c0 + w > Wmax) return false;
    for (let y = r0; y < r0 + h; y++) {
      if (g[y][c0 + w]) return false;
    }
    return true;
  }

  function canGrowDown(g, Hmax, node) {
    const c0 = node.startC,
      r0 = node.startR,
      w = node.spanX,
      h = node.spanY;
    if (r0 + h > Hmax) return false;
    for (let x = c0; x < c0 + w; x++) {
      if (g[r0 + h][x]) return false;
    }
    return true;
  }

  function markRight(g, node) {
    const newCol = node.startC + node.spanX;
    for (let y = node.startR; y < node.startR + node.spanY; y++)
      g[y][newCol] = 1;
    node.spanX += 1;
    node.style["--sx"] = node.spanX;
    node.classes = node.classes.replace(/span-x-\d+/, `span-x-${node.spanX}`);
  }

  function markDown(g, node) {
    const newRow = node.startR + node.spanY;
    for (let x = node.startC; x < node.startC + node.spanX; x++)
      g[newRow][x] = 1;
    node.spanY += 1;
    node.style["--sy"] = node.spanY;
    node.classes = node.classes.replace(/span-y-\d+/, `span-y-${node.spanY}`);
  }

  for (const node of placed) {
    const isText = node.kind === "text";
    let steps = isText ? 1 : 3;
    while (steps-- > 0) {
      const growR = canGrowRight(grid, W, node);
      const growD = canGrowDown(grid, H, node);
      if (!growR && !growD) break;

      if (growR && (!growD || node.spanX <= node.spanY)) {
        markRight(grid, node);
      } else if (growD) {
        markDown(grid, node);
      }
    }
  }

  return { name: "vf-grid", slots: [{ kind: "vf-grid", images: placed }] };
}
