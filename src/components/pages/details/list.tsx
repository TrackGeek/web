import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import type { ApiTypes } from "@/lib/api.ts";
import { ListItemsModal } from "./list-items-modal";

const PREVIEW_COUNT = 3;

interface ListItemProps {
  list: ApiTypes.ListWithPreview;
}

export function ListItem({ list }: ListItemProps) {
  const [open, setOpen] = useState(false);

  const total = list._count.listItems;
  const previews = list.listItems.slice(0, PREVIEW_COUNT);
  const remaining = total - previews.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border text-left w-full cursor-pointer transition-colors hover:border-primary/50"
      >
        <div className="flex items-center justify-between mb-2">
          <AvatarGroup className="items-center -space-x-3 overflow-x-hidden">
            {previews.map((item) => (
              <Avatar key={item.id} className="aspect-video h-max w-24 rounded-md">
                <AvatarImage
                  src={item.tvShow?.backdropUrl ?? undefined}
                  alt={item.tvShow?.name ?? ""}
                  className="object-cover aspect-video h-full"
                />
                <AvatarFallback className="rounded-md text-xs">{item.tvShow?.name}</AvatarFallback>
              </Avatar>
            ))}
            {remaining > 0 && (
              <AvatarGroupCount className="w-24 size-none h-max aspect-video rounded-md">
                +{remaining}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
        </div>
        <p className="text-card-foreground font-bold line-clamp-1">{list.name}</p>
        <div className="flex justify-between items-center mt-2">
          <Link
            to="/user/$username"
            params={{ username: list.user.username }}
            onClick={(e) => e.stopPropagation()}
            className="flex gap-2 items-center"
          >
            <Avatar size="sm">
              <AvatarImage src={list.user.profile?.avatarUrl ?? undefined} alt={list.user.name} />
              <AvatarFallback>{list.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-bold text-muted-foreground">{list.user.name}</p>
          </Link>
        </div>
      </button>

      <ListItemsModal list={list} open={open} onOpenChange={setOpen} />
    </>
  );
}
