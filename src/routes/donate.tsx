import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { ContributorsItem } from "@/components/shared/cards/contributors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [...seo({ title: "Donate" })],
  }),
  component: DonateRoute,
});

interface GitHubContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

const createDonatePaymentSchema = z.object({
  value: z.number().positive().min(1).max(10000),
});

type CreateDonatePaymentFormData = z.infer<typeof createDonatePaymentSchema>;

function DonateRoute() {
  const { t } = useTranslation();
  const session = useSession();

  const [donationType, setDonationType] = useState<ApiTypes.PaymentFrequency>("OneTime");
  const [amountType, setAmountType] = useState<"fixed" | "custom">("fixed");
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  const createDonatePaymentForm = useForm<CreateDonatePaymentFormData>({
    resolver: zodResolver(createDonatePaymentSchema),
    defaultValues: {
      value: 1,
    },
    mode: "onChange",
  });

  const fixedAmounts = [5, 10, 25, 50];
  const customAmount = createDonatePaymentForm.watch("value");
  const finalAmount = amountType === "fixed" ? selectedAmount : Number.isFinite(customAmount) ? customAmount : 0;

  const isValidAmount = amountType === "fixed" ? finalAmount >= 1 : createDonatePaymentForm.formState.isValid;

  const handleDonateModalOpenChange = (isOpen: boolean) => {
    if (isOpen && !session?.data?.session) {
      toast.error(t("common:notLoggedIn"));

      return;
    }

    if (!isOpen) {
      setAmountType("fixed");
      setSelectedAmount(5);
      createDonatePaymentForm.reset({ value: 1 });
    }

    setIsDonateModalOpen(isOpen);
  };

  const [currencyQuery, contributorsQuery, perksQuery] = useQueries({
    queries: [
      {
        queryKey: ["currency"],
        queryFn: async () => {
          return api.get<ApiTypes.GetCurrencyResponse>(apiEndpoints.getCurrency).then((response) => response.data);
        },
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["contributors", "web"],
        queryFn: async () => {
          return axios
            .get<GitHubContributor[]>("https://api.github.com/repos/TrackGeek/web/contributors?anon=1")
            .then((response) => response.data);
        },
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["perks"],
        queryFn: async () => {
          return api.get<ApiTypes.GetPerksResponse>(apiEndpoints.getPerks).then((response) => response.data);
        },
        staleTime: 1000 * 60 * 60,
      },
    ],
  });

  const currencySymbol = currencyQuery.data?.currency
    ? (new Intl.NumberFormat("en", { style: "currency", currency: currencyQuery.data.currency })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value ?? "€")
    : "€";

  const createPaymentMutation = useMutation({
    mutationFn: async (data: ApiTypes.CreatePaymentRequest) => {
      return api
        .post<ApiTypes.CreatePaymentResponse>(apiEndpoints.createPayment, data)
        .then((response) => response.data);
    },
  });

  const contributors = useMemo(() => {
    const uniqueContributors = new Map<string, GitHubContributor>();

    for (const contributor of contributorsQuery.data ?? []) {
      const normalizedLogin = contributor.login?.toLowerCase().trim();

      if (!normalizedLogin || normalizedLogin.includes("bot")) continue;

      if (!uniqueContributors.has(normalizedLogin)) {
        uniqueContributors.set(normalizedLogin, contributor);
      }
    }

    return Array.from(uniqueContributors.values()).sort((a, b) => b.contributions - a.contributions);
  }, [contributorsQuery.data]);

  async function handleDonate() {
    if (!session?.data?.session) {
      toast.error(t("common:notLoggedIn"));

      return;
    }

    if (amountType === "custom") {
      const isCustomAmountValid = await createDonatePaymentForm.trigger("value");

      if (!isCustomAmountValid) {
        return;
      }
    }

    try {
      const { payment } = await createPaymentMutation.mutateAsync({
        frequency: donationType,
        value: Math.round(finalAmount * 100),
      });

      window.location.href = payment.url;
    } catch (error) {
      console.error(error);

      toast.error(t("common:somethingWentWrong"));
    }
  }

  return (
    <div className="flex flex-col gap-12 bg-card rounded-2xl shadow-lg p-8 text-muted-foreground">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
          {t("common:donate")}
        </h2>

        <p className="text-center">{t("pages:donate.description")}</p>

        <div className="p-10 mt-4 sm:px-56 bg-linear-to-br from-muted/50 to-muted rounded-lg text-white flex flex-col items-center gap-y-3 text-center">
          <h3 className="text-4xl sm:text-5xl font-extrabold">{t("pages:donate.wantsToDonate.title")}</h3>

          <p className="text-muted-foreground">{t("pages:donate.wantsToDonate.description")}</p>

          <Dialog open={isDonateModalOpen} onOpenChange={handleDonateModalOpenChange}>
            <DialogTrigger asChild>
              <Button className="flex flex-wrap h-12 w-full mt-5 sm:w-1/4">
                <Icon icon={"lucide:coffee"} />
                {t("common:donate")}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6 gap-6 flex flex-col bg-card text-card-foreground">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{t("common:donate")}</DialogTitle>

                <DialogDescription className="text-sm text-muted-foreground">
                  {t("pages:donate.modal.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-3">
                <Button
                  onClick={() => setDonationType("OneTime")}
                  className={`flex-1 h-12 rounded-lg font-medium transition-all ${
                    donationType === "OneTime"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("common:frequencies.OneTime")}
                </Button>

                <Button
                  onClick={() => setDonationType("Monthly")}
                  className={`flex-1 h-12 rounded-lg font-medium transition-all ${
                    donationType === "Monthly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("common:frequencies.Monthly")}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setAmountType("fixed");
                    createDonatePaymentForm.clearErrors("value");
                  }}
                  className={`flex-1 h-12 py-3 px-4 rounded-lg font-medium transition-all ${
                    amountType === "fixed"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("pages:donate.modal.fixed")}
                </Button>

                <Button
                  onClick={() => setAmountType("custom")}
                  className={`flex-1 h-12 py-3 px-4 rounded-lg font-medium transition-all ${
                    amountType === "custom"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("pages:donate.modal.custom")}
                </Button>
              </div>

              {amountType === "fixed" ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {fixedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`h-12 py-3 px-4 rounded-lg font-semibold transition-all ${
                        selectedAmount === amount
                          ? "bg-primary text-primary-foreground border-2 border-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-transparent"
                      }`}
                    >
                      {currencySymbol} {amount}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon icon={"lucide:coins"} className="size-5 shrink-0 text-primary" />

                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder={t("pages:donate.modal.enter")}
                    {...createDonatePaymentForm.register("value", {
                      valueAsNumber: true,
                    })}
                    className="flex-1"
                  />
                </div>
              )}

              {amountType === "custom" && createDonatePaymentForm.formState.errors.value ? (
                <p className="mt-2 text-sm text-destructive">
                  {createDonatePaymentForm.formState.errors.value.message}
                </p>
              ) : null}

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">
                    {currencySymbol} {(isValidAmount ? finalAmount : 0)?.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleDonate}
                disabled={!isValidAmount || createPaymentMutation.isPending}
                className="w-full py-3 text-md font-semibold"
              >
                {createPaymentMutation.isPending ? (
                  <Icon icon={"lucide:loader-2"} className="animate-spin" />
                ) : (
                  <>
                    {t("common:donate")} {currencySymbol} {(isValidAmount ? finalAmount : 0)?.toLocaleString()}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">{t("pages:donate.modal.footer")}</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <hr />

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
          {t("pages:donate.perks.title")}
        </h2>

        <p className="text-center">{t("pages:donate.perks.description")}</p>

        <div className="grid md:grid-cols-3 gap-6">
          {perksQuery.isLoading && (
            <>
              <Skeleton className="w-full h-100 rounded-lg" />
              <Skeleton className="w-full h-100 rounded-lg" />
              <Skeleton className="w-full h-100 rounded-lg" />
            </>
          )}

          {perksQuery.data?.perks &&
            perksQuery.data?.perks?.length > 0 &&
            perksQuery.data?.perks?.map((perk) => (
              <div
                key={perk.id}
                className="flex flex-col justify-between p-6 gap-4 rounded-xl border border-border bg-linear-to-br from-muted/50 to-muted hover:border-primary/50 translate-y-3 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-semibold text-white text-center">{t(`common:tiers.${perk.name}`)}</h3>

                  <p className="text-lg font-medium text-primary text-center">{perk.value.converted.formatted}</p>

                  <p className="text-muted-foreground text-sm">
                    {t(`pages:donate.perks.items.${perk.name}.description`)}
                  </p>

                  <div className="flex flex-col text-muted-foreground text-sm space-y-2">
                    {(t(`pages:donate.perks.items.${perk.name}.benefits`, { returnObjects: true }) as string[]).map(
                      (benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Icon icon={"lucide:check"} className="size-5 shrink-0 text-primary" />
                          <span>{benefit}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <hr />

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
          {t("pages:donate.geeks")}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {contributorsQuery.isPending && (
            <>
              <Skeleton className="size-24 rounded-full" />

              <Skeleton className="size-24 rounded-full" />
            </>
          )}

          {contributors.length > 0 &&
            contributors.map((contributor) => (
              <ContributorsItem
                key={contributor.login}
                name={contributor.login}
                url={contributor.html_url}
                avatarURL={contributor.avatar_url}
                roleType="supporter"
              />
            ))}
        </div>
      </div>

      <hr />

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text text-center">
          {t("pages:donate.transparencyReports")}
        </h2>

        <a
          href={"https://drive.proton.me/urls/E1WHSDDQ0M#0zZ3zOelpK8q"}
          target={"_blank"}
          rel={"noreferrer"}
          className="mx-auto w-fit flex items-center justify-center"
        >
          <Button className={"flex flex-wrap"}>
            View All
            <Icon icon={"lucide:external-link"} />
          </Button>
        </a>
      </div>
    </div>
  );
}
