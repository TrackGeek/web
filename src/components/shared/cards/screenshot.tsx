import { Images } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "../../ui/dialog";

interface ScreenshotProps {
  title: string;
  imageURL: string;
  images: string[];
}

export function ScreenshotItem({ title, imageURL, images }: ScreenshotProps) {
  return (
    <Dialog>
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
                <Images size={48} />
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
              <CarouselItem key={image}>
                <img
                  src={image}
                  className="w-full aspect-video object-contain"
                  alt={`${title} – screenshot ${index + 1} of ${images.length}`}
                />
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
