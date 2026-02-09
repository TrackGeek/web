/** biome-ignore-all lint/a11y/useValidAriaRole: it's a component */
import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ContributorsItem } from "@/components/cards/contributors.tsx";
import { CoreTeamItem } from "@/components/cards/core-team.tsx";

export const Route = createFileRoute("/credits")({
	head: () => ({
		meta: [{ title: "Credits | TrackGeek" }],
	}),
	component: CreditsRoute,
});

interface GitHubContributor {
	login: string;
	avatar_url: string;
	html_url: string;
	contributions: number;
}

async function fetchRepoContributors(
	repo: string,
): Promise<GitHubContributor[]> {
	const response = await fetch(
		`https://api.github.com/repos/TrackGeek/${repo}/contributors?anon=1`,
	);
	if (!response.ok) throw new Error(`Failed to fetch ${repo} contributors`);
	return response.json();
}

function CreditsRoute() {
	const { t } = useTranslation();

	const queries = useQueries({
		queries: [
			{
				queryKey: ["contributors", "web"],
				queryFn: () => fetchRepoContributors("web"),
				staleTime: 1000 * 60 * 60,
			},
			{
				queryKey: ["contributors", "api"],
				queryFn: () => fetchRepoContributors("api"),
				staleTime: 1000 * 60 * 60,
			},
		],
	});

	const loading = queries.some((query) => query.isPending);
	const contributors = (() => {
		const webContributors = queries[0].data || [];
		const apiContributors = queries[1].data || [];

		const allContributors = [...webContributors, ...apiContributors];
		return Array.from(
			new Map(
				allContributors.map((contributor) => [
					contributor.login.toLowerCase(),
					contributor,
				]),
			).values(),
		)
			.sort((a, b) => b.contributions - a.contributions)
			.filter(
				(contributor) => !contributor.login.toLowerCase().includes("bot"),
			);
	})();

	return (
		<div className="flex flex-col gap-8">
			<div className="bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
				<div>
					<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("common:credits")}
					</h1>
					<p className="text-center">{t("pages:credits.description")}</p>
				</div>

				<hr className="my-10" />
				<div>
					<h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("pages:credits.core.title")}
					</h2>
					<p className="text-center">{t("pages:credits.core.description")}</p>
					<div className="grid-cols-4 grid gap-4 mt-4">
						<CoreTeamItem
							name="Kuriel"
							url="/user/kuriel"
							avatarURL="https://github.com/Kuriel23.png"
							role="project-management"
						/>
						<CoreTeamItem
							name="izakdvlpr"
							url="/user/izakdvlpr"
							avatarURL="https://github.com/izakdvlpr.png"
							role="project-management"
						/>
						<CoreTeamItem
							name="Algiz"
							url="/user/algiz"
							avatarURL="https://i.ibb.co/4Z9wzrbR/image.png"
							role="designer"
						/>
					</div>
				</div>
				<hr className="my-10" />
				<div>
					<h2 className="text-2xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("pages:credits.community.title")}
					</h2>
					<p className="text-center">
						{t("pages:credits.community.description")}
					</p>
					<div className="grid-cols-10 grid gap-2 mt-4">
						{loading ? (
							<p className="text-center col-span-4">{t("common:loading")}</p>
						) : (
							contributors.map((contributor) => (
								<ContributorsItem
									key={contributor.login}
									name={contributor.login}
									url={contributor.html_url}
									avatarURL={contributor.avatar_url}
									role="developer"
								/>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
