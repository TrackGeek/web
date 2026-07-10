import { useTranslation } from "react-i18next";
import { ActivityItem } from "./activity-item";

export function FeedListFollowing() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full gap-y-3">
      <ActivityItem
        profile={{
          avatarURL:
            "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light'",
          name: "John Doe",
        }}
        item={{
          coverURL: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx177937-Tzgg6rAdhCoH.jpg",
          time: new Date(2026, 1, 20, 18, 30, 0),
          title: t("feed:watchedEpisodes", {
            episodeNumber: 3,
            content: "Spy x Family 3rd Season",
          }),
          likes: 3,
        }}
      />
    </div>
  );
}
