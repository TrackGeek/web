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
	Clapperboard,
	Clock,
	ExternalLink,
	Languages,
	MoreHorizontal,
	PiggyBank,
	Projector,
	Star,
	Ticket,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CastItem } from "@/components/details/cast";
import { ListItem } from "@/components/details/list";
import { ReviewItem } from "@/components/details/review";
import { Layout } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function MovieDetails() {
	const { t } = useTranslation();

	return (
		<Layout title="Movie Name">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3">
					<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
						<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
							<img
								src="https://image.tmdb.org/t/p/w1280/hBxN6dwrANN1ic3a4G9x6JZcR3C.jpg"
								alt="Capa do filme"
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
										<Projector className="text-primary" />
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
								<p className="font-semibold text-card-foreground">Released</p>
							</div>
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:releaseDate")}
								</p>
								<p className="font-semibold text-card-foreground">25/12/2025</p>
							</div>
						</div>
						<Link
							to="https://www.themoviedb.org/movie/1234731-anaconda"
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
								Anaconda
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
											to="/movies/genres/comedy"
											className="px-3 py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium"
										>
											Comédia
										</Link>
										<Link
											to="/movies/genres/adventure"
											className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium"
										>
											Aventura
										</Link>
										<Link
											to="/movies/genres/horror"
											className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium"
										>
											Horror
										</Link>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:synopsis")}
									</h3>
									<div className="text-muted-foreground leading-relaxed space-y-4">
										<p>
											A group of friends facing mid-life crises head to the
											rainforest with the intention of remaking their favorite
											movie from their youth, only to find themselves in a fight
											for their lives against natural disasters, giant snakes
											and violent criminals.
										</p>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:movieCharacteristics")}
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Clapperboard className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:directors")}
												</p>
												<Link
													to="/cast/tom-gormican"
													className="font-medium text-card-foreground"
												>
													Tom Gormican
												</Link>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<PiggyBank className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:budget")}
												</p>
												<p className="font-medium text-card-foreground">
													$45,000,000.00
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Ticket className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:revenue")}
												</p>
												<p className="font-medium text-card-foreground">
													$128,328,016.00
												</p>
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
													Sony Pictures
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
													1h 40m
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
												<Projector className="w-5 h-5 text-chart-1" />
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
									src="https://youtube.com/embed/az8M5Mai0X4"
									allowFullScreen
									className="w-full aspect-video"
								/>
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
											src="https://image.tmdb.org/t/p/original/1pi3gH590JGNsFO0ngAoiyKacA7.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/7VgSwKz420hI9sqXiXpGCViBq2C.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/9pOh1eQ0bjbFiBGqT3mYaeRPLru.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/1ysgMpzp4ftZBiCT8k7rq6R2obv.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/y342NhmRhXNbxhxWQbYv65bvf4C.jpg"
											alt=""
										/>
									</ImageZoom>
									<ImageZoom>
										<img
											src="https://image.tmdb.org/t/p/original/kLApBgtLOfpCdT9bJWfRVCcRYMY.jpg"
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
