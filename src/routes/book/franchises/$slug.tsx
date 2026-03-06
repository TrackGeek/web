import { createFileRoute } from "@tanstack/react-router";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import booksData from "@/lib/mockups/books.json";

export const Route = createFileRoute("/book/franchises/$slug")({
  component: BookFranchisesRoute,
});

function BookFranchisesRoute() {
  const { slug: _ } = Route.useParams();
  const books = booksData;

  return (
    <div className="mx-auto w-full space-y-4">
      <h1 className="text-2xl font-bold mb-4">Heartstopper</h1>
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
  );
}
