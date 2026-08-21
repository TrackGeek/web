import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyWallet } from "@/hooks/coin";
import { useCosmetics, usePurchaseCosmetic } from "@/hooks/cosmetic";
import type { ApiTypes } from "@/lib/api";
import { AVATAR_FRAME_CLASSES, BANNER_EFFECT_CLASSES, isGradientColor, PROFILE_GRADIENTS } from "@/lib/cosmetics";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({
    meta: [...seo({ title: "Shop" })],
  }),
  component: ShopRoute,
});

type ShopSection = {
  type: ApiTypes.CosmeticType;
  icon: string;
  labelKey: string;
  nameKey: (key: string) => string;
  items: ApiTypes.Cosmetic[];
};

function ShopRoute() {
  const { t } = useTranslation();

  const walletQuery = useMyWallet();
  const cosmeticsQuery = useCosmetics();
  const purchaseMutation = usePurchaseCosmetic();

  const [pendingPurchase, setPendingPurchase] = useState<{ section: ShopSection; cosmetic: ApiTypes.Cosmetic } | null>(
    null,
  );

  const balance = walletQuery.data?.balance ?? 0;

  const sections: ShopSection[] = [
    {
      type: "ProfileColor",
      icon: "lucide:palette",
      labelKey: "cosmetics:gradientColors",
      nameKey: (key) => `cosmetics:gradients.${key}`,
      items: cosmeticsQuery.data?.profileColors ?? [],
    },
    {
      type: "AvatarFrame",
      icon: "lucide:circle-dashed",
      labelKey: "cosmetics:avatarFrames",
      nameKey: (key) => `cosmetics:frames.${key}`,
      items: cosmeticsQuery.data?.avatarFrames ?? [],
    },
    {
      type: "ProfileTitle",
      icon: "lucide:tag",
      labelKey: "cosmetics:profileTitles",
      nameKey: (key) => `cosmetics:titles.${key}`,
      items: cosmeticsQuery.data?.profileTitles ?? [],
    },
    {
      type: "BannerEffect",
      icon: "lucide:wand-sparkles",
      labelKey: "cosmetics:bannerEffects",
      nameKey: (key) => `cosmetics:bannerEffectNames.${key}`,
      items: cosmeticsQuery.data?.bannerEffects ?? [],
    },
  ];

  function purchasables(section: ShopSection) {
    return section.items.filter((cosmetic) => cosmetic.unlock.type === "purchase");
  }

  function confirmPurchase() {
    if (!pendingPurchase) return;

    const { section, cosmetic } = pendingPurchase;

    purchaseMutation.mutate(
      { type: section.type, key: cosmetic.key },
      {
        onSuccess: () => {
          setPendingPurchase(null);

          toast.success(t("shop:purchase.success", { name: t(section.nameKey(cosmetic.key)) }));
        },
        onError: (error) => {
          setPendingPurchase(null);

          const code = isAxiosError(error) ? (error.response?.data as { code?: string } | undefined)?.code : undefined;

          toast.error(
            code ? t(`api:${code}`, { defaultValue: t("api:INTERNAL_SERVER_ERROR") }) : t("api:INTERNAL_SERVER_ERROR"),
          );
        },
      },
    );
  }

  function preview(section: ShopSection, cosmetic: ApiTypes.Cosmetic) {
    if (section.type === "ProfileColor") {
      return (
        <span
          className="size-10 rounded-full border border-border"
          style={
            isGradientColor(cosmetic.value)
              ? { backgroundImage: PROFILE_GRADIENTS[cosmetic.key]?.css }
              : { backgroundColor: cosmetic.value }
          }
        />
      );
    }

    if (section.type === "AvatarFrame") {
      return <span className={cn("size-10 rounded-full bg-muted", AVATAR_FRAME_CLASSES[cosmetic.key])} />;
    }

    if (section.type === "ProfileTitle") {
      return <Badge variant="outline">{t(`cosmetics:titles.${cosmetic.key}`)}</Badge>;
    }

    return (
      <span className="relative h-10 w-20 overflow-hidden rounded-md bg-muted">
        <span className={cn("absolute inset-0", BANNER_EFFECT_CLASSES[cosmetic.key])} />
      </span>
    );
  }

  const isLoading = cosmeticsQuery.isLoading || walletQuery.isLoading;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{t("shop:title")}</h1>

          <p className="text-sm text-muted-foreground">{t("shop:description")}</p>
        </div>

        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
          <Icon icon="lucide:coins" className="size-4 text-amber-400" />

          {t("shop:balance", { balance })}
        </Badge>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading &&
        sections.map((section) => (
          <Card key={section.type}>
            <CardHeader className="gap-2">
              <CardTitle>
                <Icon icon={section.icon} className="size-5" />

                {t(section.labelKey)}
              </CardTitle>

              <CardDescription>{t("shop:equipHint")}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {purchasables(section).map((cosmetic) => {
                  const price = cosmetic.unlock.type === "purchase" ? cosmetic.unlock.price : 0;
                  const affordable = balance >= price;

                  return (
                    <div
                      key={cosmetic.key}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {preview(section, cosmetic)}

                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">{t(section.nameKey(cosmetic.key))}</span>

                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon icon="lucide:coins" className="size-3 text-amber-400" />

                            {price}
                          </span>
                        </div>
                      </div>

                      {cosmetic.owned ? (
                        <Badge variant={cosmetic.equipped ? "success" : "secondary"}>
                          {cosmetic.equipped ? t("cosmetics:equipped") : t("cosmetics:owned")}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!affordable || purchaseMutation.isPending}
                          onClick={() => setPendingPurchase({ section, cosmetic })}
                        >
                          {t("shop:buy")}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

      <p className="text-sm text-muted-foreground">
        {t("shop:goToSettings")}{" "}
        <Link to="/settings" className="text-accent underline-offset-4 hover:underline">
          {t("common:settings")}
        </Link>
      </p>

      <Dialog open={Boolean(pendingPurchase)} onOpenChange={(open) => !open && setPendingPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shop:confirmPurchase.title")}</DialogTitle>

            <DialogDescription>
              {pendingPurchase &&
                t("shop:confirmPurchase.description", {
                  name: t(pendingPurchase.section.nameKey(pendingPurchase.cosmetic.key)),
                  price:
                    pendingPurchase.cosmetic.unlock.type === "purchase" ? pendingPurchase.cosmetic.unlock.price : 0,
                })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t("shop:confirmPurchase.cancel")}</Button>
            </DialogClose>

            <Button onClick={confirmPurchase} disabled={purchaseMutation.isPending}>
              {purchaseMutation.isPending && <Icon icon="lucide:loader-circle" className="size-4 animate-spin" />}

              {t("shop:confirmPurchase.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
