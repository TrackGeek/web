import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitialsFromName } from "@/lib/utils";

type RoleType = "reviewer" | "developer" | "designer" | "translator" | "supporter";

interface ContributorsProps {
  name: string;
  url: string;
  avatarURL?: string | null;
  roleType: RoleType;
}

export function ContributorsItem({ name, url, avatarURL, roleType }: ContributorsProps) {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a href={url} aria-label={name}>
          <Avatar className="size-24 border-border border-2">
            {avatarURL ? (
              <Image className="aspect-square size-full" src={avatarURL} width={96} height={96} alt={name} />
            ) : (
              <AvatarFallback className="text-2xl">{getInitialsFromName(name)}</AvatarFallback>
            )}
          </Avatar>
        </a>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-primary font-bold text-xl">{name}</p>
        <p className="text-card-foreground">{t(`common:roles.${roleType}`)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
