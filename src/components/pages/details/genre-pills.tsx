import { Link } from "@tanstack/react-router";
import type { ContentType } from "@/components/layouts/filters.tsx";

const colors = [
  "bg-chart-1/20 text-chart-1 border-chart-1/30 from-chart-1/20 to-chart-1/30",
  "bg-chart-2/20 text-chart-2 border-chart-2/30 from-chart-2/20 to-chart-2/30",
  "bg-chart-3/20 text-chart-3 border-chart-3/30 from-chart-3/20 to-chart-3/30",
  "bg-chart-4/20 text-chart-4 border-chart-4/30 from-chart-4/20 to-chart-4/30",
  "bg-chart-5/20 text-chart-5 border-chart-5/30 from-chart-5/20 to-chart-5/30",
];

interface GenrePillsProps {
  genres: string[];
  type: ContentType;
  getLabel?: (genre: string) => string;
}

export function GenrePills({ genres, type, getLabel }: GenrePillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre, index) => (
        <Link
          key={genre}
          to="/search"
          search={{ type, genres: genre }}
          className={`px-3 py-1.5 bg-linear-to-r ${colors[index % colors.length]} border rounded-full text-sm font-medium transition-colors hover:brightness-125`}
        >
          {getLabel ? getLabel(genre) : genre}
        </Link>
      ))}
    </div>
  );
}
