import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";

interface CardProps {
  title: string;
  url: string;
  imageURL?: string | null;
  isAdult?: boolean;
  rating?: number;
  year?: number;
  synopsis?: string;
  mediaType?: string;
}

export function CardItem(item: CardProps) {
  const imageURL =
    (item.imageURL ?? null)?.replace(
      "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
      "/placeholder/cover.webp",
    ) ?? "/placeholder/cover.webp";

  return (
    <Link to={item.url} className="space-y-2">
      <div className="relative rounded-lg border border-border overflow-hidden aspect-3/4 group">
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80",
            item.isAdult && "blur-md group-hover:blur-none",
          )}
          style={{ backgroundImage: `url("${imageURL}")` }}
        />

        {item.isAdult && (
          <Button variant="destructive" size="xs" className="absolute top-1 left-1 group-hover:opacity-0">
            NSFW
          </Button>
        )}
      </div>

      <p className="font-bold text-card-foreground hover:text-primary transition-colors line-clamp-2">{item.title}</p>
    </Link>
  );
}
