import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion.tsx";

export const Route = createFileRoute("/add-data")({
	head: () => ({
		meta: [{ title: "Add Data | TrackGeek" }],
	}),
	component: AddDataRoute,
});

function AddDataRoute() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-8">
			<div className="bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
				<div className="mb-5">
					<h1 className="text-3xl lg:text-4xl font-bold text-card-foreground mb-2 bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
						{t("common:addData")}
					</h1>
				</div>

				<div className="mb-5">
					<div className="leading-relaxed space-y-4">
						<Trans
							parent="p"
							i18nKey="pages:addData.description"
							components={{
								igdb: (
									<a
										href="https://igdb.com"
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
								hc: (
									<a
										href="https://hardcover.app"
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
								mal: (
									<a
										href="https://myanimelist.net"
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
								tmdb: (
									<a
										href="https://themoviedb.org"
										rel="noopener noreferrer"
										target="_blank"
									/>
								),
							}}
						/>
						<p className="flex max-md:flex-col gap-2.5 items-center bg-amber-200/20 p-2 rounded-2xl text-amber-200">
							<AlertCircle /> {t("pages:addData.warning")}
						</p>
						<Accordion type="multiple">
							<AccordionItem value="anime">
								<AccordionTrigger className="bg-linear-to-br from-muted/50 to-muted px-5">
									{t("pages:addData.forAnimes")}
								</AccordionTrigger>
								<AccordionContent className="mt-3">
									<ul className="list-disc list-inside space-y-2">
										<Trans
											parent="li"
											i18nKey="pages:addData.createAccount"
											components={{
												1: (
													<a
														href="https://myanimelist.net/register.php?from=%2F&"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<Trans
											parent="li"
											i18nKey="pages:addData.fillInfo"
											components={{
												1: (
													<a
														href="https://myanimelist.net/panel.php?go=anime_series&do=add"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<li>{t("pages:addData.saveAnime")}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="movies">
								<AccordionTrigger className="bg-linear-to-br from-muted/50 to-muted px-5">
									{t("pages:addData.forMovies")}
								</AccordionTrigger>
								<AccordionContent className="mt-3">
									<ul className="list-disc list-inside space-y-2">
										<Trans
											parent="li"
											i18nKey="pages:addData.createAccount"
											components={{
												1: (
													<a
														href="https://www.themoviedb.org/signup"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<Trans
											parent="li"
											i18nKey="pages:addData.fillInfo"
											components={{
												1: (
													<a
														href="https://www.themoviedb.org/movie/new"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<li>{t("pages:addData.save")}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="games">
								<AccordionTrigger className="bg-linear-to-br from-muted/50 to-muted px-5">
									{t("pages:addData.forGames")}
								</AccordionTrigger>
								<AccordionContent className="mt-3">
									<ul className="list-disc list-inside space-y-2">
										<Trans
											parent="li"
											i18nKey="pages:addData.createAccount"
											components={{
												1: (
													<a
														href="https://www.igdb.com/oauth/twitch"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<Trans
											parent="li"
											i18nKey="pages:addData.fillInfo"
											components={{
												1: (
													<a
														href="https://www.igdb.com/games/new"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<li>{t("pages:addData.saveGame")}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="books">
								<AccordionTrigger className="bg-linear-to-br from-muted/50 to-muted px-5">
									{t("pages:addData.forBooks")}
								</AccordionTrigger>
								<AccordionContent className="mt-3">
									<ul className="list-disc list-inside space-y-2">
										<Trans
											parent="li"
											i18nKey="pages:addData.createAccount"
											components={{
												1: (
													<a
														href="https://hardcover.app/"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<Trans
											parent="li"
											i18nKey="pages:addData.fillInfo"
											components={{
												1: (
													<a
														href="https://hardcover.app/books/new"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<li>{t("pages:addData.save")}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="manga">
								<AccordionTrigger className="bg-linear-to-br from-muted/50 to-muted px-5">
									{t("pages:addData.forManga")}
								</AccordionTrigger>
								<AccordionContent className="mt-3">
									<ul className="list-disc list-inside space-y-2">
										<Trans
											parent="li"
											i18nKey="pages:addData.createAccount"
											components={{
												1: (
													<a
														href="https://myanimelist.net/register.php?from=%2F&"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<Trans
											parent="li"
											i18nKey="pages:addData.fillInfo"
											components={{
												1: (
													<a
														href="https://myanimelist.net/panel.php?go=mangadb&do=add"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<li>{t("pages:addData.saveManga")}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value="tv-shows">
								<AccordionTrigger className="bg-linear-to-br from-muted/50 to-muted px-5">
									{t("pages:addData.forTVShows")}
								</AccordionTrigger>
								<AccordionContent className="mt-3">
									<ul className="list-disc list-inside space-y-2">
										<Trans
											parent="li"
											i18nKey="pages:addData.createAccount"
											components={{
												1: (
													<a
														href="https://www.themoviedb.org/signup"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<Trans
											parent="li"
											i18nKey="pages:addData.fillInfo"
											components={{
												1: (
													<a
														href="https://www.themoviedb.org/tv/new"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
											}}
										/>
										<li>{t("pages:addData.save")}</li>
									</ul>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
						<p>{t("pages:addData.reminder")}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
