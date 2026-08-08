import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { CompanyMediaType, CompanyWork } from "./types";

const MEDIA_ICONS: Record<CompanyMediaType, string> = {
  movie: "lucide:clapperboard",
  tv: "lucide:tv",
  anime: "lucide:sparkles",
  game: "lucide:gamepad-2",
};

export function workUrl(mediaType: CompanyMediaType, work: CompanyWork) {
  return `/${mediaType}/${work.id}`;
}

export function WorkCard({ mediaType, work }: { mediaType: CompanyMediaType; work: CompanyWork }) {
  const roles = work.roles.filter(Boolean).join(", ");

  return (
    <Link
      to={workUrl(mediaType, work)}
      className="group flex flex-col gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-lg border border-border bg-muted">
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-transform duration-300 motion-safe:group-hover:scale-105",
            work.isAdult && "blur-md group-hover:blur-none",
          )}
          style={{ backgroundImage: `url("${work.imageUrl || "/placeholder/cover.webp"}")` }}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-white text-xs backdrop-blur-sm">
          <Icon icon={MEDIA_ICONS[mediaType]} className="size-3" aria-hidden="true" />
          {work.year ?? ""}
        </div>
      </div>

      <div className="min-w-0 space-y-0.5">
        <p className="line-clamp-2 font-semibold text-card-foreground text-sm transition-colors group-hover:text-primary">
          {work.title}
        </p>
        {roles && <p className="line-clamp-1 text-muted-foreground text-xs">{roles}</p>}
      </div>
    </Link>
  );
}
