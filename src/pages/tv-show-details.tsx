import {
	SiFacebook,
	SiFacebookHex,
	SiImdb,
	SiImdbHex,
	SiInstagram,
	SiInstagramHex,
	SiX,
} from "@icons-pack/react-simple-icons";
import {
	Bookmark,
	Box,
	Building,
	CheckCircle,
	CheckSquare,
	Clock,
	ExternalLink,
	FilePenLine,
	FileType,
	Hash,
	Languages,
	MoreHorizontal,
	Star,
	TvIcon,
	TvMinimalPlay,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CastItem } from "@/components/details/cast";
import { EpisodeItem } from "@/components/details/episode";
import { ListItem } from "@/components/details/list";
import {
	EpisodeProgress,
	type SeasonData,
} from "@/components/details/progress";
import { ReviewItem } from "@/components/details/review";
import { Layout } from "@/components/layouts/main";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function TVShowDetails() {
	const { t } = useTranslation();
	const [mySeasons, setMySeasons] = useState<SeasonData[]>([
		{
			seasonNumber: 0,
			totalEpisodes: 3,
			watchedEpisodes: [1, 2],
		},
		{
			seasonNumber: 1,
			totalEpisodes: 10,
			watchedEpisodes: [1, 2, 3, 4, 5],
		},
		{
			seasonNumber: 2,
			totalEpisodes: 8,
			watchedEpisodes: [],
		},
	]);

	function handleToggle(season: number, ep: number) {
		console.log(season, ep);
	}
	return (
		<Layout title="TV Show Name">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3">
					<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
						<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
							<img
								src="https://www.themoviedb.org/t/p/w1280/c15BtJxCXMrISLVmysdsnZUPQft.jpg"
								alt="Capa da série"
								className="w-full h-auto object-cover"
							/>
						</div>

						<div className="grid grid-cols-3 w-full gap-4">
							<button
								type="button"
								className="w-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-purple-400 transition-all duration-300 bg-card hover:bg-purple-400/20"
							>
								<div className="flex flex-col items-center gap-x-4 gap-2">
									<div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
										<Bookmark className="text-purple-400" />
									</div>
									<p className="font-medium text-card-foreground text-center">
										{t("feed:lists.planning")}
									</p>
								</div>
								<div className="status-indicator hidden">
									<CheckCircle className="text-secondary w-6 h-6" />
								</div>
							</button>

							<button
								type="button"
								className="w-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:bg-primary/20"
							>
								<div className="flex flex-col items-center gap-x-4 gap-2">
									<div className="w-10 h-10 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
										<TvMinimalPlay className="text-primary" />
									</div>
									<p className="font-medium text-card-foreground text-center">
										{t("feed:lists.watching")}
									</p>
								</div>
								<div className="status-indicator hidden">
									<CheckCircle className="text-secondary w-6 h-6" />
								</div>
							</button>

							<button
								type="button"
								className="w-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-3 transition-all duration-300 bg-card hover:bg-chart-3/20"
							>
								<div className="flex flex-col items-center gap-x-4 gap-2">
									<div className="w-10 h-10 rounded-full bg-linear-to-r from-chart-3/20 to-amber-500/20 flex items-center justify-center border border-chart-3/30">
										<CheckSquare className="text-chart-3" />
									</div>
									<p className="font-medium text-card-foreground text-center">
										{t("feed:lists.completed")}
									</p>
								</div>
								<div className="status-indicator hidden">
									<CheckCircle className="text-secondary w-6 h-6" />
								</div>
							</button>
						</div>

						<button
							type="button"
							className="flex items-center justify-center space-x-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300"
						>
							<MoreHorizontal className="w-5 h-5" />
							<span className="text-sm font-medium">
								{t("library:moreOptions")}
							</span>
						</button>

						<div className="border-t border-border"></div>

						<div className="grid grid-cols-2 gap-4">
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:status")}
								</p>
								<p className="font-semibold text-card-foreground">Returning</p>
							</div>
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:releaseDate")}
								</p>
								<p className="font-semibold text-card-foreground">2024</p>
							</div>
						</div>
						<Link
							to="https://www.themoviedb.org/tv/106379-fallout"
							target="_blank"
						>
							<Button variant="outline" className="w-full">
								{t("library:refreshData")}
							</Button>
						</Link>
						<div className="flex flex-wrap gap-3 items-center justify-center">
							<Link to="https://anacondamovie.com/" target="_blank">
								<ExternalLink />
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
							</Link>
							<Link
								to="https://www.imdb.com/title/tt4900148"
								target="_blank"
								className={cn(`hover:text-[${SiImdbHex}]`, "my-1 mr-1")}
							>
								<SiImdb />
							</Link>
						</div>
					</div>
				</div>

				<div className="lg:w-2/3">
					<div className="bg-card rounded-2xl shadow-lg p-8">
						<div className="mb-5">
							<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
								Fallout
							</h1>
							<div className="flex items-center space-x-2 mt-2">
								<Box className="w-5 h-5 text-muted-foreground" />
								<Link
									to={"/movies-collection/franchise_name"}
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
									<TabsTrigger value="episodes">
										{t("library:episodes")}
									</TabsTrigger>
									<TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
									<TabsTrigger value="medias">
										{t("library:medias")}
									</TabsTrigger>
									<TabsTrigger value="reviews" className="capitalize">
										{t("library:reviews")} (125)
									</TabsTrigger>
									<TabsTrigger value="lists">
										{t("library:lists")} (30)
									</TabsTrigger>
								</TabsList>
							</div>
							<TabsContent value="info">
								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:genres")}
									</h3>
									<div className="flex flex-wrap gap-2">
										<Link
											to="/tv/genres/action"
											className="px-3 py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium"
										>
											Ação
										</Link>
										<Link
											to="/tv/genres/adventure"
											className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium"
										>
											Aventura
										</Link>
										<Link
											to="/tv/genres/scifi"
											className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium"
										>
											Sci-fi
										</Link>
										<Link
											to="/tv/genres/fantasy"
											className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium"
										>
											Fantasy
										</Link>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:synopsis")}
									</h3>
									<div className="text-muted-foreground leading-relaxed space-y-4">
										<p>
											The story of haves and have-nots in a world in which
											there's almost nothing left to have. 200 years after the
											apocalypse, the gentle denizens of luxury fallout shelters
											are forced to return to the irradiated hellscape their
											ancestors left behind — and are shocked to discover an
											incredibly complex, gleefully weird, and highly violent
											universe waiting for them.
										</p>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:tvShowCharacteristics")}
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<FilePenLine className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:creators")}
												</p>
												<Link
													to="/cast/graham-wagner"
													className="font-medium text-card-foreground"
												>
													Graham Wagner
												</Link>
												,
												<Link
													to="/cast/geneva-robertson-dworet"
													className="font-medium text-card-foreground"
												>
													Geneva Robertson-Dworet
												</Link>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Hash className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:seasons")}
												</p>
												<p className="font-medium text-card-foreground">2</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<TvIcon className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:totalEpisodes")}
												</p>
												<p className="font-medium text-card-foreground">16</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Languages className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:language")}
												</p>
												<p className="font-medium text-card-foreground">
													English
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Building className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:productionCompanies")}
												</p>
												<p className="font-medium text-card-foreground">
													Amazon Prime Video
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Clock className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:runtime")}
												</p>
												<p className="font-medium text-card-foreground">
													14 hours 20 minutes
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<FileType className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:type")}
												</p>
												<p className="font-medium text-card-foreground">
													Scripted
												</p>
											</div>
										</div>
									</div>
								</div>

								<EpisodeProgress
									seasons={mySeasons}
									defaultSeason={1}
									seasonCustomNames={{
										0: t("library:specials"),
									}}
									onToggle={handleToggle}
								/>

								<div className="my-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:communityStatistics")}
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.planning")}
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
													{t("feed:lists.watching")}
												</span>
												<TvMinimalPlay className="w-5 h-5 text-chart-1" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												15%
											</p>
										</div>

										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.completed")}
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

								<iframe
									src="https://youtube.com/embed/0kQ8i2FpRDk"
									allowFullScreen
									className="w-full aspect-video"
									title="Trailer"
								/>
							</TabsContent>
							<TabsContent value="episodes">
								<Accordion type="single" collapsible defaultValue="item-1">
									<AccordionItem value="item-1">
										<AccordionTrigger className="cursor-pointer">
											<h3 className="font-semibold text-card-foreground text-lg mb-3">
												{t("library:season", { count: 1 })} 1
											</h3>
										</AccordionTrigger>
										<AccordionContent>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
											</div>
										</AccordionContent>
									</AccordionItem>
									<AccordionItem value="item-2">
										<AccordionTrigger className="cursor-pointer">
											<h3 className="font-semibold text-card-foreground text-lg mb-3">
												{t("library:season", { count: 1 })} 2
											</h3>
										</AccordionTrigger>
										<AccordionContent>
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
												<EpisodeItem />
											</div>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</TabsContent>
							<TabsContent value="reviews">
								<ReviewItem />
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
										<img
											src="https://image.tmdb.org/t/p/original/zLyuE8viLa6g9NELI5JFETlQoJm.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/beADML9mJgtTGnmXR6nbdAVdoqC.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/k7sjr8AgGfK8uKwTZ4pB2h1pTQB.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/kd9lR1lJrUZMpuNEaNhaM9N3TOW.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/w5PzqjBhUlJHpRyhBRHvEdkJ0iK.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/cJ3cm8GwUmUvWXnMIbwlmC6trGf.jpg"
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
							avançados como "Abandonado", "Revendo", "Pausado", etc.
						</p>
					</div>
				</div>
			</div>
		</Layout>
	);
}
