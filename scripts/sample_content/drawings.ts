/**
 * SVG stand-ins for real pictures: room photos, app screens, architecture
 * diagrams, a person cut-out and credential badges. Each one is stamped
 * "SAMPLE" with the slot it fills, so a seeded page never passes for real.
 */

/** Small deterministic generator so the same slot always draws the same picture. */
export function seeded(text: string): () => number {
  let state = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const stamp = (w: number, h: number, label: string, dark = false) => {
  const size = Math.round(Math.min(w, h) / 28);
  return `<text x="${size}" y="${h - size}" font-family="monospace" font-size="${size}" fill="${dark ? "#ffffffcc" : "#0b1824aa"}">SAMPLE · ${label}</text>`;
};

/** A room photo: soft light, a floor, a few out-of-focus people and objects. */
export function photo(w: number, h: number, label: string): string {
  const rand = seeded(label);
  const hue = Math.round(rand() * 360);
  const blobs = Array.from({ length: 7 }, () => {
    const r = (0.06 + rand() * 0.12) * Math.min(w, h);
    return `<circle cx="${rand() * w}" cy="${h * (0.45 + rand() * 0.4)}" r="${r}" fill="hsl(${(hue + rand() * 80) % 360} 35% ${30 + rand() * 40}%)"/>`;
  }).join("");
  return svg(
    w,
    h,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 30% 82%)"/><stop offset="0.62" stop-color="hsl(${hue} 18% 62%)"/><stop offset="1" stop-color="hsl(${(hue + 30) % 360} 20% 30%)"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="${Math.round(w / 90)}"/></filter></defs><rect width="${w}" height="${h}" fill="url(#g)"/><g filter="url(#b)">${blobs}</g>${stamp(w, h, label, true)}`,
  );
}

/** An app screen: phone layout when taller than wide, dashboard otherwise. */
export function screen(w: number, h: number, label: string): string {
  const rand = seeded(label);
  const accent = `hsl(${200 + Math.round(rand() * 40)} 60% 42%)`;
  const u = Math.min(w, h) / 24;
  if (h > w) {
    const rows = Array.from({ length: 9 }, (_, i) => {
      const y = u * 5 + i * u * 3.2;
      return `<circle cx="${u * 2}" cy="${y + u}" r="${u * 0.9}" fill="hsl(${rand() * 360} 40% 70%)"/><rect x="${u * 3.6}" y="${y + u * 0.3}" width="${w * (0.35 + rand() * 0.3)}" height="${u * 0.6}" rx="${u * 0.3}" fill="#c9d3dc"/><rect x="${u * 3.6}" y="${y + u * 1.3}" width="${w * (0.2 + rand() * 0.4)}" height="${u * 0.5}" rx="${u * 0.25}" fill="#dfe6ec"/>`;
    }).join("");
    return svg(
      w,
      h,
      `<rect width="${w}" height="${h}" fill="#f5f7f9"/><rect width="${w}" height="${u * 4}" fill="${accent}"/><rect x="${u}" y="${u * 1.5}" width="${w * 0.4}" height="${u}" rx="${u / 2}" fill="#ffffffcc"/>${rows}<rect x="${u}" y="${h - u * 3}" width="${w - u * 2}" height="${u * 2}" rx="${u}" fill="#e3e9ee"/>${stamp(w, h - u * 3.5, label)}`,
    );
  }
  const cards = Array.from({ length: 6 }, (_, i) => {
    const x = w * 0.22 + (i % 3) * w * 0.26;
    const y = h * 0.2 + Math.floor(i / 3) * h * 0.36;
    const bar = Array.from(
      { length: 6 },
      (_, j) =>
        `<rect x="${x + u + j * u * 1.4}" y="${y + h * 0.28 - rand() * h * 0.18}" width="${u * 0.9}" height="${h * 0.3}" fill="${accent}" opacity="0.7"/>`,
    ).join("");
    return `<g><rect x="${x}" y="${y}" width="${w * 0.24}" height="${h * 0.32}" rx="${u * 0.4}" fill="#ffffff"/><clipPath id="c${i}"><rect x="${x}" y="${y}" width="${w * 0.24}" height="${h * 0.32}"/></clipPath><g clip-path="url(#c${i})">${bar}</g></g>`;
  }).join("");
  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="#eef2f5"/><rect width="${w * 0.18}" height="${h}" fill="#17263a"/><rect x="${w * 0.18}" width="${w * 0.82}" height="${h * 0.12}" fill="#ffffff"/>${cards}${stamp(w, h, label)}`,
  );
}

/** Boxes and arrows: client, gateway, services, data stores. */
export function diagram(w: number, h: number, label: string): string {
  const box = (x: number, y: number, text: string) =>
    `<rect x="${x - w * 0.09}" y="${y - h * 0.07}" width="${w * 0.18}" height="${h * 0.14}" rx="${h * 0.02}" fill="#ffffff" stroke="#1a4c8a" stroke-width="${h * 0.006}"/><text x="${x}" y="${y + h * 0.015}" text-anchor="middle" font-family="sans-serif" font-size="${h * 0.04}" fill="#0b1824">${text}</text>`;
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#627486" stroke-width="${h * 0.005}"/>`;
  const nodes: Array<[number, number, string]> = [
    [w * 0.14, h * 0.5, "Clients"],
    [w * 0.38, h * 0.5, "Gateway"],
    [w * 0.62, h * 0.25, "Auth"],
    [w * 0.62, h * 0.5, "Messaging"],
    [w * 0.62, h * 0.75, "Media"],
    [w * 0.86, h * 0.35, "Postgres"],
    [w * 0.86, h * 0.68, "Redis"],
  ];
  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [3, 5],
    [3, 6],
    [4, 6],
  ]
    .map(([a = 0, b = 0]) => {
      const [x1 = 0, y1 = 0] = nodes[a] ?? [];
      const [x2 = 0, y2 = 0] = nodes[b] ?? [];
      return line(x1, y1, x2, y2);
    })
    .join("");
  return svg(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="#f2f6f9"/>${edges}${nodes.map(([x, y, t]) => box(x, y, t)).join("")}${stamp(w, h, label)}`,
  );
}

/** A head-and-shoulders figure; transparent unless `backdrop` is given. */
export function person(
  w: number,
  h: number,
  label: string,
  colors: { skin: string; hair: string; shirt: string; backdrop?: string },
): string {
  const cx = w / 2;
  const s = Math.min(w, h);
  const top = h - s;
  const back = colors.backdrop
    ? `<rect width="${w}" height="${h}" fill="${colors.backdrop}"/>`
    : "";
  return svg(
    w,
    h,
    `${back}<path d="M ${cx - s * 0.42} ${h} C ${cx - s * 0.42} ${top + s * 0.62}, ${cx - s * 0.2} ${top + s * 0.56}, ${cx} ${top + s * 0.56} C ${cx + s * 0.2} ${top + s * 0.56}, ${cx + s * 0.42} ${top + s * 0.62}, ${cx + s * 0.42} ${h} Z" fill="${colors.shirt}"/><rect x="${cx - s * 0.06}" y="${top + s * 0.42}" width="${s * 0.12}" height="${s * 0.16}" fill="${colors.skin}"/><ellipse cx="${cx}" cy="${top + s * 0.33}" rx="${s * 0.15}" ry="${s * 0.18}" fill="${colors.skin}"/><path d="M ${cx - s * 0.16} ${top + s * 0.3} C ${cx - s * 0.17} ${top + s * 0.1}, ${cx + s * 0.17} ${top + s * 0.1}, ${cx + s * 0.16} ${top + s * 0.3} C ${cx + s * 0.1} ${top + s * 0.2}, ${cx - s * 0.1} ${top + s * 0.2}, ${cx - s * 0.16} ${top + s * 0.3} Z" fill="${colors.hair}"/>${colors.backdrop ? stamp(w, h, label, true) : ""}`,
  );
}

/** A round credential badge with the issuer's initials. */
export function badge(size: number, label: string, initials: string): string {
  const hue = Math.round(seeded(label)() * 360);
  return svg(
    size,
    size,
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="hsl(${hue} 45% 32%)"/><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.38}" fill="none" stroke="#ffffff88" stroke-width="${size * 0.02}"/><text x="${size / 2}" y="${size * 0.58}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${size * 0.22}" fill="#ffffff">${initials}</text>`,
  );
}
