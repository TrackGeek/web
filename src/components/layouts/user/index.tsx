import { useTranslation } from "react-i18next";
import {
	LinkTabs,
	LinkTabsList,
	LinkTabsTrigger,
} from "@/components/ui/link-tabs.tsx";
import { UserProfileHeader } from "@/components/user/UserProfileHeader.tsx";

interface UserLayoutProps {
	children: React.ReactNode;
	user: {
		username: string;
		avatarUrl?: string;
		bio?: string;
		followers?: number;
		following?: number;
	};
	medalsCount: number;
	entriesCount: number;
}

export function UserLayout({
	children,
	user,
	medalsCount,
	entriesCount,
}: UserLayoutProps) {
	const { t } = useTranslation();
	return (
		<div>
			<UserProfileHeader
				user={user}
				medalsCount={medalsCount}
				entriesCount={entriesCount}
			/>
			<LinkTabs>
				<LinkTabsList className="flex flex-wrap gap-2 text-sm justify-between mb-5 w-full">
					<LinkTabsTrigger to={`/user/${user.username}`}>
						{t("user:overview")}
					</LinkTabsTrigger>
					<LinkTabsTrigger to={`/user/${user.username}/movie`}>
						{t("user:movieList")}
					</LinkTabsTrigger>
					<LinkTabsTrigger to={`/user/${user.username}/serie`}>
						{t("user:serieList")}
					</LinkTabsTrigger>
					<LinkTabsTrigger to={`/user/${user.username}/anime`}>
						{t("user:animeList")}
					</LinkTabsTrigger>
					<LinkTabsTrigger to={`/user/${user.username}/game`}>
						{t("user:gameList")}
					</LinkTabsTrigger>
					<LinkTabsTrigger to={`/user/${user.username}/book`}>
						{t("user:bookList")}
					</LinkTabsTrigger>
					<LinkTabsTrigger to={`/user/${user.username}/manga`}>
						{t("user:mangaList")}
					</LinkTabsTrigger>
					<LinkTabsTrigger
						to={`/user/${user.username}/reviews`}
						className="capitalize"
					>
						{t("library:reviews")} (1)
					</LinkTabsTrigger>{" "}
					<LinkTabsTrigger to={`/user/${user.username}/screenshots`}>
						{t("library:screenshots")} (5)
					</LinkTabsTrigger>
				</LinkTabsList>
			</LinkTabs>

			{children}
		</div>
	);
}
