import ViteImage from "@son426/vite-image/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, Star } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { BookModal } from "../modals/book";
import { EpisodicContentModal } from "../modals/episodic-content";
import { GameModal } from "../modals/game";
import { MangaModal } from "../modals/manga";
import { MovieModal } from "../modals/movie";
import { ReviewModal } from "../modals/review";

type MediaType = "anime" | "movie" | "tv" | "game" | "book" | "manga";

interface CardProps {
  title: string;
  url: string;
  imageURL: string;
  rating: number;
  year: number | undefined;
  synopsis: string;
  mediaType: MediaType;
  mediaData?: any;
  isAdult?: boolean;
  progress?: number;
  total?: number;
  key: string;
}

export function CardItem({
  title,
  url,
  rating,
  year,
  imageURL,
  mediaType,
  synopsis,
  isAdult = false,
  progress,
  total,
}: CardProps) {
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [_mediaStatus, setMediaStatus] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(progress ?? 0);

  const handleStatusChange = (status: string) => {
    setMediaStatus(status);
  };

  const handleSaveSuccess = (status: string) => {
    if (status === "completed" || status === "finished" || status === "played") {
      setMainDialogOpen(false);
      setReviewDialogOpen(true);
    }
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["media-detail", mediaType, url],
    queryFn: async () => {
      // futura chamada à API
      return true;
    },
    enabled: mainDialogOpen,
    staleTime: 1000 * 60 * 5,
  });

  const handleDialogOpen = (open: boolean) => {
    setMainDialogOpen(open);
    if (open) refetch();
  };

  const handleProgressIncrement = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
    if (total === undefined || currentProgress < total) {
      setCurrentProgress((prev) => prev + 1);
    }
    if (currentProgress + 1 === total) {
      setReviewDialogOpen(true);
    }
  };

  const showProgress = progress !== undefined && total !== undefined;

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg border border-border overflow-hidden aspect-3/4 group">
        <Link to={url}>
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80",
              isAdult && "blur-md group-hover:blur-none",
            )}
            style={{ backgroundImage: `url("${imageURL}")` }}
          />
        </Link>

        {isAdult && (
          <Button variant="destructive" size="xs" className="absolute top-1 left-1 group-hover:opacity-0">
            NSFW
          </Button>
        )}

        {isAuthenticated && (
          <Dialog open={mainDialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm rounded-full size-7"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
              <DialogHeader
                className="h-48 p-0 flex flex-row items-center bg-cover bg-center px-6 relative"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${imageURL}")`,
                }}
              >
                <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                <div className="flex flex-row items-center w-full">
                  <ViteImage
                    src={{ src: imageURL, blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH", height: 160, width: 112 }}
                    alt="Cover"
                    className="w-28! h-40 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
                  />
                  <div className="flex-1 px-6 relative z-10">
                    <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg mb-2">{title}</DialogTitle>
                    <div className="flex items-center gap-4 text-white/90 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span>{rating}</span>
                      </div>
                      <span>•</span>
                      <span>{year}</span>
                    </div>
                    <p className="text-white/80 text-sm mt-2 max-w-md line-clamp-2">{synopsis}</p>
                  </div>
                </div>

                <div className="absolute z-50 top-[45%] right-10 flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                    <Heart className="size-6" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
                {(mediaType === "anime" || mediaType === "tv") && (
                  <EpisodicContentModal onStatusChange={handleStatusChange} onSaveSuccess={handleSaveSuccess} />
                )}
                {mediaType === "movie" && (
                  <MovieModal onStatusChange={handleStatusChange} onSaveSuccess={handleSaveSuccess} />
                )}
                {mediaType === "book" && (
                  <BookModal onStatusChange={handleStatusChange} onSaveSuccess={handleSaveSuccess} />
                )}
                {mediaType === "game" && (
                  <GameModal onStatusChange={handleStatusChange} onSaveSuccess={handleSaveSuccess} />
                )}
                {mediaType === "manga" && (
                  <MangaModal onStatusChange={handleStatusChange} onSaveSuccess={handleSaveSuccess} />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {isAuthenticated && showProgress && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-auto flex items-center gap-1.5 bg-primary-foreground/65 backdrop-blur-sm rounded-full px-2.5 py-1 border border-primary/15">
            <span className="text-xs font-medium text-white/90">
              {currentProgress}/{total}
            </span>
            <Button
              onClick={handleProgressIncrement}
              className="size-5 px-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-white text-sm leading-none hover:bg-primary/30 transition-colors"
            >
              +
            </Button>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <ReviewModal
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          mediaTitle={title}
          mediaImage={imageURL}
        />
      )}

      <Link to={url}>
        <p className="font-bold text-card-foreground hover:text-primary transition-colors line-clamp-2">{title}</p>
      </Link>
    </div>
  );
}
