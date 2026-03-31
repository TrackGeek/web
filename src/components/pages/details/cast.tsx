import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function CastItem({ imageUrl, character, name }: { imageUrl: string; name: string; character: string }) {
  return (
    <Link
      to={"/"}
      search={{ landing: "true" }}
      className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border"
    >
      <div className="flex items-center justify-between mb-2">
        <Avatar className="w-full aspect-square h-full rounded-2xl">
          <AvatarImage src={imageUrl} alt={`Avatar of ${name}`} className="object-cover aspect-3/4 h-full" />
          <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-card-foreground font-bold text-center">{name}</p>
      <p className="text-muted-foreground text-center">{character}</p>
    </Link>
  );
}
