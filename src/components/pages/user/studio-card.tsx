import { Link } from "@tanstack/react-router";

export function StudioCard({ title }: { title: string }) {
  return (
    <Link to="/" className="flex items-center gap-3 p-2 bg-muted rounded-md w-fit">
      <div className="text-sm font-medium text-card-foreground">{title}</div>
    </Link>
  );
}
