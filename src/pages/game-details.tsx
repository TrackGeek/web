import {
	SiAppstore,
	SiBluesky,
	SiBlueskyHex,
	SiDiscord,
	SiDiscordHex,
	SiEpicgames,
	SiEpicgamesHex,
	SiFacebook,
	SiFacebookHex,
	SiGogdotcom,
	SiGoogleplay,
	SiGoogleplayHex,
	SiInstagram,
	SiInstagramHex,
	SiItchdotio,
	SiItchdotioHex,
	SiReddit,
	SiRedditHex,
	SiSteam,
	SiSteamHex,
	SiTwitch,
	SiTwitchHex,
	SiWikipedia,
	SiX,
	SiYoutube,
	SiYoutubeHex,
} from "@icons-pack/react-simple-icons";
import {
	Bookmark,
	BookSearch,
	Box,
	Bug,
	Building2,
	Cctv,
	CheckCircle,
	CheckSquare,
	Code,
	Computer,
	EthernetPort,
	ExternalLink,
	Gamepad,
	MoreHorizontal,
	Star,
	TreeDeciduous,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ListItem } from "@/components/details/list";
import { ReviewItem } from "@/components/details/review";
import { Layout } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function GameDetails() {
	const { t } = useTranslation();

	return (
		<Layout title="Game Name">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3">
					<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
						<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
							<img
								src="https://images.igdb.com/igdb/image/upload/t_original/cobc4t.webp"
								alt="Capa do jogo"
								className="w-full h-auto object-cover"
							/>
						</div>

						<div className="grid grid-cols-3 w-full gap-4">
							<Button className="w-full h-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-purple-400 transition-all duration-300 bg-card hover:bg-purple-400/20">
								<div className="flex flex-col items-center gap-x-4 gap-2">
									<div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
										<Bookmark className="text-purple-400 size-6" />
									</div>
									<p className="font-medium text-card-foreground text-center text-base">
										{t("feed:lists.wanttoplay")}
									</p>
								</div>
								<div className="status-indicator hidden">
									<CheckCircle className="text-secondary w-6 h-6" />
								</div>
							</Button>

							<Button className="w-full h-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:bg-primary/20">
								<div className="flex flex-col items-center gap-x-4 gap-2">
									<div className="w-10 h-10 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
										<Gamepad className="text-primary size-6" />
									</div>
									<p className="font-medium text-card-foreground text-center text-base">
										{t("feed:lists.playing")}
									</p>
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
									<p className="font-medium text-card-foreground text-center text-base">
										{t("feed:lists.played")}
									</p>
								</div>
								<div className="status-indicator hidden">
									<CheckCircle className="text-secondary w-6 h-6" />
								</div>
							</Button>
						</div>

						<Button className="flex bg-transparent items-center justify-center space-x-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
							<MoreHorizontal className="w-5 h-5" />
							<span className="text-sm font-medium">
								{t("library:moreOptions")}
							</span>
						</Button>

						<div className="border-t border-border"></div>

						<div className="grid grid-cols-2 gap-4">
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:status")}
								</p>
								<p className="font-semibold text-card-foreground">
									Early Access
								</p>
							</div>
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:releaseDate")}
								</p>
								<p className="font-semibold text-card-foreground">13/01/2026</p>
							</div>
						</div>
						<Button variant="outline" className="w-full">
							{t("library:refreshData")}
						</Button>
						<div className="flex flex-wrap gap-3 items-center justify-center">
							<Link to="https://anacondamovie.com/" target="_blank">
								<ExternalLink />
							</Link>
							<Link to="https://anacondamovie.com/" target="_blank">
								<BookSearch />
							</Link>
							<Link
								to="https://steam.com/"
								target="_blank"
								className={cn(`hover:text-[${SiSteamHex}]`)}
							>
								<SiSteam />
							</Link>
							<Link
								to="https://epicgames.com/"
								target="_blank"
								className={cn(`hover:text-[${SiEpicgamesHex}]`)}
							>
								<SiEpicgames />
							</Link>
							<Link to="https://gog.com/" target="_blank">
								<SiGogdotcom />
							</Link>
							<Link
								to="https://itch.io/"
								target="_blank"
								className={cn(`hover:text-[${SiItchdotioHex}]`)}
							>
								<SiItchdotio />
							</Link>
							<Link
								to="https://googleplay.com/"
								target="_blank"
								className={cn(`hover:text-[${SiGoogleplayHex}]`)}
							>
								<SiGoogleplay />
							</Link>
							<Link to="https://applestore.com/" target="_blank">
								<SiAppstore />
							</Link>
							<Link
								to="https://instagram.com/theanacondamovie/"
								target="_blank"
								className={cn(`hover:text-[${SiInstagramHex}]`)}
							>
								<SiInstagram />
							</Link>
							<Link
								to="https://www.facebook.com/AnacondaMovie"
								target="_blank"
								className={cn(`hover:text-[${SiFacebookHex}]`)}
							>
								<SiFacebook />
							</Link>
							<Link
								to="https://x.com/Anaconda_Movie"
								target="_blank"
								className={cn(`hover:text-white`)}
							>
								<SiX />
							</Link>{" "}
							<Link
								to="https://discord.gg/"
								target="_blank"
								className={cn(`hover:text-[${SiDiscordHex}]`)}
							>
								<SiDiscord />
							</Link>
							<Link
								to="https://youtube.com/@"
								target="_blank"
								className={cn(`hover:text-[${SiYoutubeHex}]`)}
							>
								<SiYoutube />
							</Link>
							<Link
								to="https://twitch.tv/@"
								target="_blank"
								className={cn(`hover:text-[${SiTwitchHex}]`)}
							>
								<SiTwitch />
							</Link>
							<Link
								to="https://reddit.com/@"
								target="_blank"
								className={cn(`hover:text-[${SiRedditHex}]`)}
							>
								<SiReddit />
							</Link>
							<Link
								to="https://bsky.app/@"
								target="_blank"
								className={cn(`hover:text-[${SiBlueskyHex}]`)}
							>
								<SiBluesky />
							</Link>
							<Link to="https://wikipedia.com/Anaconda_Movie" target="_blank">
								<SiWikipedia />
							</Link>
						</div>
					</div>
				</div>

				<div className="lg:w-2/3">
					<div className="bg-card rounded-2xl shadow-lg p-8">
						<div className="mb-5">
							<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
								Hytale
							</h1>
							<div className="flex items-center space-x-2 mt-2">
								<Box className="w-5 h-5 text-muted-foreground" />
								<Link
									to={"/games-franchises/franchise_name"}
									className="text-xl text-muted-foreground"
								>
									franchise_name (can be hidden if not exists)
								</Link>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-6 mb-5 pb-6 border-b border-border">
							<div className="flex items-center">
								<div className="flex mr-2">
									<Star className="w-5 h-5 text-chart-3 fill-chart-3" />
									<Star className="w-5 h-5 text-chart-3 fill-chart-3" />
									<Star className="w-5 h-5 text-chart-3 fill-chart-3" />
									<Star className="w-5 h-5 text-chart-3 fill-chart-3" />
									<Star className="w-5 h-5 text-muted-foreground" />
								</div>
								<span className="font-semibold text-card-foreground">4.2</span>
								<span className="text-muted-foreground ml-1">
									(128.543 {t("library:reviews")})
								</span>
							</div>
						</div>
						<Tabs defaultValue="info">
							<div className="flex items-center justify-between gap-3 mb-2">
								<TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
									<TabsTrigger value="info">{t("library:info")}</TabsTrigger>
									<TabsTrigger value="reviews" className="capitalize">
										{t("library:reviews")} (125)
									</TabsTrigger>
									<TabsTrigger value="lists">
										{t("library:lists")} (30)
									</TabsTrigger>
									<TabsTrigger value="screenshots">
										{t("library:screenshots")} (67)
									</TabsTrigger>
								</TabsList>
							</div>
							<TabsContent value="info">
								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:genres")}
									</h3>
									<div className="flex flex-wrap gap-2">
										<span className="px-3 py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium">
											RPG
										</span>
										<span className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium">
											Aventura
										</span>
										<span className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium">
											Indie
										</span>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:synopsis")}
									</h3>
									<div className="text-muted-foreground leading-relaxed space-y-4">
										<p>
											Hytale combines the scope of a sandbox with the depth of a
											roleplaying game, immersing players in a procedurally
											generated world where teetering towers and deep dungeons
											promise rich rewards throughout their adventures. Hytale
											supports everything from block-by-block construction to
											scripting and minigame creation, delivered using easy to
											use and powerful tools.
										</p>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:gameCharacteristics")}
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Code className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:developers")}
												</p>
												<p className="font-medium text-card-foreground">
													Hypixel Studios
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Building2 className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:publishers")}
												</p>
												<p className="font-medium text-card-foreground">
													Hypixel Studios
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Computer className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:platforms")}
												</p>
												<p className="font-medium text-card-foreground">
													Linux, Mac, PC (Microsoft Windows)
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<TreeDeciduous className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:themes")}
												</p>
												<p className="font-medium text-card-foreground">
													Action, Fantasy, Sandbox
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<EthernetPort className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:gameModes")}
												</p>
												<p className="font-medium text-card-foreground">
													Single player, Multiplayer
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Cctv className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:playerPerspectives")}
												</p>
												<p className="font-medium text-card-foreground">
													First Person, Third Person
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Bug className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:gameEngine")}
												</p>
												<p className="font-medium text-card-foreground">
													Custom C# Engine
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:communityStatistics")}
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.wanttoplay")}
												</span>
												<Bookmark className="w-5 h-5 text-purple-400" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												5%
											</p>
										</div>

										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.playing")}
												</span>
												<Gamepad className="w-5 h-5 text-chart-1" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												15%
											</p>
										</div>

										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.played")}
												</span>
												<CheckCircle className="w-5 h-5 text-secondary" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												72%
											</p>
										</div>

										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.dropped")}
												</span>
												<XCircle className="w-5 h-5 text-destructive" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												8%
											</p>
										</div>
									</div>
								</div>
								<Carousel
									className="w-full px-4"
									opts={{
										loop: true,
										align: "center",
									}}
								>
									<CarouselContent>
										<CarouselItem>
											<iframe
												src="https://youtube.com/embed/rhaqjb_S2X8"
												allowFullScreen
												className="w-full aspect-video"
												title="Trailer"
											/>
										</CarouselItem>
										<CarouselItem>
											<img
												src="https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp"
												className="w-full aspect-video"
												alt="Screenshot"
											/>
										</CarouselItem>
										<CarouselItem>
											<img
												src="https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp"
												className="w-full aspect-video"
												alt="Screenshot"
											/>
										</CarouselItem>
									</CarouselContent>
									<CarouselPrevious variant="default" className="-left-6" />
									<CarouselNext variant="default" className="-right-6" />
								</Carousel>
							</TabsContent>
							<TabsContent value="reviews">
								<ReviewItem />
							</TabsContent>
							<TabsContent value="lists">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<ListItem />
								</div>
							</TabsContent>{" "}
							<TabsContent value="screenshots">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<ImageZoom>
										<img
											src="https://images.igdb.com/igdb/image/upload/t_720p/sc5rij.webp"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://images.igdb.com/igdb/image/upload/t_720p/sc5rii.webp"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://images.igdb.com/igdb/image/upload/t_720p/sc5rim.webp"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://images.igdb.com/igdb/image/upload/t_720p/sc5rin.webp"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://images.igdb.com/igdb/image/upload/t_720p/sc5riq.webp"
											alt=""
										/>
									</ImageZoom>
								</div>
							</TabsContent>
						</Tabs>
					</div>

					<div className="mt-6 text-center text-sm text-muted-foreground">
						<p>
							Nota: O botão "Mais opções" abriria um modal para gerenciar status
							avançados como "Abandonado", "Rejogando", "Pausado", etc. Ainda
							vai ter "100%", "Main Game", "Main Game + Extras" e "Endless" num
							novo status
						</p>
					</div>
				</div>
			</div>
		</Layout>
	);
}
