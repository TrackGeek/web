import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TempItem {
  coverURL: string;
  episode: number;
  totalEpisodes: number;
  link: string;
}

interface Items {
  items: TempItem[];
}
export function StillWatching({ items }: Items) {
  const { t } = useTranslation();
  return (
    <div className="bg-border/30 backdrop-blur border-border w-full p-2 gap-2 flex flex-col rounded-xl">
      <span className="font-bold">{t("library:stillWatching")}</span>
      <div className={clsx("grid gap-3", items.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
        {items.map((item) => (
          <div key={item.link} className="w-full rounded-2xl">
            <Link to={item.link}>
              <img src={item.coverURL} alt="" className="rounded-t-2xl w-full aspect-3/4 object-cover" />
            </Link>
            <div className="bg-accent/30">
              <div
                className="h-1 bg-accent transition-all duration-500"
                style={{
                  width: `${(item.episode / item.totalEpisodes) * 100}%`,
                }}
              />
            </div>
            <div className="w-full bg-accent/30 flex items-center justify-center gap-2 rounded-b-2xl py-1">
              <p>
                {item.episode} / {item.totalEpisodes}
              </p>
              <Plus className="cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
