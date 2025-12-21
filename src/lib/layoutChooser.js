// hash + rng
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

// span base in funzione di orientation/size + boost se pochi elementi
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

// crea punti "ancora" sparsi sull’area per iniziare il packing
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
  // riempi con qualche cella extra per fallback
  for (let r = 1; r <= H; r++) {
    for (let c = 1; c <= W; c++) {
      a.push([c, r]);
    }
  }
  return a;
}

// prova a posizionare un rettangolo (c..c+w-1, r..r+h-1) senza collisioni
function fits(grid, W, H, c, r, w, h) {
  if (c + w - 1 > W || r + h - 1 > H) return false;
  for (let y = r; y < r + h; y++) {
    for (let x = c; x < c + w; x++) {
      if (grid[y][x]) return false;
    }
  }
  return true;
}
function place(grid, c, r, w, h) {
  for (let y = r; y < r + h; y++) {
    for (let x = c; x < c + w; x++) {
      grid[y][x] = 1;
    }
  }
}

// jitter deterministico: 0=left, 1=center, 2=right
function jitterAlign(seedStr) {
  const seed = hashStr(seedStr || "");
  const r = (seed % 1000) / 1000; // [0..1)
  if (r < 0.33) return "left";
  if (r < 0.66) return "right";
  return "center";
}

function decorateItems(items, coverUrl, boost, projectId = "") {
  return items.map((it, idx) => {
    const isText = it.kind === "text";

    // size logic come prima
    let size = isText ? it.size || "md" : "md";
    if (!isText) {
      if (it.url === coverUrl) size = "lg";
      else if (items.length >= 7 && (idx + 1) % 5 === 0) size = "sm"; // solo se tante
    }

    const { x, y } = spanFor({ ...it, size }, boost);

    // allineamento orizzontale deterministico per immagini
    let alignClass = "";
    if (!isText) {
      const key = `${projectId}__${it.url || it.filename || idx}`;
      const a = jitterAlign(key); // left/center/right
      alignClass =
        a === "left" ? "align-left" : a === "right" ? "align-right" : "";
    }

    const classes = [
      isText ? "tile tile--text" : "img",
      !isText && it.orientation ? `img--${it.orientation}` : null,
      `size-${size}`,
      `span-x-${x}`,
      `span-y-${y}`,
      alignClass, // NEW
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

export function chooseLayout(projectId, images, options = {}) {
  // seed deterministico per random stabile per progetto
  const seed = hashStr(projectId || "");
  const rand = rng(seed);

  // blocco testo opzionale (descrizione/materiali)
  const textNode =
    options?.textBlock && (options.textBlock.html || options.textBlock.text)
      ? {
          kind: "text",
          html: options.textBlock.html,
          text: options.textBlock.text,
          size: options.textBlock.size || "md",
        }
      : null;

  // normalizza input immagini
  const flat = Array.isArray(images) ? [...images] : [];
  if (!flat.length && !textNode) return { name: "empty", slots: [] };

  // individua cover o full per priorità visiva
  const coverUrl =
    flat.find((i) => i.type === "cover")?.url ||
    flat.find((i) => i.type === "full")?.url ||
    flat[0]?.url;

  // shuffle leggero ma riproducibile
  flat.sort(() => (rand() < 0.5 ? -1 : 1));

  // inserisce il blocco testo in posizione leggibile (dopo cover/full)
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

  // calibra dimensioni base in funzione della quantità (tile più grandi se pochi elementi)
  const total = list.length;
  const boost = total <= 2 ? 3 : total <= 4 ? 2 : total <= 6 ? 1 : 0;

  // produce classi e span iniziali (accetta projectId per jitter orizzontale)
  const decorated = decorateItems(list, coverUrl, boost, projectId);

  // griglia discreta 12x12 per packing controllato
  const W = 12,
    H = 12;
  const grid = Array.from({ length: H + 1 }, () => Array(W + 1).fill(0)); // indice 1-based
  const starter = anchors(W, H, decorated.length); // punti di partenza distribuiti

  // prova a posizionare ogni tile rispettando i bordi e senza sovrapposizioni
  const placed = [];
  for (const node of decorated) {
    const w = node.spanX,
      h = node.spanY;
    let done = false;

    // tentativo con size proposta
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

    // fallback riducendo di 1 lo span
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

    // ultimo fallback 3x3
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

  // ---------- GROW PHASE: espansione controllata dopo il packing ----------

  // verifica se il nodo può crescere di 1 colonna verso destra
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

  // verifica se il nodo può crescere di 1 riga verso il basso
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

  // marca la nuova colonna a destra e aggiorna stile/classi
  function markRight(g, node) {
    const newCol = node.startC + node.spanX;
    for (let y = node.startR; y < node.startR + node.spanY; y++)
      g[y][newCol] = 1;
    node.spanX += 1;
    node.style["--sx"] = node.spanX;
    node.classes = node.classes.replace(/span-x-\d+/, `span-x-${node.spanX}`);
  }

  // marca la nuova riga in basso e aggiorna stile/classi
  function markDown(g, node) {
    const newRow = node.startR + node.spanY;
    for (let x = node.startC; x < node.startC + node.spanX; x++)
      g[newRow][x] = 1;
    node.spanY += 1;
    node.style["--sy"] = node.spanY;
    node.classes = node.classes.replace(/span-y-\d+/, `span-y-${node.spanY}`);
  }

  // espansione locale: tenta 2–3 step per nodo per riempire i vuoti adiacenti
  for (const node of placed) {
    // evita di far crescere i blocchi testuali troppo aggressivamente
    const isText = node.kind === "text";
    let steps = isText ? 1 : 3;
    while (steps-- > 0) {
      const growR = canGrowRight(grid, W, node);
      const growD = canGrowDown(grid, H, node);
      if (!growR && !growD) break;

      // euristica semplice: privilegia l’asse più corto per tendere al quadrato
      if (growR && (!growD || node.spanX <= node.spanY)) {
        markRight(grid, node);
      } else if (growD) {
        markDown(grid, node);
      }
    }
  }

  // ritorna layout finale con posizioni e span aggiornati
  return { name: "vf-grid", slots: [{ kind: "vf-grid", images: placed }] };
}
