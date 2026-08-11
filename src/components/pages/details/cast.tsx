import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type CastLinkTarget = "/cast/$slug" | "/manga/cast/$slug";

interface CastItemProps {
  imageUrl?: string | null;
  name: string;
  character: string;
  slug?: string | null;
  to?: CastLinkTarget;
}

function CastCard({ imageUrl, name, character, isLinked }: CastItemProps & { isLinked: boolean }) {
  return (
    <div
      className={`h-full rounded-xl border border-border bg-linear-to-br from-muted/50 to-muted p-4 transition-colors ${
        isLinked ? "group-hover:border-primary/60" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <Avatar className="aspect-square h-full w-full rounded-2xl">
          {imageUrl ? (
            <Image
              className="aspect-3/4 h-full object-cover"
              src={imageUrl}
              width={300}
              height={400}
              alt={`Avatar of ${name}`}
            />
          ) : (
            <AvatarFallback className="rounded-lg">
              <Icon icon="lucide:user-round" className="size-8 text-muted-foreground" aria-hidden="true" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      <p
        className={`text-center font-bold text-card-foreground ${isLinked ? "transition-colors group-hover:text-primary" : ""}`}
      >
        {name}
      </p>
      <p className="text-center text-muted-foreground">{character}</p>
    </div>
  );
}

export function CastItem({ imageUrl, character, name, slug, to = "/cast/$slug" }: CastItemProps) {
  const card = <CastCard imageUrl={imageUrl} name={name} character={character} isLinked={!!slug} />;

  if (!slug) {
    return card;
  }

  return (
    <Link
      to={to}
      params={{ slug }}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {card}
    </Link>
  );
}

export function PersonLink({ slug, children }: { slug?: string | null; children: ReactNode }) {
  if (!slug) {
    return <>{children}</>;
  }

  return (
    <Link
      to="/cast/$slug"
      params={{ slug }}
      className="underline-offset-4 transition-colors hover:text-primary hover:underline"
    >
      {children}
    </Link>
  );
}
