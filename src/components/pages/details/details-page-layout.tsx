import type { ReactNode } from "react";

interface DetailsPageLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DetailsPageLayout({ sidebar, children }: DetailsPageLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 flex flex-col gap-4">{sidebar}</div>
      </div>
      <div className="lg:w-2/3">
        <div className="bg-card rounded-2xl shadow-lg p-8 space-y-3">{children}</div>
      </div>
    </div>
  );
}
