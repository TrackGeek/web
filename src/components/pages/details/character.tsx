import { Image } from "@unpic/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CharacterItem({
  name = "Fern",
  imageUrl = "https://cdn.myanimelist.net/images/characters/12/619183.jpg?s=15f45c66440c0e9843e2f0109f0c1aef",
}: {
  name: string;
  imageUrl: string;
}) {
  return (
    <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border space-y-2">
      <div className="flex items-center justify-between">
        <Avatar className="w-full aspect-square h-full rounded-2xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              width={300}
              height={400}
              alt={`Avatar of ${name}`}
              className="object-cover aspect-3/4 h-full"
            />
          ) : (
            <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
          )}
        </Avatar>
      </div>
      <p className="text-card-foreground font-bold text-center">{name}</p>
    </div>
  );
}
