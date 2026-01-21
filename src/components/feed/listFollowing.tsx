import { useTranslation } from "react-i18next";
import { FeedComposer } from "./composer";
import { FeedItem } from "./item";
import { FeedReview } from "./review";

export function FeedListFollowing() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col w-full gap-y-3">
			<FeedComposer />
			<FeedItem
				profile={{
					avatarURL:
						"https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light'",
					name: "John Doe",
				}}
				item={{
					coverURL:
						"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177937-Tzgg6rAdhCoH.jpg",
					time: new Date(2026, 1, 20, 18, 30, 0),
					title: t("feed:watchedEpisodes", {
						episodeNumber: 3,
						content: "Spy x Family 3rd Season",
					}),
					likes: 3,
				}}
			/>
			<FeedReview
				profile={{
					avatarURL:
						"https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light'",
					name: "John Doe",
				}}
				item={{
					coverURL:
						"https://images.igdb.com/igdb/image/upload/t_original/co9rwo.jpg",
					time: new Date(2026, 0, 17, 18, 30, 0),
					title: t("feed:reviewed", {
						content: "Grand Theft Auto VI",
					}),
          content: "Slk, realista d+ mas cheio de bug, música péssima, história paia",
					likes: 190,
					criteries: {
						all: 10,
						gameplay: 6,
						story: 5,
						soundtrack: 3,
						graphics: 10,
					},
				}}
			/>
		</div>
	);
}
