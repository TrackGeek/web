import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ReviewItem } from "@/components/pages/details/review";
import { UserLayout } from "@/components/layouts/user";
import { Input } from "@/components/ui/input.tsx";
import { List } from "@/components/ui/list.tsx";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/user/$username/reviews/")({
	head: ({ params }) => ({
		meta: [...seo({ title: `${params.username}'s Reviews` })],
	}),
	component: ReviewsListRoute,
});

export function ReviewsListRoute() {
	const { username } = Route.useParams();
	const { t } = useTranslation();

	const user = {
		username,
		avatarUrl: "https://github.com/Kuriel23.png",
		bio: "Apaixonada por anime, leitora ávida e avaliadora. Gosto de slice-of-life e sci-fi. Escrevo reviews detalhadas e listas de favoritos.",
		followers: 324,
		following: 48,
	};

	const medals = [
		{
			id: "m1",
			name: "Top Reviewer",
			description: "100+ reviews and highly rated",
		},
		{
			id: "m2",
			name: "Marathon Watcher",
			description: "1000+ episodes watched",
		},
		{ id: "m3", name: "Community Helper", description: "10 helpful reviews" },
		{ id: "m3", name: "Community Helper", description: "10 helpful reviews" },
	];

	return (
		<UserLayout user={user} medalsCount={medals.length} entriesCount={2}>
			<div className="flex max-sm:flex-col gap-5">
				<div className="w-full md:w-1/4 flex flex-col gap-6">
					<div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
						<h4 className="text-md font-semibold text-card-foreground">
							{t("user:filter")}
						</h4>
						<Input
							placeholder={`${t(`user:search`)}...`}
							className="bg-muted/50"
						/>
						<h5 className="text-md font-semibold text-card-foreground">
							{t("library:type")}
						</h5>
						<div className="flex flex-col gap-1">
							{[
								t("common:types.movie_other"),
								t("common:types.tv_other"),
								t("common:types.anime_other"),
								t("common:types.game_other"),
								t("common:types.book_other"),
								t("common:types.manga_other"),
							].map((listName) => (
								<List
									key={listName}
									name={listName}
									active={listName === t("common:types.movie_other")}
								/>
							))}
						</div>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("user:sort.placeholder")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"title"}>
										{t("user:sort.title")}
									</SelectItem>
									<SelectItem value={"lastAdded"}>
										{t("user:sort.lastAdded")}
									</SelectItem>
									<SelectItem value={"rating"}>
										{t("user:sort.rating")}
									</SelectItem>
									<SelectItem value={"popularity"}>
										{t("user:sort.popularity")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="flex flex-1 flex-col gap-3 md:w-2/3 bg-card rounded-2xl py-4 px-2">
					<ReviewItem
						reviewText={
							"Very foda! AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Este livro é uma obra-prima que merece ser lida por todos os amantes de boa literatura. BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA A forma como o autor desenvolve os personagens é simplesmente magnífica, cada um com sua própria voz e personalidade única."
						}
						criteries={{
							graphics: 5,
							soundtrack: 4,
							all: 10,
							story: 8,
							gameplay: 9,
						}}
						date={new Date("2023-06-19")}
						reviewName={"Final Fantasy"}
					/>
					<ReviewItem
						reviewText={
							"Very foda! AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Este livro é uma obra-prima que merece ser lida por todos os amantes de boa literatura. BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA A forma como o autor desenvolve os personagens é simplesmente magnífica, cada um com sua própria voz e personalidade única."
						}
						criteries={{
							acting: 10,
							production: 10,
							all: 10,
							direction: 10,
							story: 10,
						}}
						date={new Date("2023-06-19")}
						reviewName={"A Empregada"}
					/>
				</div>
			</div>
		</UserLayout>
	);
}
