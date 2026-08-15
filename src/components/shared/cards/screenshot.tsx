import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ApiTypes } from "@/lib/api.ts";
import { parseVideoUrl, videoEmbedUrl, videoProviderIcon, videoThumbnailUrl } from "@/lib/utils/video";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";

export interface ScreenshotImage {
  id: string;
  url: string;
  type: ApiTypes.GameMediaType;
  description?: string | null;
  isSpoiler: boolean;
}

interface ScreenshotProps {
  title: string;
  imageURL: string;
  images: ScreenshotImage[];
}

export function ScreenshotItem({ title, imageURL, images }: ScreenshotProps) {
  const { t } = useTranslation();

  const [revealed, setRevealed] = useState<string[]>([]);
  const [current, setCurrent] = useState(1);
  const [api, setApi] = useState<CarouselApi>();

  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1);

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const isRevealed = (image: ScreenshotImage) => !image.isSpoiler || revealed.includes(image.id);

  return (
    <Dialog onOpenChange={(open) => !open && setRevealed([])}>
      <DialogTrigger asChild>
        <div className={"cursor-pointer"}>
          <div className="relative rounded-xl border border-border overflow-hidden aspect-3/4 group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-100 opacity-80"
              style={{
                backgroundImage: `url("${imageURL}")`,
              }}
            />
            <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:opacity-0 opacity-100 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <Icon icon={"lucide:images"} className={"size-12"} />
                <span className="font-semibold text-2xl">{images.length}</span>
              </div>
            </div>
          </div>
          <p className="font-bold text-card-foreground mt-2 hover:text-primary transition-colors line-clamp-2">
            {title}
          </p>
        </div>
      </DialogTrigger>
      <DialogContent
        className="max-w-[calc(100%-1rem)] sm:max-w-[min(1600px,95vw)] gap-0 overflow-hidden border-0 bg-black p-0 rounded-xl [&>button]:z-20 [&>button]:top-3 [&>button]:right-3 [&>button]:rounded-full [&>button]:bg-black/60 [&>button]:p-2 [&>button]:text-white [&>button]:opacity-100 [&>button]:hover:bg-black/80 [&>button_svg]:size-5"
        aria-label={"Gallery"}
      >
        <Carousel className="w-full" setApi={setApi} opts={{ loop: hasMultiple, align: "center" }}>
          <CarouselContent className="ml-0">
            {images.map((image, index) => (
              <CarouselItem key={image.id} className="pl-0">
                <div className="relative flex h-[85vh] w-full items-center justify-center">
                  <ScreenshotMedia
                    image={image}
                    title={title}
                    index={index}
                    total={images.length}
                    isActive={index + 1 === current}
                    isRevealed={isRevealed(image)}
                  />
                  {!isRevealed(image) && (
                    <button
                      type="button"
                      className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/40 text-sm font-medium text-white"
                      onClick={() => setRevealed((prev) => [...prev, image.id])}
                    >
                      <Icon icon={"lucide:eye-off"} className="size-4" />
                      {t("comments:spoilerReveal")}
                    </button>
                  )}
                  {image.description && isRevealed(image) && (
                    <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-6 pt-12 pb-6 text-center text-sm text-white/90">
                      {image.description}
                    </p>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {hasMultiple && (
            <>
              <CarouselPrevious
                variant="ghost"
                className="left-4 size-10 bg-black/60 text-white hover:bg-black/80 hover:text-white"
              />
              <CarouselNext
                variant="ghost"
                className="right-4 size-10 bg-black/60 text-white hover:bg-black/80 hover:text-white"
              />
              <div className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white tabular-nums">
                {current} / {images.length}
              </div>
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}

interface ScreenshotMediaProps {
  image: ScreenshotImage;
  title: string;
  index: number;
  total: number;
  isActive: boolean;
  isRevealed: boolean;
}

function ScreenshotMedia({ image, title, index, total, isActive, isRevealed }: ScreenshotMediaProps) {
  const blur = isRevealed ? "" : "blur-2xl";
  const label = `${title} – ${index + 1} of ${total}`;

  const video = image.type === "Video" ? parseVideoUrl(image.url) : null;

  if (!video) {
    return (
      <Image
        src={image.url}
        layout="fullWidth"
        aspectRatio={16 / 9}
        className={`max-h-full w-full object-contain transition-all duration-300 ${blur}`}
        alt={label}
      />
    );
  }

  const thumbnail = videoThumbnailUrl(video);

  if (!isActive || !isRevealed) {
    return (
      <div className="flex aspect-video max-h-full w-full items-center justify-center bg-neutral-950">
        {thumbnail && (
          <Image
            src={thumbnail}
            layout="fullWidth"
            aspectRatio={16 / 9}
            className={`max-h-full w-full object-contain transition-all duration-300 ${blur}`}
            alt={label}
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon icon={videoProviderIcon(video.provider)} className="size-16 text-white/70" />
        </span>
      </div>
    );
  }

  return (
    <iframe
      src={videoEmbedUrl(video)}
      title={label}
      className="aspect-video max-h-full w-full"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      allowFullScreen
    />
  );
}
