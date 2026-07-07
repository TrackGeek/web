import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type RoleType = "reviewer" | "developer" | "designer" | "translator" | "supporter";

interface ContributorsProps {
  name: string;
  url: string;
  avatarURL: string;
  role: RoleType;
}

export function ContributorsItem({ name, url, avatarURL, role }: ContributorsProps) {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger>
        <a href={url}>
          <Avatar className="size-24 border-border border-2">
            <Image
              className="aspect-square size-full"
              src={avatarURL}
              width={96}
              height={96}
              alt={`Avatar of ${name}`}
            />
          </Avatar>
        </a>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-primary font-bold text-xl">{name}</p>
        <p className="text-card-foreground">{t(`common:roles.${role}`)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
