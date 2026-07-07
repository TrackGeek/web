import { Grid } from "@/components/layouts/grid.tsx";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingFiltered() {
  return (
    <div className="mx-auto w-full py-6 space-y-4">
      {Array.from({ length: 1 }).map((_, sectionIndex) => (
        <div key={sectionIndex}>
          <Grid minColSize={"128px"} className={"grid-cols-5"}>
            {Array.from({ length: 16 }).map((_, cardIndex) => (
              <div key={cardIndex} className="flex flex-col gap-2">
                <Skeleton className="w-full aspect-2/3 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </Grid>
        </div>
      ))}
    </div>
  );
}
