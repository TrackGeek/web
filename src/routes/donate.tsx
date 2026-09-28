import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

  const [currencyQuery, donorsQuery, perksQuery] = useQueries({
    queries: [
      {
        queryKey: ["currency"],
        queryFn: async () => {
          return api.get<ApiTypes.GetCurrencyResponse>(apiEndpoints.getCurrency).then((response) => response.data);
        },
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["donors"],
        queryFn: async () => {
          return api.get<ApiTypes.GetDonorsResponse>(apiEndpoints.getDonors).then((response) => response.data);
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

  const donors = donorsQuery.data?.donors ?? [];

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
    <div className="min-w-0 rounded-2xl bg-card p-5 text-muted-foreground shadow-lg sm:p-8 lg:p-10">
      <header className="flex flex-col items-start gap-6 border-b border-border/40 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-2xl space-y-3">
          <h1 className="text-3xl font-bold text-card-foreground [overflow-wrap:anywhere] sm:text-4xl">
            {t("pages:donate.supportTitle")}
          </h1>
          <p className="text-base leading-relaxed">{t("pages:donate.description")}</p>
        </div>
        <div className="flex w-full shrink-0 flex-col items-start gap-2 lg:w-auto lg:items-end">
          <Dialog open={isDonateModalOpen} onOpenChange={handleDonateModalOpenChange}>
            <DialogTrigger asChild>
              <Button className="h-12 w-full sm:w-auto sm:min-w-40">
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

              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                <Button
                  aria-pressed={donationType === "OneTime"}
                  onClick={() => setDonationType("OneTime")}
                  className={`flex-1 h-12 rounded-lg font-medium transition-colors ${
                    donationType === "OneTime"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("common:frequencies.OneTime")}
                </Button>

                <Button
                  aria-pressed={donationType === "Monthly"}
                  onClick={() => setDonationType("Monthly")}
                  className={`flex-1 h-12 rounded-lg font-medium transition-colors ${
                    donationType === "Monthly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("common:frequencies.Monthly")}
                </Button>
              </div>

              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                <Button
                  aria-pressed={amountType === "fixed"}
                  onClick={() => {
                    setAmountType("fixed");
                    createDonatePaymentForm.clearErrors("value");
                  }}
                  className={`flex-1 h-12 py-3 px-4 rounded-lg font-medium transition-colors ${
                    amountType === "fixed"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("pages:donate.modal.fixed")}
                </Button>

                <Button
                  aria-pressed={amountType === "custom"}
                  onClick={() => setAmountType("custom")}
                  className={`flex-1 h-12 py-3 px-4 rounded-lg font-medium transition-colors ${
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
                      aria-pressed={selectedAmount === amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`h-12 py-3 px-4 rounded-lg font-semibold transition-colors ${
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
                    aria-label={t("pages:donate.modal.enter")}
                    aria-invalid={!!createDonatePaymentForm.formState.errors.value}
                    aria-describedby={
                      createDonatePaymentForm.formState.errors.value ? "donation-amount-error" : undefined
                    }
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
                <p id="donation-amount-error" role="alert" className="mt-2 text-sm text-destructive">
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
                  <>
                    <Icon icon={"lucide:loader-2"} className="animate-spin motion-reduce:animate-none" />
                    {t("common:loading")}
                  </>
                ) : (
                  <>
                    {t("common:donate")} {currencySymbol} {(isValidAmount ? finalAmount : 0)?.toLocaleString()}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">{t("pages:donate.modal.footer")}</p>
            </DialogContent>
          </Dialog>
          <p className="text-sm">{t("pages:donate.supportOptions")}</p>
        </div>
      </header>

      <section aria-labelledby="donation-perks" className="py-8 sm:py-10">
        <div className="mb-6 max-w-2xl space-y-2">
          <h2 id="donation-perks" className="text-2xl font-semibold text-card-foreground">
            {t("pages:donate.perks.title")}
          </h2>
          <p className="text-sm leading-relaxed">{t("pages:donate.perks.description")}</p>
        </div>

        {perksQuery.isPending ? (
          <div className="grid gap-4 lg:grid-cols-3" role="status" aria-label={t("common:loading")}>
            {["tracker", "archivist", "master"].map((tier) => (
              <Skeleton key={tier} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : perksQuery.isError ? (
          <div role="alert" className="flex flex-wrap items-center gap-4 rounded-xl bg-muted/50 p-5">
            <p>{t("common:somethingWentWrong")}</p>
            <Button variant="outline" onClick={() => perksQuery.refetch()}>
              {t("common:tryAgain")}
            </Button>
          </div>
        ) : perksQuery.data?.perks.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {perksQuery.data.perks.map((perk) => (
              <article
                key={perk.id}
                className="min-w-0 rounded-xl border border-border/40 bg-linear-to-br from-muted/50 to-muted p-5 sm:p-6"
              >
                <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-xl font-semibold text-card-foreground [overflow-wrap:anywhere]">
                    {t(`common:tiers.${perk.name}`)}
                  </h3>
                  <span className="text-lg font-semibold text-primary tabular-nums">
                    {perk.value.converted.formatted}
                  </span>
                </div>
                <ul className="space-y-3 text-sm leading-relaxed">
                  {(t(`pages:donate.perks.items.${perk.name}.benefits`, { returnObjects: true }) as string[]).map(
                    (benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <Icon icon="lucide:check" aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{benefit}</span>
                      </li>
                    ),
                  )}
                </ul>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-muted/50 p-5 text-sm">{t("common:noResults")}</p>
        )}
      </section>

      <footer className="flex flex-col gap-6 border-t border-border/40 pt-6">
        <Button asChild variant="link" className="h-auto w-fit max-w-full justify-start p-0 text-sm">
          <a href="https://drive.proton.me/urls/E1WHSDDQ0M#0zZ3zOelpK8q" target="_blank" rel="noreferrer">
            {t("pages:donate.transparencyReports")}
            <Icon icon="lucide:external-link" aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </Button>
        {donors.length > 0 && (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {t("pages:donate.contributors")}
              <Icon icon="lucide:chevron-down" aria-hidden="true" className="size-4 shrink-0 group-open:rotate-180" />
            </summary>
            <div className="mt-5 flex flex-wrap gap-4">
              {donors.map((donor) => (
                <ContributorsItem
                  key={donor.id}
                  name={donor.name}
                  url={`/user/${encodeURIComponent(donor.username ?? "")}`}
                  avatarURL={donor.profile?.avatarUrl}
                  roleType="supporter"
                />
              ))}
            </div>
          </details>
        )}
      </footer>
    </div>
  );
}
