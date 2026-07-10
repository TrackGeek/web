import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApiTypes } from "@/lib/api";

interface StatisticsCardProps {
  user: ApiTypes.User;
}

type MediaKey = keyof ApiTypes.User["progressStats"];

interface MediaConfig {
  key: MediaKey;
  icon: string;
  label: string;
  gradient: string;
  border: string;
  iconColor: string;
}

const MEDIA_CONFIG: MediaConfig[] = [
  {
    key: "anime",
    icon: "lucide:mountain",
    label: "common:types.anime_other",
    gradient: "from-purple-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-300",
  },
  {
    key: "manga",
    icon: "lucide:library-big",
    label: "common:types.manga_other",
    gradient: "from-rose-500/20",
    border: "border-rose-500/30",
    iconColor: "text-rose-300",
  },
  {
    key: "tvShow",
    icon: "lucide:tv-minimal-play",
    label: "common:types.tv_other",
    gradient: "from-blue-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-300",
  },
  {
    key: "movie",
    icon: "lucide:clapperboard",
    label: "common:types.movie_other",
    gradient: "from-amber-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-300",
  },
  {
    key: "game",
    icon: "lucide:gamepad-2",
    label: "common:types.game_other",
    gradient: "from-emerald-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-300",
  },
  {
    key: "book",
    icon: "lucide:book",
    label: "common:types.book_other",
    gradient: "from-indigo-500/20",
    border: "border-indigo-500/30",
    iconColor: "text-indigo-300",
  },
];

function MediaTile({
  icon,
  label,
  gradient,
  border,
  iconColor,
  total,
}: {
  icon: string;
  label: string;
  gradient: string;
  border: string;
  iconColor: string;
  total: number;
}) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border bg-linear-to-br to-transparent p-4 ${gradient} ${border}`}>
      <div className="flex size-9 items-center justify-center rounded-xl bg-white/5">
        <Icon icon={icon} className={`size-5 ${iconColor}`} />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(label)}</span>
        <span className="text-2xl font-bold text-card-foreground">{total}</span>
      </div>
    </div>
  );
}

export function StatisticsCard({ user }: StatisticsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:trending-up" className="size-5" />

          {t("user:statistics")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MEDIA_CONFIG.map(({ key, icon, label, gradient, border, iconColor }) => (
            <MediaTile
              key={key}
              icon={icon}
              label={label}
              gradient={gradient}
              border={border}
              iconColor={iconColor}
              total={user.progressStats[key].total}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
