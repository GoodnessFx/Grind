/**
 * Generates real Grind app icons (dark sphere + green glow, matching LogoMark)
 * as PNG — no dependencies, pure Node (zlib + hand-written PNG encoder).
 * Usage: node scripts/gen-icons.mjs
 * Outputs: apps/web/public/icon-192.png, icon-512.png, icon-180.png (apple)
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'apps', 'web', 'public');

// ── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const row = w * 4 + 1;
  const raw = Buffer.alloc(row * h);
  for (let y = 0; y < h; y++) {
    raw[y * row] = 0; // filter type 0 (None)
    rgba.copy(raw, y * row + 1, y * w * 4, (y + 1) * w * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // 8-bit
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // deflate, adaptive, non-interlaced
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ── Icon rasteriser (full-bleed square — maskable safe zone is the design) ──
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));

function drawIcon(S) {
  const px = Buffer.alloc(S * S * 4);
  const set = (x, y, r, g, b) => {
    const i = (y * S + x) * 4;
    px[i] = clamp(r); px[i + 1] = clamp(g); px[i + 2] = clamp(b); px[i + 3] = 255;
  };

  const ANG = (-18 * Math.PI) / 180;
  const COS = Math.cos(ANG), SIN = Math.sin(ANG);

  for (let y = 0; y < S; y++) {
    const ny = y / S;
    for (let x = 0; x < S; x++) {
      const nx = x / S;

      // Background: dark #0D0D14 with a whisper of top light
      const shade = 1 + 0.07 * (1 - ny);
      let r = 13 * shade, g = 13 * shade, b = 20 * shade;

      // Green glow pool near base: ellipse centre (0.5, 0.66)
      const gx = (nx - 0.5) / 0.44, gy = (ny - 0.66) / 0.17;
      const gd = Math.sqrt(gx * gx + gy * gy);
      if (gd < 1.25) {
        const f = Math.max(0, 1 - gd / 1.25);
        const fl = f * f;
        r += 10 * fl; g += 166 * fl; b += 84 * fl;
      }

      // Sphere: centre (0.5, 0.44), radius 0.30
      const sx = nx - 0.5, sy = ny - 0.44;
      const sd = Math.sqrt(sx * sx + sy * sy);
      if (sd < 0.30) {
        const t = Math.max(0, 1 - sd / 0.30);
        // dark charcoal base, brighter toward rim-lit side
        r = 12 + 44 * t; g = 12 + 44 * t; b = 18 + 52 * t;

        // Top-left highlight (soft white radial)
        const hx = nx - 0.40, hy = ny - 0.34;
        const hd = Math.sqrt(hx * hx + hy * hy);
        if (hd < 0.20) {
          const hl = Math.max(0, 1 - hd / 0.20);
          const l = hl * hl * 60;
          r += l; g += l; b += l;
        }

        // Concentric tilted green rings (rotated back into ellipse frame)
        const ex = (COS * sx + SIN * sy) / 0.285;
        for (const ry of [0.085, 0.150, 0.215, 0.280]) {
          const ey = (-SIN * sx + COS * sy) / ry;
          const d = Math.sqrt(ex * ex + ey * ey);
          if (Math.abs(d - 1) < 0.055) {
            r += 34; g += 130; b += 82;
            break;
          }
        }
      }

      set(x, y, r, g, b);
    }
  }
  return px;
}

for (const S of [192, 512, 180]) {
  const png = encodePNG(S, S, drawIcon(S));
  const name = `icon-${S}.png`;
  writeFileSync(join(OUT, name), png);
  console.log(`wrote ${name} (${png.length} bytes)`);
}
