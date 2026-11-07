import { OG_COLORS } from "@/lib/og/theme";

const STAR_PATH =
  "M12 2.5 14.94 8.46 21.52 9.42 16.76 14.06 17.88 20.61 12 17.52 6.12 20.61 7.24 14.06 2.48 9.42 9.06 8.46Z";
const STAR_SIZE = 42;

export function OgStarRating({ score }: { score: number }) {
  const rating = Number.isFinite(score) ? Math.max(0, Math.min(5, score)) : 0;

  return (
    <div style={{ display: "flex", gap: 8 }} role="img" aria-label={`${rating.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${STAR_SIZE}" height="${STAR_SIZE}" viewBox="0 0 24 24"><defs><clipPath id="fill"><rect width="${24 * fill}" height="24"/></clipPath></defs><path d="${STAR_PATH}" fill="${OG_COLORS.starEmpty}"/><path d="${STAR_PATH}" fill="${OG_COLORS.star}" clip-path="url(#fill)"/></svg>`;

        return (
          <img
            key={index}
            src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
            width={STAR_SIZE}
            height={STAR_SIZE}
            alt=""
          />
        );
      })}
    </div>
  );
}
