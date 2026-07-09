import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ApiTypes } from "@/lib/api";

interface MedalsCardProps {
  userMedals: ApiTypes.User["userMedals"];
}

function MedalIcon({ name, imageUrl }: { name: string; imageUrl: string }) {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full rounded-md bg-muted/70 flex items-center justify-center aspect-square">
          <Image src={imageUrl} width={40} height={40} alt={name} className="size-10" />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-muted">
        <div className="max-w-xs">
          <div className="font-semibold">{t(`medals:${name}.name`)}</div>
          <div className="text-xs text-muted-foreground">{t(`medals:${name}.description`)}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function MedalsCard({ userMedals }: MedalsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:medal" className="size-5" />

          {t("user:medals")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {userMedals.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {userMedals.map(({ medal }) => (
              <MedalIcon key={medal.id} name={medal.name} imageUrl={medal.imageUrl} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground leading-relaxed">{t("user:noMedals")}</p>
        )}
      </CardContent>
    </Card>
  );
}
