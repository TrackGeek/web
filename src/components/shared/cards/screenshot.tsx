import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";

export interface ScreenshotImage {
  id: string;
  url: string;
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
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0" aria-label={"Gallery"}>
        <Carousel
          className="w-full px-8 py-6"
          opts={{
            loop: true,
            align: "center",
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id}>
                <div className="relative">
                  <Image
                    src={image.url}
                    layout="fullWidth"
                    aspectRatio={16 / 9}
                    className={`w-full aspect-video object-contain transition-all duration-300 ${
                      isRevealed(image) ? "" : "blur-xl"
                    }`}
                    alt={`${title} – screenshot ${index + 1} of ${images.length}`}
                  />
                  {!isRevealed(image) && (
                    <button
                      type="button"
                      className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-white bg-black/40"
                      onClick={() => setRevealed((prev) => [...prev, image.id])}
                    >
                      <Icon icon={"lucide:eye-off"} className="size-4" />
                      {t("comments:spoilerReveal")}
                    </button>
                  )}
                </div>
                {image.description && (
                  <p className="text-sm text-muted-foreground text-center mt-3 px-4">{image.description}</p>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious variant="default" className="left-2" />
          <CarouselNext variant="default" className="right-2" />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
