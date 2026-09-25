import * as fs from 'node:fs';
import * as path from 'node:path';

// ─── 1. JPEG Baseline Encoder (Zero Dependency) ──────────────────────────────

const ZIGZAG = [
  0,  1,  5,  6, 14, 15, 27, 28,
  2,  4,  7, 13, 16, 26, 29, 42,
  3,  8, 12, 17, 25, 30, 41, 43,
  9, 11, 18, 24, 31, 40, 44, 53,
 10, 19, 23, 32, 39, 45, 52, 54,
 20, 22, 33, 38, 46, 51, 55, 60,
 21, 34, 37, 47, 50, 56, 59, 61,
 35, 36, 48, 49, 57, 58, 62, 63
];

const STD_LUMA_Q = [
  16, 11, 10, 16,  24,  40,  51,  61,
  12, 12, 14, 19,  26,  58,  60,  55,
  14, 13, 16, 24,  40,  57,  69,  56,
  14, 17, 22, 29,  51,  87,  80,  62,
  18, 22, 37, 56,  68, 109, 103,  77,
  24, 35, 55, 64,  81, 104, 113,  92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103,  99
];

const STD_CHROMA_Q = [
  17, 18, 24, 47, 99, 99, 99, 99,
  18, 21, 26, 66, 99, 99, 99, 99,
  24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99
];

const DC_LUMA_BITS = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const DC_LUMA_VAL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const AC_LUMA_BITS = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const AC_LUMA_VAL = [
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
  0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
  0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
  0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
  0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
  0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
  0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
  0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
  0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
  0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
  0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
  0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
  0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
  0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4,
  0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
  0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
  0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa
];

const DC_CHROMA_BITS = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
const DC_CHROMA_VAL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const AC_CHROMA_BITS = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
const AC_CHROMA_VAL = [
  0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
  0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
  0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
  0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
  0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34,
  0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
  0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38,
  0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
  0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
  0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
  0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
  0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
  0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96,
  0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
  0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
  0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
  0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2,
  0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
  0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
  0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa
];

interface HuffmanEntry {
  code: number;
  len: number;
}

function buildHuffmanTable(bits: number[], values: number[]): Map<number, HuffmanEntry> {
  const table = new Map<number, HuffmanEntry>();
  let code = 0;
  let valIdx = 0;
  for (let len = 1; len <= 16; len++) {
    const count = bits[len];
    for (let i = 0; i < count; i++) {
      const val = values[valIdx++];
      table.set(val, { code, len });
      code++;
    }
    code <<= 1;
  }
  return table;
}

const dcLumaTable = buildHuffmanTable(DC_LUMA_BITS, DC_LUMA_VAL);
const acLumaTable = buildHuffmanTable(AC_LUMA_BITS, AC_LUMA_VAL);
const dcChromaTable = buildHuffmanTable(DC_CHROMA_BITS, DC_CHROMA_VAL);
const acChromaTable = buildHuffmanTable(AC_CHROMA_BITS, AC_CHROMA_VAL);

class BitWriter {
  private bytes: number[] = [];
  private currentByte = 0;
  private bitCount = 0;

  writeBits(code: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      const bit = (code >> i) & 1;
      this.currentByte = (this.currentByte << 1) | bit;
      this.bitCount++;
      if (this.bitCount === 8) {
        this.bytes.push(this.currentByte);
        if (this.currentByte === 0xff) {
          this.bytes.push(0x00);
        }
        this.currentByte = 0;
        this.bitCount = 0;
      }
    }
  }

  flush() {
    if (this.bitCount > 0) {
      this.currentByte = (this.currentByte << (8 - this.bitCount)) | ((1 << (8 - this.bitCount)) - 1);
      this.bytes.push(this.currentByte);
      if (this.currentByte === 0xff) {
        this.bytes.push(0x00);
      }
      this.currentByte = 0;
      this.bitCount = 0;
    }
  }

  getBytes(): Buffer {
    return Buffer.from(this.bytes);
  }
}

function dct8x8(block: number[]): number[] {
  const out = new Array(64).fill(0);
  const PI = Math.PI;

  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      let sum = 0;
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          sum += block[y * 8 + x] * Math.cos(((2 * x + 1) * u * PI) / 16) * Math.cos(((2 * y + 1) * v * PI) / 16);
        }
      }
      const cu = u === 0 ? 1 / Math.SQRT2 : 1;
      const cv = v === 0 ? 1 / Math.SQRT2 : 1;
      out[v * 8 + u] = 0.25 * cu * cv * sum;
    }
  }
  return out;
}

function encodeBlock(
  block: number[],
  qTable: number[],
  prevDC: { val: number },
  dcTable: Map<number, HuffmanEntry>,
  acTable: Map<number, HuffmanEntry>,
  writer: BitWriter
) {
  const centered = block.map((p) => p - 128);
  const dct = dct8x8(centered);

  const quantized = new Array(64);
  for (let i = 0; i < 64; i++) {
    quantized[ZIGZAG[i]] = Math.round(dct[i] / qTable[i]);
  }

  const dcVal = quantized[0];
  const diff = dcVal - prevDC.val;
  prevDC.val = dcVal;

  if (diff === 0) {
    const entry = dcTable.get(0)!;
    writer.writeBits(entry.code, entry.len);
  } else {
    const absDiff = Math.abs(diff);
    let cat = 0;
    while ((1 << cat) <= absDiff) cat++;
    const entry = dcTable.get(cat)!;
    writer.writeBits(entry.code, entry.len);

    const bits = diff > 0 ? diff : diff + (1 << cat) - 1;
    writer.writeBits(bits, cat);
  }

  let r = 0;
  for (let k = 1; k < 64; k++) {
    const ac = quantized[k];
    if (ac === 0) {
      r++;
    } else {
      while (r > 15) {
        const entry = acTable.get(0xf0)!;
        writer.writeBits(entry.code, entry.len);
        r -= 16;
      }
      const absVal = Math.abs(ac);
      let cat = 0;
      while ((1 << cat) <= absVal) cat++;
      const symbol = (r << 4) | cat;
      const entry = acTable.get(symbol)!;
      writer.writeBits(entry.code, entry.len);

      const bits = ac > 0 ? ac : ac + (1 << cat) - 1;
      writer.writeBits(bits, cat);
      r = 0;
    }
  }

  if (r > 0) {
    const entry = acTable.get(0x00)!;
    writer.writeBits(entry.code, entry.len);
  }
}

export function encodeJpeg(width: number, height: number, rgb: Uint8Array): Buffer {
  const writer = new BitWriter();
  const chunks: Buffer[] = [];

  // SOI
  chunks.push(Buffer.from([0xff, 0xd8]));

  // APP0 (JFIF)
  chunks.push(
    Buffer.from([
      0xff, 0xe0, 0x00, 0x10,
      0x4a, 0x46, 0x49, 0x46, 0x00,
      0x01, 0x01,
      0x00,
      0x00, 0x48,
      0x00, 0x48,
      0x00, 0x00
    ])
  );

  // DQT Luma & Chroma
  chunks.push(Buffer.from([0xff, 0xdb, 0x00, 0x43, 0x00, ...STD_LUMA_Q]));
  chunks.push(Buffer.from([0xff, 0xdb, 0x00, 0x43, 0x01, ...STD_CHROMA_Q]));

  // SOF0 (Baseline)
  const sof0 = [
    0xff, 0xc0,
    0x00, 0x11,
    0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03,
    0x01, 0x11, 0x00,
    0x02, 0x11, 0x01,
    0x03, 0x11, 0x01
  ];
  chunks.push(Buffer.from(sof0));

  // DHT Tables
  chunks.push(Buffer.from([0xff, 0xc4, 0x00, 0x1f, 0x00, ...DC_LUMA_BITS.slice(1), ...DC_LUMA_VAL]));
  chunks.push(Buffer.from([0xff, 0xc4, 0x00, 0xb5, 0x10, ...AC_LUMA_BITS.slice(1), ...AC_LUMA_VAL]));
  chunks.push(Buffer.from([0xff, 0xc4, 0x00, 0x1f, 0x01, ...DC_CHROMA_BITS.slice(1), ...DC_CHROMA_VAL]));
  chunks.push(Buffer.from([0xff, 0xc4, 0x00, 0xb5, 0x11, ...AC_CHROMA_BITS.slice(1), ...AC_CHROMA_VAL]));

  // SOS
  const sos = [
    0xff, 0xda,
    0x00, 0x0c,
    0x03,
    0x01, 0x00,
    0x02, 0x11,
    0x03, 0x11,
    0x00, 0x3f, 0x00
  ];
  chunks.push(Buffer.from(sos));

  const padW = Math.ceil(width / 8) * 8;
  const padH = Math.ceil(height / 8) * 8;

  const yPlane = new Float32Array(padW * padH);
  const cbPlane = new Float32Array(padW * padH);
  const crPlane = new Float32Array(padW * padH);

  for (let y = 0; y < padH; y++) {
    const srcY = Math.min(y, height - 1);
    for (let x = 0; x < padW; x++) {
      const srcX = Math.min(x, width - 1);
      const idx = (srcY * width + srcX) * 3;
      const r = rgb[idx];
      const g = rgb[idx + 1];
      const b = rgb[idx + 2];

      const destIdx = y * padW + x;
      yPlane[destIdx] = 0.299 * r + 0.587 * g + 0.114 * b;
      cbPlane[destIdx] = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
      crPlane[destIdx] = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;
    }
  }

  const prevDC_Y = { val: 0 };
  const prevDC_Cb = { val: 0 };
  const prevDC_Cr = { val: 0 };

  const blockY = new Array(64);
  const blockCb = new Array(64);
  const blockCr = new Array(64);

  for (let by = 0; by < padH; by += 8) {
    for (let bx = 0; bx < padW; bx += 8) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const idx = (by + y) * padW + (bx + x);
          const blockIdx = y * 8 + x;
          blockY[blockIdx] = yPlane[idx];
          blockCb[blockIdx] = cbPlane[idx];
          blockCr[blockIdx] = crPlane[idx];
        }
      }

      encodeBlock(blockY, STD_LUMA_Q, prevDC_Y, dcLumaTable, acLumaTable, writer);
      encodeBlock(blockCb, STD_CHROMA_Q, prevDC_Cb, dcChromaTable, acChromaTable, writer);
      encodeBlock(blockCr, STD_CHROMA_Q, prevDC_Cr, dcChromaTable, acChromaTable, writer);
    }
  }

  writer.flush();
  chunks.push(writer.getBytes());
  chunks.push(Buffer.from([0xff, 0xd9])); // EOI

  return Buffer.concat(chunks);
}

// ─── 2. Educational Canvas Drawing Primitives ─────────────────────────────────

export class EducationalCanvas {
  public width: number;
  public height: number;
  private buffer: Uint8Array;
  private svgElements: string[] = [];

  constructor(width: number = 640, height: number = 480) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint8Array(width * height * 3);
    this.clear(15, 23, 42); // Default slate background (#0f172a)
  }

  clear(r: number, g: number, b: number) {
    for (let i = 0; i < this.buffer.length; i += 3) {
      this.buffer[i] = r;
      this.buffer[i + 1] = g;
      this.buffer[i + 2] = b;
    }
    this.svgElements = [
      `<rect width="${this.width}" height="${this.height}" fill="rgb(${r},${g},${b})" />`
    ];
  }

  setPixel(x: number, y: number, r: number, g: number, b: number) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 3;
    this.buffer[idx] = r;
    this.buffer[idx + 1] = g;
    this.buffer[idx + 2] = b;
  }

  fillRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number) {
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(this.width, Math.floor(x + w));
    const endY = Math.min(this.height, Math.floor(y + h));

    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        const idx = (py * this.width + px) * 3;
        this.buffer[idx] = r;
        this.buffer[idx + 1] = g;
        this.buffer[idx + 2] = b;
      }
    }
    this.svgElements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgb(${r},${g},${b})" />`
    );
  }

  drawRect(x: number, y: number, w: number, h: number, r: number, g: number, b: number, lineWidth: number = 2) {
    this.fillRect(x, y, w, lineWidth, r, g, b); // Top
    this.fillRect(x, y + h - lineWidth, w, lineWidth, r, g, b); // Bottom
    this.fillRect(x, y, lineWidth, h, r, g, b); // Left
    this.fillRect(x + w - lineWidth, y, lineWidth, h, r, g, b); // Right
    this.svgElements.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="rgb(${r},${g},${b})" stroke-width="${lineWidth}" />`
    );
  }

  fillCircle(cx: number, cy: number, radius: number, r: number, g: number, b: number) {
    const r2 = radius * radius;
    const startX = Math.max(0, Math.floor(cx - radius));
    const endX = Math.min(this.width, Math.ceil(cx + radius));
    const startY = Math.max(0, Math.floor(cy - radius));
    const endY = Math.min(this.height, Math.ceil(cy + radius));

    for (let py = startY; py < endY; py++) {
      const dy = py - cy;
      for (let px = startX; px < endX; px++) {
        const dx = px - cx;
        if (dx * dx + dy * dy <= r2) {
          const idx = (py * this.width + px) * 3;
          this.buffer[idx] = r;
          this.buffer[idx + 1] = g;
          this.buffer[idx + 2] = b;
        }
      }
    }
    this.svgElements.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="rgb(${r},${g},${b})" />`
    );
  }

  drawLine(x0: number, y0: number, x1: number, y1: number, r: number, g: number, b: number, width: number = 2) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let curX = x0;
    let curY = y0;

    while (true) {
      this.fillRect(curX - Math.floor(width / 2), curY - Math.floor(width / 2), width, width, r, g, b);
      if (curX === x1 && curY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        curX += sx;
      }
      if (e2 < dx) {
        err += dx;
        curY += sy;
      }
    }
    this.svgElements.push(
      `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="rgb(${r},${g},${b})" stroke-width="${width}" />`
    );
  }

  drawGrid(step: number = 40, r: number = 30, g: number = 41, b: number = 59) {
    for (let x = 0; x < this.width; x += step) {
      this.drawLine(x, 0, x, this.height, r, g, b, 1);
    }
    for (let y = 0; y < this.height; y += step) {
      this.drawLine(0, y, this.width, y, r, g, b, 1);
    }
  }

  toJpegBuffer(): Buffer {
    return encodeJpeg(this.width, this.height, this.buffer);
  }

  toSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">
${this.svgElements.join('\n')}
</svg>`;
  }
}

// ─── 3. Subject-Specific Educational Diagram Synthesizers ─────────────────────

/**
 * Generates an educational 2D shapes diagram (Triangle, Square, Circle, Rectangle).
 */
export function synthesizeShapesDiagram(): { jpeg: Buffer; svg: string } {
  const canvas = new EducationalCanvas(640, 480);
  canvas.clear(15, 23, 42); // Navy slate
  canvas.drawGrid(40, 30, 41, 59);

  // Shape 1: Triangle (Emerald Green)
  canvas.fillCircle(140, 160, 50, 16, 185, 129);
  // Cut bottom flat to form triangle
  for (let py = 160; py < 220; py++) {
    for (let px = 80; px < 200; px++) {
      if (px < 140 - (py - 110) || px > 140 + (py - 110)) {
        canvas.fillRect(px, py, 1, 1, 15, 23, 42);
      }
    }
  }
  canvas.drawRect(80, 220, 120, 30, 52, 211, 153, 2);

  // Shape 2: Square (Vibrant Amber)
  canvas.fillRect(260, 110, 100, 100, 245, 158, 11);
  canvas.drawRect(255, 105, 110, 110, 251, 191, 36, 3);

  // Shape 3: Circle (Sky Blue)
  canvas.fillCircle(480, 160, 55, 14, 165, 233);
  canvas.drawRect(420, 220, 120, 30, 56, 189, 248, 2);

  // Shape 4: Rectangle (Purple/Indigo)
  canvas.fillRect(180, 310, 280, 110, 129, 140, 248);
  canvas.drawRect(175, 305, 290, 120, 165, 180, 252, 3);

  return { jpeg: canvas.toJpegBuffer(), svg: canvas.toSvg() };
}

/**
 * Generates a Pizza / Pie Fractions diagram (e.g. 3/4 or 5/8 representation).
 */
export function synthesizeFractionsDiagram(): { jpeg: Buffer; svg: string } {
  const canvas = new EducationalCanvas(640, 480);
  canvas.clear(15, 23, 42);
  canvas.drawGrid(40, 30, 41, 59);

  const cx = 320;
  const cy = 230;
  const radius = 130;

  // Outer crust circle (Warm gold)
  canvas.fillCircle(cx, cy, radius + 10, 217, 119, 6);
  // Base cheese circle (Light cream yellow)
  canvas.fillCircle(cx, cy, radius, 254, 240, 138);

  // Shaded slices (Emerald green to represent eaten / counted fractions)
  for (let dy = -radius; dy <= 0; dy++) {
    for (let dx = -radius; dx <= 0; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        canvas.setPixel(cx + dx, cy + dy, 16, 185, 129); // Top-left quadrant (1/4)
      }
    }
  }
  for (let dy = 0; dy <= radius; dy++) {
    for (let dx = -radius; dx <= 0; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        canvas.setPixel(cx + dx, cy + dy, 16, 185, 129); // Bottom-left quadrant (2/4)
      }
    }
  }
  for (let dy = 0; dy <= radius; dy++) {
    for (let dx = 0; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        canvas.setPixel(cx + dx, cy + dy, 16, 185, 129); // Bottom-right quadrant (3/4)
      }
    }
  }

  // Cross dividing lines (Slice cuts)
  canvas.drawLine(cx - radius, cy, cx + radius, cy, 180, 83, 9, 3);
  canvas.drawLine(cx, cy - radius, cx, cy + radius, 180, 83, 9, 3);

  // Fraction legend boxes
  canvas.fillRect(80, 410, 220, 40, 16, 185, 129);
  canvas.fillRect(340, 410, 220, 40, 254, 240, 138);

  return { jpeg: canvas.toJpegBuffer(), svg: canvas.toSvg() };
}

/**
 * Generates CS Unplugged Binary Dot Cards [16] [8] [4] [2] [1].
 */
export function synthesizeBinaryDotCards(): { jpeg: Buffer; svg: string } {
  const canvas = new EducationalCanvas(640, 480);
  canvas.clear(15, 23, 42);

  const cardW = 90;
  const cardH = 150;
  const cardY = 160;
  const gap = 25;
  const startX = 45;

  const cardValues = [16, 8, 4, 2, 1];
  const activePattern = [false, true, true, false, true]; // Number 13 (8 + 4 + 1)

  for (let i = 0; i < 5; i++) {
    const cx = startX + i * (cardW + gap);
    const isActive = activePattern[i];

    if (isActive) {
      // Face UP Card (White slate with dark dots)
      canvas.fillRect(cx, cardY, cardW, cardH, 248, 250, 252);
      canvas.drawRect(cx, cardY, cardW, cardH, 56, 189, 248, 3);

      // Dots on card
      canvas.fillCircle(cx + 30, cardY + 50, 8, 30, 41, 59);
      canvas.fillCircle(cx + 60, cardY + 50, 8, 30, 41, 59);
      canvas.fillCircle(cx + 45, cardY + 90, 8, 30, 41, 59);

      // Active status bar (1)
      canvas.fillRect(cx, cardY + cardH + 15, cardW, 35, 16, 185, 129);
    } else {
      // Face DOWN Card (Dark blue/gray back)
      canvas.fillRect(cx, cardY, cardW, cardH, 51, 65, 85);
      canvas.drawRect(cx, cardY, cardW, cardH, 100, 116, 139, 2);

      // Inactive status bar (0)
      canvas.fillRect(cx, cardY + cardH + 15, cardW, 35, 71, 85, 105);
    }
  }

  return { jpeg: canvas.toJpegBuffer(), svg: canvas.toSvg() };
}

/**
 * Generates Cartesian slope and velocity rate-of-change graph for STEM OpenStax.
 */
export function synthesizeSlopeGraph(): { jpeg: Buffer; svg: string } {
  const canvas = new EducationalCanvas(640, 480);
  canvas.clear(15, 23, 42);
  canvas.drawGrid(40, 30, 41, 59);

  const originX = 100;
  const originY = 380;

  // Axes
  canvas.drawLine(originX, originY, 560, originY, 241, 245, 249, 3); // X-axis (Time)
  canvas.drawLine(originX, originY, originX, 60, 241, 245, 249, 3);  // Y-axis (Distance)

  // Linear Slope Line (Rise/Run)
  const x1 = originX + 80;
  const y1 = originY - 60;
  const x2 = originX + 360;
  const y2 = originY - 270;

  canvas.drawLine(x1, y1, x2, y2, 236, 72, 153, 4); // Slope line in vibrant pink

  // Slope triangle (Delta y / Delta x)
  canvas.drawLine(x1, y1, x2, y1, 14, 165, 233, 2); // Run (Delta x)
  canvas.drawLine(x2, y1, x2, y2, 16, 185, 129, 2); // Rise (Delta y)

  // Data point markers
  canvas.fillCircle(x1, y1, 7, 244, 114, 182);
  canvas.fillCircle(x2, y2, 7, 244, 114, 182);

  return { jpeg: canvas.toJpegBuffer(), svg: canvas.toSvg() };
}

/**
 * Saves educational diagram assets to public, .hosting, and dist static hosting directories.
 */
export function saveLessonImage(
  filename: string,
  jpegBuffer: Buffer,
  svgContent?: string
): { relativePath: string; fullPublicPath: string } {
  const baseFilename = filename.endsWith('.jpg') ? filename : `${filename}.jpg`;
  const svgFilename = baseFilename.replace(/\.jpg$/, '.svg');

  const targets = [
    path.resolve(process.cwd(), 'public/lessons'),
    path.resolve(process.cwd(), '.hosting/static/lessons'),
    path.resolve(process.cwd(), 'dist/lessons'),
  ];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    try {
      fs.writeFileSync(path.join(dir, baseFilename), jpegBuffer);
      if (svgContent) {
        fs.writeFileSync(path.join(dir, svgFilename), svgContent, 'utf8');
      }
    } catch (err: any) {
      console.warn(`[saveLessonImage] Notice writing to ${dir}:`, err.message);
    }
  }

  return {
    relativePath: `/lessons/${baseFilename}`,
    fullPublicPath: path.join(targets[0], baseFilename),
  };
}
