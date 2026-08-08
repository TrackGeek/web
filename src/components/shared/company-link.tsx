import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { CompanyMediaType } from "@/components/pages/company/types";

export function companyUrl(mediaType: CompanyMediaType, id: number) {
  return `/${mediaType}/company/${id}`;
}

export function CompanyLink({
  mediaType,
  id,
  children,
}: {
  mediaType: CompanyMediaType;
  id?: number | null;
  children: ReactNode;
}) {
  if (id === null || id === undefined) {
    return <>{children}</>;
  }

  return (
    <Link
      to={companyUrl(mediaType, id)}
      className="underline-offset-4 transition-colors hover:text-primary hover:underline"
    >
      {children}
    </Link>
  );
}
