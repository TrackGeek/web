import {
	SiFacebook,
	SiFacebookHex,
	SiInstagram,
	SiInstagramHex,
	SiMyanimelist,
	SiX,
} from "@icons-pack/react-simple-icons";
import {
	Bookmark,
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
import {
	AnimeEpisodeProgress,
	type SingleSeasonData,
} from "@/components/details/anime-progress";
import { AnimeRelations } from "@/components/details/anime-relations";
import { CastItem } from "@/components/details/cast";
import { CharacterItem } from "@/components/details/character";
import { EpisodeItem } from "@/components/details/episode";
import { ListItem } from "@/components/details/list";
import { ReviewItem } from "@/components/details/review";
import { Layout } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function AnimeDetails() {
	const { t } = useTranslation();
	const [mySeason, setMySeason] = useState<SingleSeasonData>({
		totalEpisodes: 12,
		watchedEpisodes: [1, 2, 3, 4, 5],
	});

	function handleToggle(ep: number) {
		console.log(ep);
	}
	return (
		<Layout title="Anime Name">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3">
					<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
						<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
							<img
								src="https://cdn.myanimelist.net/images/anime/1921/154528l.jpg"
								alt="Capa do anime"
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
								<p className="font-semibold text-card-foreground">
									Currently Airing
								</p>
							</div>
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:releaseDate")}
								</p>
								<p className="font-semibold text-card-foreground">
									Winter 2026
								</p>
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
							<Link to="https://www.imdb.com/title/tt4900148" target="_blank">
								<SiMyanimelist />
							</Link>
						</div>
					</div>
				</div>

				<div className="lg:w-2/3">
					<div className="bg-card rounded-2xl shadow-lg p-8">
						<div className="mb-5">
							<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
								Sousou no Frieren 2nd Season
							</h1>
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
									<TabsTrigger value="relations">
										{t("library:relations")}
									</TabsTrigger>
									<TabsTrigger value="episodes">
										{t("library:episodes")}
									</TabsTrigger>
									<TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
									<TabsTrigger value="characters">
										{t("library:characters")}
									</TabsTrigger>
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
											to="/anime/genres/adventure"
											className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium"
										>
											Aventura
										</Link>
										<Link
											to="/anime/genres/scifi"
											className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium"
										>
											Drama
										</Link>
										<Link
											to="/anime/genres/fantasy"
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
										<p>Second season of Sousou no Frieren.</p>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:animeCharacteristics")}
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<FilePenLine className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:type")}
												</p>
												<p className="font-medium text-card-foreground">TV</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Hash className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:source")}
												</p>
												<p className="font-medium text-card-foreground">
													Manga
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<TvIcon className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:totalEpisodes")}
												</p>
												<p className="font-medium text-card-foreground">12</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<FileType className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:broadcast")}
												</p>
												<p className="font-medium text-card-foreground">
													Fridays at 23:00 (JST)
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Building className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:rating")}
												</p>
												<p className="font-medium text-card-foreground">
													PG-13
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
													24 min
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<FileType className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:studios")}
												</p>
												<p className="font-medium text-card-foreground flex-wrap flex">
													<Link to="/anime-producers/graham-wagner">
														Aniplex
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														Dentsu
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														Nippon Television Network
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														TOHO animation
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														Shogakukan-Shueisha Productions
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														Sound Team Don Juan
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														Miracle Bus
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														Shogakukan
													</Link>
													,
													<Link to="/anime-producers/graham-wagner">
														TOHO Music
													</Link>
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Languages className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:producers")}
												</p>
												<p className="font-medium text-card-foreground flex-wrap flex">
													<Link to="/anime-producers/graham-wagner">
														Madhouse
													</Link>
												</p>
											</div>
										</div>
									</div>
								</div>

								<AnimeEpisodeProgress
									season={mySeason}
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
									src="https://www.youtube-nocookie.com/embed/RH-FcW94z00?enablejsapi=1&wmode=opaque&autoplay=1"
									allowFullScreen
									className="w-full aspect-video"
									title="Trailer"
								/>
							</TabsContent>
							<TabsContent value="episodes">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<EpisodeItem />
									<EpisodeItem />
									<EpisodeItem />
									<EpisodeItem />
									<EpisodeItem />
									<EpisodeItem />
								</div>
							</TabsContent>
							<TabsContent value="relations">
								<AnimeRelations />
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
							<TabsContent value="characters">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<CharacterItem />
									<CharacterItem />
									<CharacterItem />
									<CharacterItem />
									<CharacterItem />
									<CharacterItem />
									<CharacterItem />
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
