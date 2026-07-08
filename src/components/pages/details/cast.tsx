import { Image } from "@unpic/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CastItem({ imageUrl, character, name }: { imageUrl: string; name: string; character: string }) {
  return (
    <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-2">
        <Avatar className="w-full aspect-square h-full rounded-2xl">
          {imageUrl ? (
            <Image
              className="object-cover aspect-3/4 h-full"
              src={imageUrl}
              width={300}
              height={400}
              alt={`Avatar of ${name}`}
            />
          ) : (
            <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
          )}
        </Avatar>
      </div>
      <p className="text-card-foreground font-bold text-center">{name}</p>
      <p className="text-muted-foreground text-center">{character}</p>
    </div>
  );
}
