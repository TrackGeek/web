import { useTranslation } from "react-i18next";

interface EpisodeProps {
  title: string;
  imageURL: string;
  number: number;
}

export function EpisodeItem({
  title = "The Radio",
  imageURL = "https://image.tmdb.org/t/p/w500/3Eu4gBRqBcv0rZf9ut1Ksx0j0W6.jpg",
  number = 1,
}: EpisodeProps) {
  const { t } = useTranslation();
  return (
    <div className="relative rounded-xl border border-border overflow-hidden aspect-video">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url("${imageURL}")`,
        }}
      />
      <div className="relative bg-linear-to-t from-muted/80 via-muted/40 to-transparent p-3 h-full flex flex-col justify-end">
        <p className="font-bold text-card-foreground">{title}</p>
        <p className="text-muted-foreground font-bold text-sm">
          {t("library:episode")} {number}
        </p>
      </div>
    </div>
  );
}
