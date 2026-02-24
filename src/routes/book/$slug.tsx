import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BarChart3,
	Barcode,
	BookCopy,
	Bookmark,
	BookOpen,
	BookOpenText,
	CheckCircle,
	CheckSquare,
	Heart,
	MoreHorizontal,
	ScanBarcode,
	Star,
	User,
	XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DetailsCard } from "@/components/cards/details.tsx";
import { ListItem } from "@/components/details/list";
import { ReviewItem } from "@/components/details/review";
import { BookModal } from "@/components/modals/book";
import { RefreshData } from "@/components/modals/refresh-data";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/book/$slug")({
	head: () => ({
		meta: [...seo({ title: "Book Details" })],
	}),
	component: BookDetailsRoute,
});

export function BookDetailsRoute() {
	const { slug: _ } = Route.useParams();

	const { t } = useTranslation();

	const synopsis =
		"O Nome do Vento é o primeiro livro da trilogia Crônica do Matador do Rei, uma obra de fantasia épica que narra a história de Kvothe, um homem de lendária fama que vive escondido sob uma identidade comum.";
	const year = "2021";
	const imageURL =
		"https://assets.hardcover.app/edition/31601422/3a01ea07-01f4-45a2-9940-6fc7e00e0d08.jpeg";
	const title = "O Nome do Vento";
	const rating = 4.2;

	return (
		<div className="flex flex-col lg:flex-row gap-8">
			<div className="lg:w-1/3">
				<div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
					<div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
						<img
							src={imageURL}
							alt="Capa do livro"
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

					<Dialog>
						<DialogTrigger asChild>
							<Button className="flex bg-transparent items-center justify-center space-x-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
								<MoreHorizontal className="size-5" />
								<span className="text-sm font-medium">
									{t("library:moreOptions")}
								</span>
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
										<DialogTitle className="text-white font-bold text-2xl drop-shadow-lg mb-2">
											{title}
										</DialogTitle>
										<div className="flex items-center gap-4 text-white/90 text-sm">
											<div className="flex items-center gap-1">
												<Star className="size-4 fill-yellow-400 text-yellow-400" />
												<span>{rating}</span>
											</div>
											<span>•</span>
											<span>{year}</span>
										</div>
										<p className="text-white/80 text-sm mt-2 max-w-md line-clamp-2">
											{synopsis}
										</p>
									</div>
								</div>

								<div className="absolute z-50 top-[45%] right-10 flex items-center gap-2">
									<Button
										size="sm"
										variant="ghost"
										className="text-white hover:bg-white/10 hover:text-white"
									>
										<Heart className="size-6" />
									</Button>
								</div>
							</DialogHeader>

							<div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
								<BookModal />
							</div>
						</DialogContent>
					</Dialog>

					<div className="border-t border-border"></div>

					<div className="grid grid-cols-2 gap-4">
						<div className="bg-muted/50 p-4 rounded-lg border border-border">
							<p className="text-sm text-muted-foreground">
								{t("library:page_other")}
							</p>
							<p className="font-semibold text-card-foreground">328</p>
						</div>
						<div className="bg-muted/50 p-4 rounded-lg border border-border">
							<p className="text-sm text-muted-foreground">
								{t("library:year")}
							</p>
							<p className="font-semibold text-card-foreground">{year}</p>
						</div>
					</div>
					<RefreshData sourceURL="https://hardcover.app/books/dungeon-crawler-carl" />
				</div>
			</div>

			<div className="lg:w-2/3">
				<div className="bg-card rounded-2xl shadow-lg p-8">
					<div className="mb-5">
						<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
							{title}
						</h1>
						<div className="flex items-center space-x-2">
							<User className="size-5 text-muted-foreground" />
							<Link to={"/"} className="text-xl text-muted-foreground">
								Patrick Rothfuss
							</Link>
						</div>
						<div className="flex items-center space-x-2 mt-2">
							<BookCopy className="size-5 text-muted-foreground" />
							<Link to={"/"} className="text-xl text-muted-foreground">
								series_names (can be hidden if not exists)
							</Link>
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
							<span className="font-semibold text-card-foreground">
								{rating}
							</span>
							<span className="text-muted-foreground ml-1">
								(128.543 {t("library:reviews")})
							</span>
						</div>

						<div className="flex items-center text-muted-foreground">
							<BarChart3 className="size-5 mr-2" />
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
									<p>{synopsis}</p>
								</div>
							</div>

							<div className="mb-5">
								<h3 className="font-semibold text-card-foreground text-lg mb-4">
									{t("library:bookCharacteristics")}
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<DetailsCard
										title="ISBN 10"
										icon={
											<ScanBarcode className="size-5 text-muted-foreground" />
										}
										description={"6555117737"}
									/>
									<DetailsCard
										title="ISBN 13"
										icon={<Barcode className="size-5 text-muted-foreground" />}
										description={"9786555117738"}
									/>
									<DetailsCard
										title={t("library:mood")}
										icon={<Heart className="size-5 text-muted-foreground" />}
										description={"Intenso"}
									/>
								</div>
							</div>

							<div className="mb-5">
								<h3 className="font-semibold text-card-foreground text-lg mb-4">
									{t("library:communityStatistics")}
								</h3>
								<div className="gap-4 grid grid-cols-2 md:grid-cols-4">
									<div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium text-muted-foreground">
												{t("feed:lists.planning")}
											</span>
											<Bookmark className="size-5 text-purple-400" />
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
											<BookOpen className="size-5 text-chart-1" />
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
											<CheckCircle className="size-5 text-secondary" />
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
											<XCircle className="size-5 text-destructive" />
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
						<TabsContent value="reviews">
							<ReviewItem
								user={{
									name: "John Doe",
									avatarURL:
										"https://assets.hardcover.app/editions/30399846/4434002844651.jpg",
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
	);
}
