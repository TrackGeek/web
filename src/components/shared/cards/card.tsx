import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";

interface CardProps {
  title: string;
  url: string;
  imageURL: string;
  isAdult?: boolean;
  rating?: number;
  year?: number;
  synopsis?: string;
  mediaType?: string;
}

export function CardItem({ title, url, imageURL, isAdult = false }: CardProps) {
  return (
    <Link to={url} className="space-y-2">
      <div className="relative rounded-lg border border-border overflow-hidden aspect-3/4 group">
        <div
          className={cn(
            "absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80",
            isAdult && "blur-md group-hover:blur-none",
          )}
          style={{ backgroundImage: `url("${imageURL}")` }}
        />

        {isAdult && (
          <Button variant="destructive" size="xs" className="absolute top-1 left-1 group-hover:opacity-0">
            NSFW
          </Button>
        )}
      </div>

      <p className="font-bold text-card-foreground hover:text-primary transition-colors line-clamp-2">{title}</p>
    </Link>
  );
}
