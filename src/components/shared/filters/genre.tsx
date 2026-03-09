import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox.tsx";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";

interface Genre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
  count: number;
}

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
    "Animation",
    "Adventure",
    "Cinema TV",
    "Action",
    "Comedy",
    "Drama",
    "Crime",
    "Documentary",
    "Family",
    "Fantasy",
    "Western",
    "War",
    "History",
    "Mystery",
    "Music",
    "Romance",
    "Horror",
    "Science Fiction",
    "Thriller",
  ],
  tv: [
    "Action & Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Kids",
    "Mystery",
    "News",
    "Reality",
    "Sci-Fi & Fantasy",
    "Soap",
    "Talk",
    "War & Politics",
    "Western",
  ],
};

const jikanApi = axios.create({
  baseURL: "https://api.jikan.moe/v4",
});

interface GenresProps {
  type: ContentType;
}

export function Genres({ type }: GenresProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await jikanApi.get(`/genres/${type}`);
        setGenres(response.data.data);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [type]);

  const genreList = useMemo(() => {
    if (genres.length > 0) {
      return genres.map((g) => g.name);
    }
    return GENRE_CONFIG[type] || [];
  }, [genres, type]);

  const filteredGenres = useMemo(() => {
    const query = search.toLowerCase();
    return genreList.filter((genre) => genre.toLowerCase().includes(query));
  }, [genreList, search]);

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:genres")}</h5>
      <Combobox items={filteredGenres} multiple={true} disabled={loading}>
        <ComboboxInput
          placeholder={loading ? "Carregando..." : t("library:genres")}
          showClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ComboboxContent>
          <ComboboxList>
            {filteredGenres.map((genre) => (
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
