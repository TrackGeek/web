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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteList, useRemoveItemFromList, useUpdateList } from "@/hooks/list";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { LIST_TYPE_LABEL_KEY, listItemToLink } from "@/lib/utils/list-item";

interface ListItemsModalProps {
  group: ApiTypes.ListGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editable?: boolean;
}

export function ListItemsModal({ group, open, onOpenChange, editable = false }: ListItemsModalProps) {
  const { t } = useTranslation();

  const [activeListId, setActiveListId] = useState(group.lists[0].id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const activeList = group.lists.find((list) => list.id === activeListId) ?? group.lists[0];
  const hasVariants = group.lists.length > 1;

  const updateList = useUpdateList(activeList.id);
  const deleteList = useDeleteList(activeList.id);
  const removeItem = useRemoveItemFromList(activeList);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setConfirmDeleteOpen(false);
    }
  }, [open]);

  const itemsQuery = useQuery<ApiTypes.ListItem[]>({
    queryKey: ["listItems", activeList.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetItemsByListIdResponse>(apiEndpoints.getItemsByListId(activeList.id), {
          params: { itemsPerPage: 50 },
        })
        .then(({ data }) => data.listItems.items),
    enabled: open,
  });

  const items = itemsQuery.data ?? [];

  function selectList(listId: string) {
    setActiveListId(listId);
    setEditing(false);
  }

  function startEditing() {
    setName(activeList.name);
    setDescription(activeList.description ?? "");
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

  const itemsGrid = itemsQuery.isLoading ? (
    <p className="text-muted-foreground">{t("common:loading")}</p>
  ) : items.length === 0 ? (
    <p className="text-muted-foreground">{t("library:noItems")}</p>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => {
        const link = listItemToLink(item);
        if (!link) return null;

        return (
          <div key={item.id} className="space-y-2">
            <div className="relative rounded-lg border border-border overflow-hidden aspect-3/4 group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-300 group-hover:opacity-80"
                style={{ backgroundImage: `url("${link.image ?? "/placeholder/cover.webp"}")` }}
              />
              <Link to={link.to} params={{ slug: link.slug }} className="absolute inset-0" />
              {editable && (
                <button
                  type="button"
                  disabled={removeItem.isPending}
                  onClick={() => handleRemoveItem(item)}
                  aria-label={t("user:removeItem")}
                  className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 disabled:opacity-50"
                >
                  <Icon icon="lucide:x" className="size-4" />
                </button>
              )}
            </div>
            <p className="font-bold text-card-foreground hover:text-primary transition-colors line-clamp-2">
              {link.title}
            </p>
          </div>
        );
      })}
    </div>
  );

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
                    {t("common:save")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                    {t("common:cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <DialogTitle className="text-card-foreground font-bold text-xl">
                    {hasVariants ? group.name : activeList.name}
                  </DialogTitle>

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

                {activeList.description && <DialogDescription>{activeList.description}</DialogDescription>}

                <Link
                  to="/user/$username"
                  params={{ username: activeList.user.username }}
                  className="flex gap-2 items-center mt-1 w-max"
                >
                  <Avatar size="sm">
                    {activeList.user.profile?.avatarUrl ? (
                      <Image
                        className="aspect-square size-full"
                        src={activeList.user.profile.avatarUrl}
                        width={24}
                        height={24}
                        alt={activeList.user.name}
                      />
                    ) : (
                      <AvatarFallback>{activeList.user.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium text-muted-foreground">{activeList.user.name}</span>
                </Link>
              </>
            )}
          </DialogHeader>

          {hasVariants ? (
            <Tabs value={activeList.id} onValueChange={selectList} className="min-h-0 gap-3">
              <TabsList className="mx-6 max-w-[calc(100%-3rem)] overflow-x-auto">
                {group.lists.map((list) => (
                  <TabsTrigger key={list.id} value={list.id}>
                    {t(`common:types.${LIST_TYPE_LABEL_KEY[list.type]}`, { count: 2 })}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeList.id} className="overflow-y-auto max-h-[calc(90vh-13rem)] px-6 pb-6">
                {itemsGrid}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6">{itemsGrid}</div>
          )}
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
              {t("common:cancel")}
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
