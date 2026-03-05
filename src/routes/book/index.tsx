import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import booksData from "@/lib/mockups/books.json";

export const Route = createFileRoute("/book/")({
  component: BookRoute,
});

function BookRoute() {
  const { t } = useTranslation();
  const books = booksData;

  return (
    <div className="mx-auto w-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("feed:trending")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {books.map((book) => (
            <CardItem
              title={book.title}
              url={`/book/${book.id}`}
              imageURL={book.imageUrl}
              rating={0}
              year={book.releaseYear}
              synopsis={book.description}
              mediaType={"book"}
              key={book.id}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {books.map((book) => (
            <CardItem
              title={book.title}
              url={`/book/${book.id}`}
              imageURL={book.imageUrl}
              rating={0}
              year={book.releaseYear}
              synopsis={book.description}
              mediaType={"book"}
              key={book.id}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}
