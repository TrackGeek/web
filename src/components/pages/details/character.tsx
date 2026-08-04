import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PersonLink } from "./cast";

interface VoiceActor {
  malId: number;
  name: string;
  language: string;
  slug?: string | null;
}

interface CharacterItemProps {
  name: string;
  imageUrl?: string | null;
  role?: string;
  voiceActors?: VoiceActor[];
}

const PREFERRED_LANGUAGES = ["Japanese", "English"];

function primaryVoiceActors(voiceActors: VoiceActor[]): VoiceActor[] {
  const preferred = PREFERRED_LANGUAGES.flatMap(
    (language) => voiceActors.find((actor) => actor.language === language) ?? [],
  );

  return preferred.length > 0 ? preferred : voiceActors.slice(0, 1);
}

export function CharacterItem({ name, imageUrl, role, voiceActors = [] }: CharacterItemProps) {
  const actors = primaryVoiceActors(voiceActors);

  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border bg-linear-to-br from-muted/50 to-muted p-4">
      <div className="flex items-center justify-between">
        <Avatar className="aspect-square h-full w-full rounded-2xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              width={300}
              height={400}
              alt={`Avatar of ${name}`}
              className="aspect-3/4 h-full object-cover"
            />
          ) : (
            <AvatarFallback className="rounded-lg">
              <Icon icon="lucide:user-round" className="size-8 text-muted-foreground" aria-hidden="true" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="space-y-0.5 text-center">
        <p className="font-bold text-card-foreground">{name}</p>
        {role && <p className="text-muted-foreground text-sm">{role}</p>}
      </div>

      {actors.length > 0 && (
        <ul className="mt-auto space-y-0.5 border-border/60 border-t pt-2 text-center">
          {actors.map((actor) => (
            <li key={actor.malId} className="text-muted-foreground text-xs">
              <PersonLink slug={actor.slug}>{actor.name}</PersonLink>
              <span className="text-muted-foreground/60"> · {actor.language}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
