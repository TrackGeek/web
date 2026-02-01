import { SiWikipedia } from "@icons-pack/react-simple-icons";
import {
	Bookmark,
	BookOpenText,
	CheckCircle,
	CheckSquare,
	ExternalLink,
	FilePenLine,
	Hash,
	MoreHorizontal,
	Notebook,
	Pen,
	Star,
	SwatchBook,
	TreePalm,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CharacterItem } from "@/components/details/character";
import { ListItem } from "@/components/details/list";
import { Relations } from "@/components/details/relations";
import { ReviewItem } from "@/components/details/review";
import { Layout } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MangaDetails() {
	const { t } = useTranslation();

	return (
		<Layout title="Manga Name">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3">
					<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
						<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
							<img
								src="https://cdn.myanimelist.net/images/manga/3/179023l.jpg"
								alt="Capa do mangá"
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
										{t("feed:lists.planning")}
									</p>
								</div>
								<div className="status-indicator hidden">
									<CheckCircle className="text-secondary w-6 h-6" />
								</div>
							</Button>

							<Button className="w-full h-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:bg-primary/20">
								<div className="flex flex-col items-center gap-x-4 gap-2">
									<div className="w-10 h-10 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
										<BookOpenText className="text-primary size-6" />
									</div>
									<p className="font-medium text-card-foreground text-center text-base">
										{t("feed:lists.reading")}
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
										{t("feed:lists.read")}
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
								<p className="font-semibold text-card-foreground">Finished</p>
							</div>
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:releaseDate")}
								</p>
								<p className="font-semibold text-card-foreground">
									Feb 15, 2016 to May 18, 2020
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
							<Link to="https://www.imdb.com/title/tt4900148" target="_blank">
								<SiWikipedia />
							</Link>
						</div>
					</div>
				</div>

				<div className="lg:w-2/3">
					<div className="bg-card rounded-2xl shadow-lg p-8">
						<div className="mb-5">
							<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
								Kimetsu no Yaiba
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
									<TabsTrigger value="characters">
										{t("library:characters")}
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
											to="/manga/genres/action"
											className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium"
										>
											Action
										</Link>
										<Link
											to="/manga/genres/fantasy"
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
											Tanjirou Kamado lives with his impoverished family on a
											remote mountain. As the oldest sibling, he took upon the
											responsibility of ensuring his family's livelihood after
											the death of his father. On a cold winter day, he goes
											down to the local village in order to sell some charcoal.
											As dusk falls, he is forced to spend the night in the
											house of a curious man who cautions him of strange
											creatures that roam the night: malevolent demons who crave
											human flesh.
											<br />
											<br />
											When he finally makes his way home, Tanjirou's worst
											nightmare comes true. His entire family has been brutally
											slaughtered with the sole exception of his sister Nezuko,
											who has turned into a flesh-eating demon. Engulfed in
											hatred and despair, Tanjirou desperately tries to stop
											Nezuko from attacking other people, setting out on a
											journey to avenge his family and find a way to turn his
											beloved sister back into a human.
										</p>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:mangaCharacteristics")}
									</h3>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<FilePenLine className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:type")}
												</p>
												<p className="font-medium text-card-foreground">
													Manga
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Hash className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:chapters")}
												</p>
												<p className="font-medium text-card-foreground">207</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<SwatchBook className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:volumes")}
												</p>
												<p className="font-medium text-card-foreground">23</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<TreePalm className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:themes")}
												</p>
												<p className="font-medium text-card-foreground flex-wrap flex">
													<Link to="/manga-themes/historical">Historical</Link>
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Pen className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:authors")}
												</p>
												<p className="font-medium text-card-foreground flex-wrap flex">
													<Link to="/mangaka/gotouge-koyoharu">
														Gotouge, Koyoharu
													</Link>
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Notebook className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:publisher")}
												</p>
												<p className="font-medium text-card-foreground flex-wrap flex">
													<Link to="/magazine/shounen-jump">Shounen Jump</Link>
												</p>
											</div>
										</div>
									</div>
								</div>

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
													{t("feed:lists.reading")}
												</span>
												<BookOpenText className="w-5 h-5 text-chart-1" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												15%
											</p>
										</div>

										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.read")}
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
							</TabsContent>
							<TabsContent value="relations">
								<Relations />
							</TabsContent>
							<TabsContent value="reviews">
								<ReviewItem />
							</TabsContent>
							<TabsContent value="lists">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<ListItem />
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
						</Tabs>
					</div>

					<div className="mt-6 text-center text-sm text-muted-foreground">
						<p>
							Nota: O botão "Mais opções" abriria um modal para gerenciar status
							avançados como "Abandonado", "Relendo", "Pausado", etc.
						</p>
					</div>
				</div>
			</div>
		</Layout>
	);
}
