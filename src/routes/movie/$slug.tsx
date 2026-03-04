import {
  SiFacebook,
  SiFacebookHex,
  SiImdb,
  SiImdbHex,
  SiInstagram,
  SiInstagramHex,
  SiX,
} from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Box,
  Building,
  CheckCircle,
  CheckSquare,
  Clapperboard,
  Clock,
  ExternalLink,
  Heart,
  Languages,
  MoreHorizontal,
  Pause,
  PiggyBank,
  Star,
  Ticket,
  Trash,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CastItem } from "@/components/pages/details/cast";
import { ListItem } from "@/components/pages/details/list";
import { ReviewItem } from "@/components/pages/details/review";
import { DetailsCard } from "@/components/shared/cards/details";
import { MovieModal } from "@/components/shared/modals/movie";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/movie/$slug")({
  head: () => ({
    meta: [...seo({ title: "Movie Details" })],
  }),
  component: MovieDetailsRoute,
});

export function MovieDetailsRoute() {
  const { slug: _ } = Route.useParams();

  const synopsis =
    "A group of friends facing mid-life crises head to the rainforest with the intention of remaking their favorite movie from their youth, only to find themselves in a fight for their lives against natural disasters, giant snakes and violent criminals.";
  const year = "25/12/2025";
  const imageURL = "https://image.tmdb.org/t/p/w1280/hBxN6dwrANN1ic3a4G9x6JZcR3C.jpg";
  const title = "Anaconda";
  const rating = 4.2;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
          <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
            <img src={imageURL} alt="Capa do filme" className="w-full h-auto object-cover" />
          </div>

          <div className="grid grid-cols-3 w-full gap-4">
            <Button className="w-full h-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-purple-400 transition-all duration-300 bg-card hover:bg-purple-400/20">
              <div className="flex flex-col items-center gap-x-4 gap-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
                  <Bookmark className="text-purple-400 size-6" />
                </div>
                <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.planning")}</p>
              </div>
              <div className="status-indicator hidden">
                <CheckCircle className="text-secondary w-6 h-6" />
              </div>
            </Button>

            <Button className="w-full h-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-3 transition-all duration-300 bg-card hover:bg-chart-3/20">
              <div className="flex flex-col items-center gap-x-4 gap-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-chart-3/20 to-amber-500/20 flex items-center justify-center border border-chart-3/30">
                  <CheckSquare className="text-chart-3 size-6" />
                </div>
                <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.completed")}</p>
              </div>
              <div className="status-indicator hidden">
                <CheckCircle className="text-secondary w-6 h-6" />
              </div>
            </Button>

            <Button className="w-full h-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-5 transition-all duration-300 bg-card hover:bg-chart-5/20">
              <div className="flex flex-col items-center gap-x-4 gap-2">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-chart-5/20 to-red-500/20 flex items-center justify-center border border-chart-5/30">
                  <Trash className="text-chart-5 size-6" />
                </div>
                <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.dropped")}</p>
              </div>
              <div className="status-indicator hidden">
                <CheckCircle className="text-secondary w-6 h-6" />
              </div>
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex bg-transparent items-center justify-center space-x-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
                <MoreHorizontal className="w-5 h-5" />
                <span className="text-sm font-medium">{t("library:moreOptions")}</span>
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
                  <img
                    src={imageURL}
                    alt="Cover"
                    className="w-28 h-40 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
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
                <MovieModal />
              </div>
            </DialogContent>
          </Dialog>

          <div className="border-t border-border"></div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">{t("library:status")}</p>
              <p className="font-semibold text-card-foreground">Released</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
              <p className="font-semibold text-card-foreground">{year}</p>
            </div>
          </div>
          <RefreshData sourceURL="https://www.themoviedb.org/movie/1234731-anaconda" />
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <a href="https://anacondamovie.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink />
            </a>
            <a
              href="https://instagram.com/theanacondamovie/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(`hover:text-[${SiInstagramHex}]`)}
            >
              <SiInstagram />
            </a>
            <a
              href="https://www.facebook.com/AnacondaMovie"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(`hover:text-[${SiFacebookHex}]`)}
            >
              <SiFacebook />
            </a>
            <a
              href="https://x.com/Anaconda_Movie"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(`hover:text-white`)}
            >
              <SiX />
            </a>
            <a
              href="https://www.imdb.com/title/tt4900148"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(`hover:text-[${SiImdbHex}]`, "my-1 mr-1")}
            >
              <SiImdb />
            </a>
          </div>
        </div>
      </div>

      <div className="lg:w-2/3">
        <div className="bg-card rounded-2xl shadow-lg p-8">
          <div className="mb-5">
            <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
              {title}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <Box className="size-5 text-muted-foreground" />
              <a href="/movies-collection/franchise_name" className="text-xl text-muted-foreground">
                franchise_name (can be hidden if not exists)
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-5 pb-6 border-b border-border">
            <div className="flex items-center">
              <div className="flex mr-2">
                <Star className="size-5 text-chart-3 fill-chart-3" />
                <Star className="size-5 text-chart-3 fill-chart-3" />
                <Star className="size-5 text-chart-3 fill-chart-3" />
                <Star className="size-5 text-chart-3 fill-chart-3" />
                <Star className="size-5 text-muted-foreground" />
              </div>
              <span className="font-semibold text-card-foreground">{rating}</span>
              <span className="text-muted-foreground ml-1">(128.543 {t("library:reviews")})</span>
            </div>
          </div>
          <Tabs defaultValue="info">
            <div className="flex items-center justify-between gap-3 mb-2">
              <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
                <TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
                <TabsTrigger value="medias">{t("library:medias")}</TabsTrigger>
                <TabsTrigger value="reviews" className="capitalize">
                  {t("library:reviews")} (125)
                </TabsTrigger>
                <TabsTrigger value="lists">{t("library:lists")} (30)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="info">
              <div className="mb-5">
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:genres")}</h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/"
                    className="px-3 py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium"
                  >
                    Comédia
                  </Link>
                  <Link
                    to="/"
                    className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium"
                  >
                    Aventura
                  </Link>
                  <Link
                    to="/"
                    className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium"
                  >
                    Horror
                  </Link>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:synopsis")}</h3>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>{synopsis}</p>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:movieCharacteristics")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailsCard
                    title={t("library:directors")}
                    icon={<Clapperboard className="size-5 text-muted-foreground" />}
                    description={
                      <Link to="/" className="font-medium text-card-foreground">
                        Tom Gormican
                      </Link>
                    }
                  />
                  <DetailsCard
                    title={t("library:budget")}
                    icon={<PiggyBank className="size-5 text-muted-foreground" />}
                    description={"$45,000,000.00"}
                  />
                  <DetailsCard
                    title={t("library:revenue")}
                    icon={<Ticket className="size-5 text-muted-foreground" />}
                    description={"$128,328,016.00"}
                  />
                  <DetailsCard
                    title={t("library:language")}
                    icon={<Languages className="size-5 text-muted-foreground" />}
                    description={"English"}
                  />
                  <DetailsCard
                    title={t("library:productionCompanies")}
                    icon={<Building className="size-5 text-muted-foreground" />}
                    description={"Sony Pictures"}
                  />
                  <DetailsCard
                    title={t("library:runtime")}
                    icon={<Clock className="size-5 text-muted-foreground" />}
                    description={"1h 40m"}
                  />
                </div>
              </div>

              <div className="mb-5">
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.planning")}</span>
                      <Bookmark className="size-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">5%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.completed")}</span>
                      <CheckCircle className="size-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">72%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.paused")}</span>
                      <Pause className="size-5 text-chart-3" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">15%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.dropped")}</span>
                      <XCircle className="size-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">8%</p>
                  </div>
                </div>
              </div>

              <iframe
                src="https://youtube.com/embed/az8M5Mai0X4"
                allowFullScreen
                className="w-full aspect-video"
                title="Trailer"
              />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewItem
                user={{
                  name: "John Doe",
                  avatarURL: "https://assets.hardcover.app/editions/30399846/4434002844651.jpg",
                  slug: "john-doe",
                }}
                reviewText={
                  "Very foda! AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Este livro é uma obra-prima que merece ser lida por todos os amantes de boa literatura. BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA A forma como o autor desenvolve os personagens é simplesmente magnífica, cada um com sua própria voz e personalidade única."
                }
                criteries={{
                  language: 5,
                  characters: 4,
                  all: 10,
                  story: 8,
                  theme: 9,
                }}
                date={new Date("2023-06-19")}
              />
            </TabsContent>
            <TabsContent value="lists">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ListItem />
              </div>
            </TabsContent>
            <TabsContent value="cast">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <CastItem />
                <CastItem />
                <CastItem />
                <CastItem />
                <CastItem />
                <CastItem />
                <CastItem />
              </div>
            </TabsContent>
            <TabsContent value="medias">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageZoom>
                  <img src="https://image.tmdb.org/t/p/original/1pi3gH590JGNsFO0ngAoiyKacA7.jpg" alt="" />
                </ImageZoom>
                <ImageZoom>
                  <img src="https://image.tmdb.org/t/p/original/7VgSwKz420hI9sqXiXpGCViBq2C.jpg" alt="" />
                </ImageZoom>
                <ImageZoom>
                  <img src="https://image.tmdb.org/t/p/original/9pOh1eQ0bjbFiBGqT3mYaeRPLru.jpg" alt="" />
                </ImageZoom>
                <ImageZoom>
                  <img src="https://image.tmdb.org/t/p/original/1ysgMpzp4ftZBiCT8k7rq6R2obv.jpg" alt="" />
                </ImageZoom>
                <ImageZoom>
                  <img src="https://image.tmdb.org/t/p/original/y342NhmRhXNbxhxWQbYv65bvf4C.jpg" alt="" />
                </ImageZoom>
                <ImageZoom>
                  <img src="https://image.tmdb.org/t/p/original/kLApBgtLOfpCdT9bJWfRVCcRYMY.jpg" alt="" />
                </ImageZoom>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
