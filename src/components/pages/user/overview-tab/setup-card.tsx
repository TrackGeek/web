import { Icon } from "@iconify/react";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { ApiTypes } from "@/lib/api";
import { SetupModal } from "./setup-modal";

const VISIBLE_ITEMS = 5;

interface SetupCardProps {
  user: ApiTypes.User;
  isOwner: boolean;
}

export function SetupCard({ user, isOwner }: SetupCardProps) {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const photos = user.profile.setupPhotos ?? [];
  const items = user.profile.setupItems ?? [];
  const isEmpty = photos.length === 0 && items.length === 0;

  const visibleItems = items.slice(0, VISIBLE_ITEMS);
  const hiddenItems = items.slice(VISIBLE_ITEMS);

  const renderItem = (item: ApiTypes.SetupItem) => (
    <li key={item.id} className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.name}</p>

        {item.brand && <p className="truncate text-sm text-muted-foreground">{item.brand}</p>}
      </div>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          aria-label={item.name}
          className="text-muted-foreground hover:text-primary"
        >
          <Icon icon="lucide:external-link" className="size-4" />
        </a>
      )}
    </li>
  );

  if (isEmpty && !isOwner) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:monitor" className="size-5" />

              {t("user:setup")}
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={t("user:setupEdit")}
                className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <Icon icon="lucide:pencil" className="size-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {isEmpty ? (
            <Empty className="border p-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon icon="lucide:monitor" />
                </EmptyMedia>

                <EmptyTitle>{t("user:noSetup")}</EmptyTitle>

                <EmptyDescription>{t("user:noSetupDescription")}</EmptyDescription>
              </EmptyHeader>

              <Button size="sm" onClick={() => setEditing(true)}>
                <Icon icon="lucide:plus" className="size-4" />

                {t("user:setupAdd")}
              </Button>
            </Empty>
          ) : (
            <>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setPhotoIndex(index)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-border aspect-video"
                    >
                      <Image
                        className="size-full object-cover transition-transform duration-300 hover:scale-105"
                        src={photo.url}
                        layout="fullWidth"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {t("user:setupComponents")}

                    <span className="text-muted-foreground">{items.length}</span>
                  </div>

                  <ul className="flex flex-col divide-y divide-border pt-2">{visibleItems.map(renderItem)}</ul>

                  {hiddenItems.length > 0 && (
                    <>
                      <CollapsibleContent>
                        <ul className="flex flex-col divide-y divide-border border-t border-border">
                          {hiddenItems.map(renderItem)}
                        </ul>
                      </CollapsibleContent>

                      <CollapsibleTrigger className="cursor-pointer flex items-center justify-center gap-1 border-t border-border pt-3 mt-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                        {open ? t("user:seeLess") : t("user:seeMore")}

                        <Icon
                          icon="lucide:chevron-down"
                          className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </CollapsibleTrigger>
                    </>
                  )}
                </Collapsible>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={photoIndex !== null} onOpenChange={(open) => !open && setPhotoIndex(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("user:setup")}</DialogTitle>
          </DialogHeader>

          <Carousel opts={{ startIndex: photoIndex ?? 0 }}>
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.id}>
                  <Image
                    className="w-full rounded-lg object-contain max-h-[70vh]"
                    src={photo.url}
                    layout="fullWidth"
                    alt=""
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />

                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>

      {isOwner && <SetupModal open={editing} onOpenChange={setEditing} user={user} />}
    </>
  );
}
