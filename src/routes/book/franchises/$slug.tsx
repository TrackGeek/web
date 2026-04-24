import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { type FilterParams, Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import booksData from "@/lib/mockups/books.json";

export const Route = createFileRoute("/book/franchises/$slug")({
  component: BookFranchisesRoute,
});

function BookFranchisesRoute() {
  const { slug: _ } = Route.useParams();
  const books = booksData;

  const [filters, setFilters] = useState<FilterParams>({});

  const handleFilterChange = useCallback((patch: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="mx-auto w-full space-y-4">
      {books.slice(0, 1).map((book) => {
        return (
          <div className="relative w-full overflow-hidden rounded-xl border border-border" key={book.id}>
            <img src={"/placeholder/banner-1.webp"} className="w-full h-60 md:h-100 object-cover" alt={book.title} />

            <div
              className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30
 to-transparent"
            />
            <Icon icon={"lucide:heart"} className="absolute top-4 right-14 z-10" />
            <Icon icon={"lucide:share"} className="absolute top-4 right-4 z-10" />
            <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
              <h2 className="text-4xl font-bold drop-shadow-lg">{book.title}</h2>
            </div>
          </div>
        );
      })}
      <div className="flex max-sm:flex-col gap-5 py-6">
        <Filters values={filters} onChange={handleFilterChange} type={"book"} />
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
