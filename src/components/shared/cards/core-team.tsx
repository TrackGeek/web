import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/ui/avatar";

type RoleType = "reviewer" | "developer" | "project-management" | "staff" | "designer";

interface CoreTeamProps {
  name: string;
  url: string;
  avatarURL: string;
  role: RoleType;
}

export function CoreTeamItem({ name, url, avatarURL, role }: CoreTeamProps) {
  const { t } = useTranslation();

  return (
    <Link to={url}>
      <div className="flex flex-col rounded-xl border border-border bg-muted/50 items-center p-2 py-5 gap-y-1.5">
        <Avatar className="size-24">
          <Image className="aspect-square size-full" src={avatarURL} width={96} height={96} alt={`Avatar of ${name}`} />
        </Avatar>
        <p className="text-primary font-bold text-xl">{name}</p>
        <p className="text-card-foreground">{t(`common:roles.${role}`)}</p>
      </div>
    </Link>
  );
}
