import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ShareButton } from "@/components/shared/share-button.tsx";

export interface FranchiseItem {
  key: string | number;
  title: string;
  url: string;
  imageUrl?: string | null;
  isAdult?: boolean;
}

interface FranchisePageProps {
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  items: FranchiseItem[];
}

export function FranchisePage({ name, description, bannerUrl, items }: FranchisePageProps) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="relative w-full overflow-hidden rounded-xl border border-border">
        <Image
          src={bannerUrl || "/placeholder/banner-1.webp"}
          layout="fullWidth"
          aspectRatio={16 / 9}
          className="w-full h-60 md:h-100 object-cover object-top"
          alt={name}
        />

        <div className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30 to-transparent" />

        <ShareButton title={name} text={description ?? undefined} className="absolute top-4 right-4 z-10" />

        <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide drop-shadow-md">{t("common:franchise")}</p>
            <h1 className="text-4xl font-bold drop-shadow-lg">{name}</h1>
          </div>

          {description && (
            <div className="max-w-2xl hidden md:block">
              <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="py-6 space-y-4">
        <p className="text-2xl font-bold">{t("common:titleCount", { count: items.length })}</p>

        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {items.map((item) => (
            <CardItem
              title={item.title}
              url={item.url}
              imageURL={item.imageUrl}
              isAdult={item.isAdult}
              key={item.key}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}
