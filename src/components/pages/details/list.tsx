import { Image } from "@unpic/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import type { ApiTypes } from "@/lib/api.ts";
import { listItemToLink } from "@/lib/utils/list-item";
import { ListItemsModal } from "./list-items-modal";

const PREVIEW_COUNT = 3;

interface ListItemProps {
  list: ApiTypes.ListWithPreview;
  editable?: boolean;
}

export function ListItem({ list, editable = false }: ListItemProps) {
  const [open, setOpen] = useState(false);

  const total = list._count.listItems;
  const previews = list.listItems.slice(0, PREVIEW_COUNT).map((item) => ({ item, link: listItemToLink(item) }));
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
            {previews.map(({ item, link }) => (
              <Avatar key={item.id} className="aspect-3/4 h-max w-24 rounded-md">
                {link?.image ? (
                  <Image
                    src={link.image}
                    width={96}
                    height={54}
                    alt={link?.title ?? ""}
                    className="object-cover aspect-3/4 h-full"
                  />
                ) : (
                  <AvatarFallback className="rounded-md text-xs">{link?.title}</AvatarFallback>
                )}
              </Avatar>
            ))}

            {remaining > 0 && (
              <AvatarGroupCount className="w-24 size-none h-max aspect-3/4 rounded-md">+{remaining}</AvatarGroupCount>
            )}
          </AvatarGroup>
        </div>
        <p className="text-card-foreground font-bold line-clamp-1">{list.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <Avatar size="sm">
            {list.user.profile?.avatarUrl ? (
              <Image
                className="aspect-square size-full"
                src={list.user.profile.avatarUrl}
                width={24}
                height={24}
                alt={list.user.name}
              />
            ) : (
              <AvatarFallback>{list.user.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <p className="text-sm font-bold text-muted-foreground">{list.user.name}</p>
        </div>
      </button>

      <ListItemsModal list={list} open={open} onOpenChange={setOpen} editable={editable} />
    </>
  );
}
