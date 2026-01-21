import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FeedListFollowing } from "@/components/feed/listFollowing";
import { Layout } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGE_TOKEN, supportedLanguages } from "@/lib/i18n/config";

export function HomePage() {
	const { t, i18n } = useTranslation();

	return (
		<Layout title="Home">
			<div className="flex gap-5">
				<div className="flex flex-col w-2/3">
					<Tabs defaultValue="following">
						<div className="flex items-center justify-between gap-3 mb-2">
							<TabsList className="w-2/4">
								<TabsTrigger value="following">
									{t("feed:following")}
								</TabsTrigger>
								<TabsTrigger value="global">{t("feed:global")}</TabsTrigger>
								<TabsTrigger value="trending">{t("feed:trending")}</TabsTrigger>
							</TabsList>
							<Button variant="default">
								<Filter />
							</Button>
						</div>
						<TabsContent value="following">
							<FeedListFollowing />
						</TabsContent>
						<TabsContent value="global"></TabsContent>
						<TabsContent value="trending"></TabsContent>
					</Tabs>
				</div>
				<div className="flex flex-col gap-4 w-1/3">
					<h1>Sidebar</h1>

					<p>
						{t("common:yes")}/{t("common:no")}
					</p>

					<span className="font-bold">
						{t("common:example", { name: "Jhon Doe" })}
					</span>

					<select
						className="p-2 border rounded-md"
						value={i18n.language}
						onChange={(e) => {
							i18n.changeLanguage(e.target.value);

							localStorage.setItem(LANGUAGE_TOKEN, e.target.value);
						}}
					>
						{supportedLanguages.map((lang) => (
							<option key={lang.id} value={lang.id}>
								{t(lang.name as any)}
							</option>
						))}
					</select>
				</div>
			</div>
		</Layout>
	);
}
