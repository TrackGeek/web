import { Filter, Mountain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/cards/card";
import { FeedListFollowing } from "@/components/feed/listFollowing";
import { Layout } from "@/components/layouts/main";
import { StillReading } from "@/components/sidebar/stillReading";
import { StillWatching } from "@/components/sidebar/stillWatching";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Lab() {
	const { t } = useTranslation();

	return (
		<Layout title="Home">
			<div className="flex max-sm:flex-col gap-5">
				<div className="flex flex-col md:w-2/3">
					<Tabs defaultValue="following">
						<div className="flex items-center justify-between gap-3 mb-2">
							<TabsList className="md:w-2/4">
								<TabsTrigger value="following">
									{t("feed:following")}
								</TabsTrigger>
								<TabsTrigger value="global">{t("feed:global")}</TabsTrigger>
								<TabsTrigger value="trending">{t("feed:trending")}</TabsTrigger>
							</TabsList>
							<DropdownMenu>
								<DropdownMenuTrigger asChild className="w-fit">
									<Button>
										<Filter />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									className="w-(--radix-dropdown-menu-trigger-width) rounded-lg"
									align="end"
								>
									<DropdownMenuCheckboxItem checked>
										<Mountain size={18} className="text-white" />
										{t("common:types.anime_other")}
									</DropdownMenuCheckboxItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<TabsContent value="following">
							<FeedListFollowing />
							<div className="w-32 mt-5">
								<CardItem
									url="/anime"
									title="Spy X Family 3rd Season"
									imageURL="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx177937-Tzgg6rAdhCoH.jpg"
									mediaType="anime"
									rating={8.5}
									year={2024}
									synopsis="A captivating story that follows the journey of characters
										through extraordinary circumstances..."
								/>
								<CardItem
									url="/movie"
									title="The Shining"
									imageURL="https://image.tmdb.org/t/p/original/uAR0AWqhQL1hQa69UDEbb2rE5Wx.jpg"
									mediaType="movie"
									rating={8.4}
									year={1980}
									synopsis="Jack Torrance accepts a caretaker job at the Overlook Hotel, where he, along with his wife Wendy and their son Danny, must live isolated from the rest of the world for the winter. But they aren't prepared for the madness that lurks within."
								/>
								<CardItem
									url="/book"
									title="Heartstopper: Volume One"
									imageURL="https://assets.hardcover.app/edition/21247303/9020805-L.jpg"
									mediaType="book"
									rating={8.8}
									year={2018}
									synopsis="Charlie and Nick are at the same school, but they've never met ... until one day when they're made to sit together.
They quickly become friends, and soon Charlie is falling hard for Nick, even though he doesn't think he has a chance."
								/>
								<CardItem
									url="/game"
									title="Call of Duty: Black Ops 7"
									imageURL="https://images.igdb.com/igdb/image/upload/t_original/co9xwv.webp"
									mediaType="game"
									rating={3.8}
									year={2025}
									synopsis="In Call of Duty: Black Ops 7, Treyarch and Raven Software are bringing players the most mind-bending Black Ops ever. The year is 2035 and the world is on the brink of chaos, ravaged by violent conflict and psychological warfare following the events of the fan-favorite titles Black Ops 2 and Black Ops 6. Wielding cutting-edge technology, the Black Ops team led by David Mason must fight back against a manipulative enemy who weaponizes fear above all else."
								/>
								<CardItem
									url="/manga"
									title="Berserk"
									imageURL="https://cdn.myanimelist.net/images/manga/1/157897l.jpg"
									mediaType="manga"
									rating={9.4}
									year={1989}
									synopsis="Guts, a former mercenary now known as the Black Swordsman, is out for revenge. After a tumultuous childhood, he finally finds someone he respects and believes he can trust, only to have everything fall apart when this person takes away everything important to Guts for the purpose of fulfilling his own desires. Now marked for death, Guts becomes condemned to a fate in which he is relentlessly pursued by demonic beings."
								/>
								<CardItem
									url="/tv-show"
									title="Wonder Man"
									imageURL="https://image.tmdb.org/t/p/w1280/2XSHwBHIvIDPpbcH4ntQIItlThG.jpg"
									mediaType="tv-show"
									rating={7.1}
									year={2026}
									synopsis="Simon and Trevor, two actors at opposite ends of their careers, chase life-changing roles."
								/>
							</div>
						</TabsContent>
						<TabsContent value="global"></TabsContent>
						<TabsContent value="trending"></TabsContent>
					</Tabs>
				</div>
				<div className="flex flex-col gap-4 md:w-1/3">
					<StillWatching
						items={[
							{
								coverURL:
									"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177937-Tzgg6rAdhCoH.jpg",
								episode: 3,
								totalEpisodes: 13,
								link: "/",
							},
							{
								coverURL:
									"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/20548.jpg",
								episode: 10,
								totalEpisodes: 51,
								link: "/",
							},
							{
								coverURL:
									"https://www.themoviedb.org/t/p/w1280/70kTz0OmjjZe7zHvIDrq2iKW7PJ.jpg",
								episode: 96,
								totalEpisodes: 131,
								link: "/",
							},
							{
								coverURL:
									"https://image.tmdb.org/t/p/w1280/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
								episode: 41,
								totalEpisodes: 42,
								link: "/",
							},
						]}
					/>
					<StillReading
						items={[
							{
								coverURL:
									"https://assets.hardcover.app/editions/30399846/4434002844651.jpg",
								page: 284,
								totalPages: 304,
								link: "/",
							},
							{
								coverURL:
									"https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx131640-pkggtmw8VUwa.jpg",
								page: 23,
								totalPages: 131,
								link: "/",
							},
						]}
					/>
				</div>
			</div>
		</Layout>
	);
}
