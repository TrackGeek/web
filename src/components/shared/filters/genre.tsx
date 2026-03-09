import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox.tsx";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";

const GENRE_CONFIG: Record<ContentType, string[]> = {
  anime: [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Isekai",
    "Mahou Shoujo",
    "Mecha",
    "Music",
    "Mystery",
    "Psychological",
    "Romance",
    "School",
    "Sci-Fi",
    "Shoujo",
    "Shounen",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ],
  manga: [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Historical",
    "Horror",
    "Isekai",
    "Josei",
    "Martial Arts",
    "Mecha",
    "Mystery",
    "Romance",
    "School",
    "Sci-Fi",
    "Shoujo",
    "Shounen",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ],
  book: [
    "Action",
    "Adventure",
    "Biography",
    "Comedy",
    "Crime",
    "Drama",
    "Fantasy",
    "Historical",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Self-Help",
    "Thriller",
    "Young Adult",
  ],
  game: [
    "Pinball",
    "Adventure",
    "Indie",
    "Arcade",
    "Visual Novel",
    "Card & Board Game",
    "MOBA",
    "Point-and-click",
    "Fighting",
    "Shooter",
    "Music",
    "Platform",
    "Puzzle",
    "Racing",
    "Real Time Strategy (RTS)",
    "Role-playing (RPG)",
    "Simulator",
    "Sport",
    "Strategy",
    "Turn-based Strategy (TBS)",
    "Tactical",
    "Hack and slash/Beat em up",
    "Quiz/Trivia",
  ],
  movie: [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Film-Noir",
    "Horror",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
  ],
  tv: [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Talk-Show",
    "Thriller",
    "War",
    "Western",
  ],
};

export function Genres({ type }: { type: ContentType }) {
  const { t } = useTranslation();

  const currentGenres = GENRE_CONFIG[type];
  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:genres")}</h5>
      <Combobox items={currentGenres} multiple={true}>
        <ComboboxInput placeholder={t("library:genres")} showClear readOnly={true} />
        <ComboboxContent>
          <ComboboxList>
            {currentGenres.map((genre) => (
              <ComboboxItem key={genre} value={genre}>
                {getGenreLabel(t as any, genre)}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
