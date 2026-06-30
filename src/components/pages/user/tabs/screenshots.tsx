import { Grid } from "@/components/layouts/grid";
import { ScreenshotItem } from "@/components/shared/cards/screenshot";

export function UserScreenshotsTab() {
  const gamesWithScreenshots = [
    {
      id: "a1",
      title: "Romeo is a Dead Man",
      image: "https://images.igdb.com/igdb/image/upload/t_original/coakmt.webp",
      images: [
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
      ],
    },
    {
      id: "a2",
      title: "Soul Hackers 2",
      image: "https://images.igdb.com/igdb/image/upload/t_original/co4hzh.webp",
      images: [
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
      ],
    },
    {
      id: "a3",
      title: "Grand Theft Auto VI",
      image: "https://images.igdb.com/igdb/image/upload/t_original/co9rwo.webp",
      images: [
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
      ],
    },
    {
      id: "a4",
      title: "Call of Duty: Black Ops 7",
      image: "https://images.igdb.com/igdb/image/upload/t_original/co9xwv.webp",
      images: [
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
        "https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
      ],
    },
  ];

  return (
    <Grid minColSize={"128px"} className="flex w-full flex-col rounded-2xl py-4 px-2 gap-6">
      {gamesWithScreenshots.map((f) => (
        <ScreenshotItem key={f.id} title={f.title} imageURL={f.image} images={f.images} />
      ))}
    </Grid>
  );
}
