import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DetailsPageLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DetailsPageLayout({ sidebar, children }: DetailsPageLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <Card>
          <CardContent className="flex flex-col gap-4">{sidebar}</CardContent>
        </Card>
      </div>
      <div className="lg:w-2/3">
        <Card>
          <CardContent className="flex flex-col gap-4">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
