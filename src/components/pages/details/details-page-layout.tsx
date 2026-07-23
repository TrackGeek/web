import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DetailsPageLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DetailsPageLayout({ sidebar, children }: DetailsPageLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mb-4 items-start min-w-0">
      <div className="w-full md:w-2/5 lg:w-1/3 md:sticky md:top-4 min-w-0">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-4">{sidebar}</CardContent>
        </Card>
      </div>
      <div className="w-full md:w-3/5 lg:w-2/3 min-w-0">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
