import type { CSSProperties } from "react";

export const AVATAR_FRAME_CLASSES: Record<string, string> = {
  none: "",
  glow: "ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]",
  neon: "ring-2 ring-fuchsia-400 shadow-[0_0_16px_rgba(232,121,249,0.9)]",
  gold_ring: "ring-[3px] ring-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]",
  rose_petals: "ring-2 ring-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.7)]",
  aurora: "ring-2 ring-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7),0_0_22px_rgba(167,139,250,0.6)]",
  obsidian_ring: "ring-[3px] ring-zinc-700 shadow-[0_0_12px_rgba(24,24,27,0.9)]",
};

export const BANNER_EFFECT_CLASSES: Record<string, string> = {
  none: "",
  gradient_wave: "bg-gradient-to-r from-emerald-500/25 via-transparent to-emerald-500/25 animate-pulse",
  particles: "bg-[radial-gradient(circle,rgba(255,255,255,0.9)_1px,transparent_1px)] bg-[size:18px_18px] opacity-25",
  scanlines:
    "bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_4px)]",
  vignette_glow: "bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]",
  aurora_sky: "bg-gradient-to-tr from-violet-500/25 via-cyan-400/20 to-emerald-400/25",
};

export const PROFILE_GRADIENT_PREFIX = "gradient:";

export const PROFILE_GRADIENTS: Record<string, { css: string; base: string }> = {
  dusk: { css: "linear-gradient(135deg, #f43f5e, #8b5cf6)", base: "#f43f5e" },
  oceanic: { css: "linear-gradient(135deg, #06b6d4, #2563eb)", base: "#06b6d4" },
  sunrise: { css: "linear-gradient(135deg, #f59e0b, #fb7185)", base: "#f59e0b" },
  nebula: { css: "linear-gradient(135deg, #8b5cf6, #d946ef)", base: "#8b5cf6" },
  aurora_flow: { css: "linear-gradient(135deg, #34d399, #22d3ee, #a78bfa)", base: "#34d399" },
  prism: { css: "linear-gradient(135deg, #f43f5e, #f59e0b, #34d399, #22d3ee, #8b5cf6)", base: "#8b5cf6" },
};

export function hasAvatarFrame(frame?: string | null): boolean {
  return Boolean(frame) && frame !== "none";
}

export function isGradientColor(value?: string | null): value is string {
  return Boolean(value?.startsWith(PROFILE_GRADIENT_PREFIX));
}

export function gradientKeyFromValue(value: string): string {
  return value.slice(PROFILE_GRADIENT_PREFIX.length);
}

export function resolveProfileColorHex(value?: string | null): string | null | undefined {
  if (isGradientColor(value)) {
    return PROFILE_GRADIENTS[gradientKeyFromValue(value)]?.base ?? null;
  }

  return value;
}

export function profileColorBackgroundStyle(value?: string | null): CSSProperties {
  if (isGradientColor(value)) {
    const gradient = PROFILE_GRADIENTS[gradientKeyFromValue(value)];

    if (gradient) return { backgroundImage: gradient.css };
  }

  return { backgroundColor: value ?? undefined };
}

// Var CSS consumida pelo global.css (.profile-gradient) pra pintar borders
// com o gradiente via double-background (padding-box/border-box).
export function profileGradientVars(value?: string | null): CSSProperties {
  if (!isGradientColor(value)) return {};

  const gradient = PROFILE_GRADIENTS[gradientKeyFromValue(value)];

  if (!gradient) return {};

  return { "--profile-gradient": gradient.css } as CSSProperties;
}
