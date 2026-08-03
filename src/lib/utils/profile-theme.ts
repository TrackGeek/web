import type { CSSProperties } from "react";

export const DEFAULT_PROFILE_COLOR = "#10b981";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const SHADE_SCALE: Array<[shade: number, lightness: number, chromaRatio: number]> = [
  [50, 0.971, 0.24],
  [100, 0.944, 0.4],
  [200, 0.9, 0.62],
  [300, 0.83, 0.82],
  [400, 0.75, 0.95],
  [500, 0.68, 1],
  [600, 0.6, 0.98],
  [700, 0.52, 0.88],
  [800, 0.44, 0.76],
  [900, 0.38, 0.66],
  [950, 0.27, 0.5],
];

function hexToOklch(hex: string) {
  const [red, green, blue] = [1, 3, 5].map((index) => {
    const channel = Number.parseInt(hex.slice(index, index + 2), 16) / 255;

    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  const axisA = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const axisB = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;

  return { chroma: Math.hypot(axisA, axisB), hue: (Math.atan2(axisB, axisA) * 180) / Math.PI };
}

export function profileThemeStyle(color?: string | null): CSSProperties {
  const base = color && HEX_COLOR_REGEX.test(color) ? color.toLowerCase() : DEFAULT_PROFILE_COLOR;

  if (base === DEFAULT_PROFILE_COLOR) return {};

  const { chroma, hue } = hexToOklch(base);

  const style: Record<string, string> = {};

  for (const [shade, lightness, chromaRatio] of SHADE_SCALE) {
    style[`--color-malachite-${shade}`] = `oklch(${lightness} ${(chroma * chromaRatio).toFixed(4)} ${hue.toFixed(2)})`;
  }

  return style as CSSProperties;
}
