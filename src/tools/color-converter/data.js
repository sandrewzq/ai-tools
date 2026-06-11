import { clamp, hexToHsl, hexToRgb, hslToHex, rgbToHex } from "../../shared/color.js";

function parseHex(input) {
  const normalized = input.trim().toUpperCase();
  if (!/^#?[0-9A-F]{6}$/.test(normalized)) return null;
  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

function parseRgb(input) {
  const match = input.trim().match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i);
  if (!match) return null;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if ([r, g, b].some((value) => value < 0 || value > 255)) return null;
  return rgbToHex(r, g, b);
}

function parseHsl(input) {
  const match = input.trim().match(/^hsl\(([-\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?\)$/i);
  if (!match) return null;
  const h = Number(match[1]);
  const s = clamp(Number(match[2]), 0, 100);
  const l = clamp(Number(match[3]), 0, 100);
  if (![h, s, l].every(Number.isFinite)) return null;
  return hslToHex(h, s, l);
}

function formatRgb({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function formatHsl({ h, s, l }) {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function formatOklchFallback({ h, s, l }) {
  const lightness = (l / 100).toFixed(2);
  const chroma = (s / 100 * 0.18).toFixed(2);
  const hue = Math.round(h);
  return `oklch(${lightness} ${chroma} ${hue})`;
}

export function convertColor(input) {
  const hex = parseHex(input) || parseRgb(input) || parseHsl(input);
  if (!hex) {
    return { error: "仅支持 HEX、rgb(...)、hsl(...) 三种输入格式" };
  }

  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  return {
    hex,
    rgb: formatRgb(rgb),
    hsl: formatHsl(hsl),
    oklch: formatOklchFallback(hsl),
    preview: hex,
  };
}
