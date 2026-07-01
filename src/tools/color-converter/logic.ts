import { clamp, hexToHsl, hexToRgb, hslToHex, rgbToHex } from "../../shared/color";

function parseHex(input: string) {
  const normalized = input.trim().toUpperCase();
  if (!/^#?[0-9A-F]{6}$/.test(normalized)) return null;
  return normalized.startsWith("#") ? normalized : `#${normalized}`;
}

function parseRgb(input: string) {
  const match = input.trim().match(/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/i);
  if (!match) return null;
  const values = match.slice(1).map(Number);
  if (values.some((value) => value < 0 || value > 255)) return null;
  return rgbToHex(values[0], values[1], values[2]);
}

function parseHsl(input: string) {
  const match = input.trim().match(/^hsl\(([-\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?\)$/i);
  if (!match) return null;
  const h = Number(match[1]);
  const s = clamp(Number(match[2]), 0, 100);
  const l = clamp(Number(match[3]), 0, 100);
  if (![h, s, l].every(Number.isFinite)) return null;
  return hslToHex(h, s, l);
}

export function convertColor(input: string) {
  const hex = parseHex(input) || parseRgb(input) || parseHsl(input);
  if (!hex) return { error: "仅支持 HEX、rgb(...)、hsl(...) 三种输入格式" };
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  return {
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    oklch: `oklch(${(hsl.l / 100).toFixed(2)} ${((hsl.s / 100) * 0.18).toFixed(2)} ${Math.round(hsl.h)})`,
    preview: hex,
  };
}
