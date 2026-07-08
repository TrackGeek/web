import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CastFavoriteCardProps {
  name: string;
  image: string;
  link: string;
}

export function CastFavoriteCard({ name, image, link }: CastFavoriteCardProps) {
  return (
    <Link to={link} className={"w-fit flex flex-col items-center gap-2 max-w-24 my-2"}>
      <Avatar className="size-24">
        {image ? (
          <Image
            src={image}
            width={96}
            height={96}
            alt={`Avatar of ${name}`}
            className="size-full object-cover object-top"
          />
        ) : (
          <AvatarFallback className="rounded-lg">{name}</AvatarFallback>
        )}
      </Avatar>
      <p className="text-card-foreground font-bold text-center text-sm">{name}</p>
    </Link>
  );
}
