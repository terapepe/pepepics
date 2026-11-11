import "server-only";

export type Sniffed = { mime: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; ext: string; width: number | null; height: number | null };

/** Detect real image type from magic bytes (never trust the client's MIME) and read dimensions. */
export function sniffImage(b: Uint8Array): Sniffed | null {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return { mime: "image/png", ext: "png", width: dv.getUint32(16), height: dv.getUint32(20) };
  if (b.length > 10 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38)
    return { mime: "image/gif", ext: "gif", width: dv.getUint16(6, true), height: dv.getUint16(8, true) };
  if (b.length > 30 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (chunk === "VP8X") return { mime: "image/webp", ext: "webp", width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    if (chunk === "VP8 ") return { mime: "image/webp", ext: "webp", width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = dv.getUint32(21, true);
      return { mime: "image/webp", ext: "webp", width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return { mime: "image/webp", ext: "webp", width: null, height: null };
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      const len = dv.getUint16(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { mime: "image/jpeg", ext: "jpg", height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
      i += 2 + len;
    }
    return { mime: "image/jpeg", ext: "jpg", width: null, height: null };
  }
  return null;
}

export async function sha256(b: Uint8Array) {
  const h = await crypto.subtle.digest("SHA-256", b as unknown as ArrayBuffer);
  return Buffer.from(h).toString("hex");
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "pepe";

export function parseTags(s: string) {
  return [...new Set(s.split(/[,\s#]+/).map((t) => t.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24)).filter((t) => t.length > 1))].slice(0, 12);
}
