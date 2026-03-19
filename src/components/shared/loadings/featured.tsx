import { Grid } from "@/components/layouts/grid.tsx";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingFeaturedProps {
  numberOfSections?: number;
}

export function LoadingFeatured({ numberOfSections = 4 }: LoadingFeaturedProps) {
  return (
    <div className="mx-auto w-full">
      <Skeleton className="w-full h-60 md:h-120 rounded-xl" />

      <div className="py-6 space-y-4">
        {Array.from({ length: numberOfSections }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>

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
    </div>
  );
}
