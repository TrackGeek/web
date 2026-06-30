import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

interface ListItemsModalProps {
  list: ApiTypes.ListWithPreview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ListItemsModal({ list, open, onOpenChange }: ListItemsModalProps) {
  const { t } = useTranslation();

  const itemsQuery = useQuery<ApiTypes.ListItem[]>({
    queryKey: ["listItems", list.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetItemsByListIdResponse>(apiEndpoints.getItemsByListId(list.id), {
          params: { itemsPerPage: 50 },
        })
        .then(({ data }) => data.listItems.items),
    enabled: open,
  });

  const items = itemsQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-card-foreground font-bold text-xl">{list.name}</DialogTitle>
          <Link
            to="/user/$username"
            params={{ username: list.user.username }}
            className="flex gap-2 items-center mt-1 w-max"
          >
            <Avatar size="sm">
              <AvatarImage src={list.user.profile?.avatarUrl ?? undefined} alt={list.user.name} />
              <AvatarFallback>{list.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">{list.user.name}</span>
          </Link>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
          {itemsQuery.isLoading ? (
            <p className="text-muted-foreground">{t("library:loading")}</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">{t("library:noItems")}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => {
                const tvShow = item.tvShow;
                if (!tvShow) return null;

                return (
                  <Link
                    key={item.id}
                    to="/tv/$slug"
                    params={{ slug: String(tvShow.tmdbId) }}
                    className="group flex flex-col gap-2"
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                      {tvShow.backdropUrl ? (
                        <img
                          src={tvShow.backdropUrl}
                          alt={tvShow.name ?? ""}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                          {tvShow.name}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-card-foreground line-clamp-1">{tvShow.name}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
