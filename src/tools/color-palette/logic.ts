import { hexToHsl, hslToHex, readableTextColor } from "../../shared/color";

export type PaletteColor = {
  role: string;
  label: string;
  hex: string;
  text: string;
};

export function buildGeneratedPalette(baseHex: string): PaletteColor[] {
  const hsl = hexToHsl(baseHex);
  const colors = [
    { role: "primary", label: "主色", hex: baseHex },
    { role: "secondary", label: "辅助色", hex: hslToHex(hsl.h + 36, Math.max(35, hsl.s * 0.75), Math.min(82, hsl.l + 10)) },
    { role: "accent", label: "强调色", hex: hslToHex(hsl.h + 170, Math.max(45, hsl.s), Math.max(45, hsl.l)) },
    { role: "surface", label: "背景", hex: hslToHex(hsl.h, 24, 96) },
    { role: "text", label: "正文", hex: hslToHex(hsl.h, 28, 16) },
  ];
  return colors.map((color) => ({ ...color, text: readableTextColor(color.hex) }));
}

export function buildPaletteCss(colors: PaletteColor[]) {
  return `:root {\n${colors.map((color) => `  --color-${color.role}: ${color.hex};`).join("\n")}\n}`;
}
