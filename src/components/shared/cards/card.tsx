import ViteImage from "@son426/vite-image/react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Heart, Star } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/lib/auth.ts";
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
}

export function CardItem({ title, url, rating, year, imageURL, mediaType, synopsis }: CardProps) {
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [_mediaStatus, setMediaStatus] = useState<string | null>(null);

  const handleStatusChange = (status: string) => {
    setMediaStatus(status);
  };

  const handleSaveSuccess = (status: string) => {
    if (status === "completed" || status === "finished" || status === "played") {
      setMainDialogOpen(false);
      setReviewDialogOpen(true);
    }
  };

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  return (
    <div>
      <div className="relative rounded-xl border border-border overflow-hidden aspect-3/4 group">
        <Link to={url}>
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80"
            style={{
              backgroundImage: `url("${imageURL}")`,
            }}
          />
        </Link>

        {isAuthenticated && (
          <Dialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
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
                  <EpisodicContentModal onStatusChange={handleStatusChange} />
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
        <p className="font-bold text-card-foreground mt-2 hover:text-primary transition-colors line-clamp-2">{title}</p>
      </Link>
    </div>
  );
}
