const icon = (body: string) => ({
  body: `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g>`,
});

export const REWIND_ICONS = {
  prefix: "lucide",
  width: 24,
  height: 24,
  icons: {
    rewind: icon('<path d="m11 19-9-7 9-7v14Zm11 0-9-7 9-7v14Z"/>'),
    play: icon('<path d="m6 3 14 9-14 9V3Z"/>'),
    x: icon('<path d="m18 6-12 12M6 6l12 12"/>'),
    text: icon('<path d="M17 6H3m18 6H3m18 6H3"/>'),
    "gallery-horizontal-end": icon('<rect x="2" y="3" width="12" height="18" rx="2"/><path d="M18 3v18M22 3v18"/>'),
    "volume-x": icon('<path d="m11 5-5 4H3v6h3l5 4V5Zm6 4 6 6m0-6-6 6"/>'),
    "volume-2": icon('<path d="m11 5-5 4H3v6h3l5 4V5Zm4.54 3.46a5 5 0 0 1 0 7.08m3.53-10.61a10 10 0 0 1 0 14.14"/>'),
    "chevron-left": icon('<path d="m15 18-6-6 6-6"/>'),
    "chevron-right": icon('<path d="m9 18 6-6-6-6"/>'),
    "rotate-ccw": icon('<path d="M3 11a9 9 0 1 1 2.8 6.5M3 3v8h8"/>'),
    "share-2": icon(
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/>',
    ),
    clapperboard: icon(
      '<path d="m4 11 4-8m4 8 4-8m4 8 2-4M2 11h20"/><rect x="2" y="3" width="20" height="18" rx="2"/>',
    ),
    "tv-minimal-play": icon('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="m10 7 5 3-5 3V7Zm-2 14h8"/>'),
    mountain: icon('<path d="m8 3 4 8 4-3 6 13H2L8 3Zm-2 9 2-2 3 3 2-1"/>'),
    "gamepad-2": icon(
      '<path d="M6 12h4m-2-2v4m7-1h.01M18 11h.01M6 5h12c2 0 3 2 3.4 4l1 7c.4 3-2 4-4 2l-2-2H7.6l-2 2c-2 2-4.4 1-4-2l1-7C3 7 4 5 6 5Z"/>',
    ),
    "library-big": icon(
      '<rect x="3" y="3" width="4" height="18" rx="1"/><path d="M11 3v18m5-17 4-1 4 17-4 1-4-17ZM3 7h4"/>',
    ),
    book: icon(
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 3H20v19H6.5A2.5 2.5 0 0 1 4 19.5v-14A2.5 2.5 0 0 1 6.5 3Z"/>',
    ),
  },
};
