import {
	BarChart3,
	Bookmark,
	BookOpen,
	BookOpenText,
	Brain,
	CheckCircle,
	CheckSquare,
	Clock,
	Heart,
	MoreHorizontal,
	Star,
	User,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BookDetails() {
	const { t } = useTranslation();

	return (
		<Layout title="Book Name">
			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-1/3">
					<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
						<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
							<img
								src="https://assets.hardcover.app/edition/31601422/3a01ea07-01f4-45a2-9940-6fc7e00e0d08.jpeg"
								alt="Capa do livro"
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
										<BookOpenText className="text-primary" />
									</div>
									<p className="font-medium text-card-foreground text-center">
										{t("feed:lists.reading")}
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
										{t("feed:lists.read")}
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
									{t("library:pages")}
								</p>
								<p className="font-semibold text-card-foreground">328</p>
							</div>
							<div className="bg-muted/50 p-4 rounded-lg border border-border">
								<p className="text-sm text-muted-foreground">
									{t("library:year")}
								</p>
								<p className="font-semibold text-card-foreground">2021</p>
							</div>
						</div>
						<Button variant="outline" className="w-full mt-5">
							{t("library:refreshData")}
						</Button>
					</div>
				</div>

				<div className="lg:w-2/3">
					<div className="bg-card rounded-2xl shadow-lg p-8">
						<div className="mb-5">
							<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
								O Nome do Vento
							</h1>
							<div className="flex items-center space-x-2">
								<User className="w-5 h-5 text-muted-foreground" />
								<p className="text-xl text-muted-foreground">
									Patrick Rothfuss
								</p>
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

							<div className="flex items-center text-muted-foreground">
								<BarChart3 className="w-5 h-5 mr-2" />
								<span>
									{t("library:medium")}: {Math.round(465 / 29)}{" "}
									{t("library:days")}
								</span>
							</div>
						</div>
						<Tabs defaultValue="info">
							<div className="flex items-center justify-between gap-3 mb-2">
								<TabsList className="w-full">
									<TabsTrigger value="info">{t("library:info")}</TabsTrigger>
									<TabsTrigger value="reviews" className="capitalize">
										{t("library:reviews")}
									</TabsTrigger>
									<TabsTrigger value="lists">{t("library:lists")}</TabsTrigger>
								</TabsList>
							</div>
							<TabsContent value="info">
								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:genres")}
									</h3>
									<div className="flex flex-wrap gap-2">
										<span className="px-3 py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium">
											Fantasia
										</span>
										<span className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium">
											Aventura
										</span>
										<span className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium">
											Épico
										</span>
										<span className="px-3 py-1.5 bg-linear-to-r from-primary/20 to-primary/30 text-primary border border-primary/30 rounded-full text-sm font-medium">
											Magia
										</span>
										<span className="px-3 py-1.5 bg-linear-to-r from-chart-4/20 to-chart-4/30 text-chart-4 border border-chart-4/30 rounded-full text-sm font-medium">
											Drama
										</span>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:synopsis")}
									</h3>
									<div className="text-muted-foreground leading-relaxed space-y-4">
										<p>
											O Nome do Vento é o primeiro livro da trilogia Crônica do
											Matador do Rei, uma obra de fantasia épica que narra a
											história de Kvothe, um homem de lendária fama que vive
											escondido sob uma identidade comum.
										</p>
										<p>
											A narrativa começa com Kvothe contando sua própria
											história a um cronista, revelando sua infância numa trupe
											de artistas itinerantes, os anos vividos como um mendigo
											nas ruas de uma grande cidade e sua entrada numa escola de
											magia, onde suas paixões por magia, música e mistério o
											levam a buscar a verdade sobre os lendários assassinos
											conhecidos como Chandrian.
										</p>
										<p>
											Com uma escrita rica e personagens complexos, Rothfuss
											constrói um mundo detalhado onde a música e a magia se
											entrelaçam, criando uma das obras mais aclamadas da
											fantasia contemporânea.
										</p>
									</div>
								</div>

								<div className="mb-5">
									<h3 className="font-semibold text-card-foreground text-lg mb-4">
										{t("library:bookCharacteristics")}
									</h3>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Clock className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">Ritmo</p>
												<p className="font-medium text-card-foreground">
													Médio
												</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Brain className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													Complexidade
												</p>
												<p className="font-medium text-card-foreground">Alta</p>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border">
											<Heart className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="text-sm text-muted-foreground">
													{t("library:mood")}
												</p>
												<p className="font-medium text-card-foreground">
													Intenso
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
													{t("feed:lists.read")}
												</span>
												<BookOpen className="w-5 h-5 text-chart-1" />
											</div>
											<p className="text-2xl font-bold text-card-foreground">
												15%
											</p>
										</div>

										<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm font-medium text-muted-foreground">
													{t("feed:lists.reading")}
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

								<div>
									<h3 className="font-semibold text-card-foreground text-lg mb-3">
										{t("library:contentWarnings")}
									</h3>
									<div className="flex flex-wrap gap-2">
										<span className="px-3 blur-sm hover:blur-none transition-all py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium">
											Violência
										</span>
										<span className="px-3 blur-sm hover:blur-none transition-all py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium">
											Morte
										</span>
										<span className="px-3 blur-sm hover:blur-none transition-all py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium">
											Linguagem Forte
										</span>
										<span className="px-3 blur-sm hover:blur-none transition-all py-1.5 bg-linear-to-r from-primary/20 to-primary/30 text-primary border border-primary/30 rounded-full text-sm font-medium">
											Vergonha Corporal
										</span>
										<span className="px-3 blur-sm hover:blur-none transition-all py-1.5 bg-linear-to-r from-chart-4/20 to-chart-4/30 text-chart-4 border border-chart-4/30 rounded-full text-sm font-medium">
											Disablismo
										</span>
									</div>
								</div>
							</TabsContent>
							<TabsContent value="reviews"></TabsContent>
							<TabsContent value="lists">
								<div className="grid grid-cols-3">
									<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
										<div className="flex items-center justify-between mb-2">
											<img src="https://assets.hardcover.app/edition/31601422/3a01ea07-01f4-45a2-9940-6fc7e00e0d08.jpeg" />
										</div>
										<p className="text-lg font-bold text-card-foreground">
											Livros Que Te Querem Deixar Louco
										</p>
									</div>
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
