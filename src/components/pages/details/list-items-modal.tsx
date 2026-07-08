import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteList, useRemoveItemFromList, useUpdateList } from "@/hooks/list";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { listItemToLink } from "@/lib/utils/list-item";

interface ListItemsModalProps {
  list: ApiTypes.ListWithPreview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editable?: boolean;
}

export function ListItemsModal({ list, open, onOpenChange, editable = false }: ListItemsModalProps) {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description ?? "");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const updateList = useUpdateList(list.id);
  const deleteList = useDeleteList(list.id);
  const removeItem = useRemoveItemFromList(list);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setConfirmDeleteOpen(false);
    }
  }, [open]);

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

  function startEditing() {
    setName(list.name);
    setDescription(list.description ?? "");
    setEditing(true);
  }

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    updateList.mutate(
      { name: trimmedName, description: description.trim() },
      {
        onSuccess: () => {
          toast.success(t("user:listUpdated"));
          setEditing(false);
        },
        onError: () => toast.error(t("user:error")),
      },
    );
  }

  function handleDelete() {
    deleteList.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("user:listDeleted"));
        setConfirmDeleteOpen(false);
        onOpenChange(false);
      },
      onError: () => toast.error(t("user:error")),
    });
  }

  function handleRemoveItem(item: ApiTypes.ListItem) {
    removeItem.mutate(item, {
      onError: () => toast.error(t("user:error")),
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border/50">
            {editing ? (
              <div className="flex flex-col gap-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("user:listName")}
                  className="text-card-foreground font-bold"
                />
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("user:listDescription")}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={updateList.isPending || !name.trim()}>
                    {t("user:save")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    {t("user:cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <DialogTitle className="text-card-foreground font-bold text-xl">{list.name}</DialogTitle>

                  {editable && (
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon-sm" variant="ghost" onClick={startEditing} aria-label={t("user:editList")}>
                        <Icon icon="lucide:pencil" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteOpen(true)}
                        aria-label={t("user:deleteList")}
                        className="text-destructive hover:text-destructive"
                      >
                        <Icon icon="lucide:trash-2" />
                      </Button>
                    </div>
                  )}
                </div>

                {list.description && <DialogDescription>{list.description}</DialogDescription>}

                <Link
                  to="/user/$username"
                  params={{ username: list.user.username }}
                  className="flex gap-2 items-center mt-1 w-max"
                >
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
                  <span className="text-sm font-medium text-muted-foreground">{list.user.name}</span>
                </Link>
              </>
            )}
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">
            {itemsQuery.isLoading ? (
              <p className="text-muted-foreground">{t("user:loading")}</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">{t("library:noItems")}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const link = listItemToLink(item);
                  if (!link) return null;

                  return (
                    <div key={item.id} className="group relative flex flex-col gap-2">
                      {editable && (
                        <Button
                          size="icon-xs"
                          variant="destructive"
                          onClick={() => handleRemoveItem(item)}
                          disabled={removeItem.isPending}
                          aria-label={t("user:removeItem")}
                          className="absolute top-1 right-1 z-10 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Icon icon="lucide:x" />
                        </Button>
                      )}

                      <Link to={link.to} params={{ slug: link.slug }} className="flex flex-col gap-2">
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                          {link.image ? (
                            <Image
                              src={link.image}
                              layout="fullWidth"
                              aspectRatio={16 / 9}
                              alt={link.title}
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground text-xs">
                              {link.title}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-card-foreground line-clamp-1">{link.title}</p>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("user:deleteList")}</DialogTitle>
            <DialogDescription>{t("user:confirmDeleteList")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              {t("user:cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteList.isPending}>
              {t("user:deleteList")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
