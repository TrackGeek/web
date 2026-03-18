import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Calendar,
  CreditCard,
  ExternalLink,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [...seo({ title: "Billing" })],
  }),
  component: BillingRoute,
});

const columnHelper = createColumnHelper<ApiTypes.Payment>();

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value / 100);
}

function PaymentStatusBadge({ status }: { status: ApiTypes.Payment["status"] }) {
  const { t } = useTranslation();

  const variantMap: Record<string, "success" | "warning" | "destructive"> = {
    Succeeded: "success",
    Pending: "warning",
    Failed: "destructive",
  };

  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      {t(`pages:billing.payments.statuses.${status}`)}
    </Badge>
  );
}

function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("pages:billing.subscription.cancel")}</DialogTitle>
          <DialogDescription>
            {t("pages:billing.subscription.cancelConfirm")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {t("pages:billing.subscription.cancelBack")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {t("pages:billing.subscription.cancelConfirmButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionCard({
  subscription,
  isLoading,
  onCancel,
  isCancelling,
}: {
  subscription: ApiTypes.GetCurrentSubscriptionResponse["subscription"] | undefined;
  isLoading: boolean;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const { t } = useTranslation();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            {t("pages:billing.subscription.title")}
          </CardTitle>
          <CardDescription>{t("pages:billing.subscription.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex justify-end">
            <Skeleton className="h-8 w-36" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            {t("pages:billing.subscription.title")}
          </CardTitle>
          <CardDescription>{t("pages:billing.subscription.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Empty className="border-0 p-0 md:p-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CreditCard />
              </EmptyMedia>
              <EmptyTitle>{t("pages:billing.subscription.noSubscription")}</EmptyTitle>
              <EmptyDescription>
                {t("pages:billing.subscription.noSubscriptionDescription")}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/donate">{t("pages:billing.subscription.subscribe")}</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          {t("pages:billing.subscription.title")}
        </CardTitle>
        <CardDescription>{t("pages:billing.subscription.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("pages:billing.subscription.plan")}
            </p>
            <p className="font-medium">{subscription.product.title}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("pages:billing.subscription.status")}
            </p>
            <Badge variant={subscription.status === "active" ? "success" : "warning"}>
              {t(`pages:billing.subscription.statuses.${subscription.status}`)}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("pages:billing.subscription.price")}
            </p>
            <p className="font-medium">{subscription.price.formatted}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("pages:billing.subscription.renewsAt")}
            </p>
            <p className="font-medium">
              {format(new Date(subscription.renewsAt), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setCancelOpen(true)}
            disabled={isCancelling || subscription.status !== "active"}
          >
            {t("pages:billing.subscription.cancel")}
          </Button>
        </div>

        <CancelSubscriptionDialog
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onConfirm={() => {
            onCancel();
            setCancelOpen(false);
          }}
          isPending={isCancelling}
        />
      </CardContent>
    </Card>
  );
}

function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
}: {
  payment: ApiTypes.Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  if (!payment) return null;

  const rows = [
    {
      label: t("pages:billing.detail.name"),
      value: payment.name,
    },
    {
      label: t("pages:billing.detail.status"),
      value: <PaymentStatusBadge status={payment.status} />,
    },
    {
      label: t("pages:billing.detail.frequency"),
      value: t(`pages:billing.payments.frequencies.${payment.frequency}`),
    },
    {
      label: t("pages:billing.detail.subtotal"),
      value: formatCurrency(payment.subtotalValue, payment.currency),
    },
    ...(payment.discountValue
      ? [
          {
            label: t("pages:billing.detail.discount"),
            value: `- ${formatCurrency(payment.discountValue, payment.currency)}`,
          },
        ]
      : []),
    {
      label: t("pages:billing.detail.total"),
      value: formatCurrency(payment.totalValue, payment.currency),
    },
    {
      label: t("pages:billing.detail.currency"),
      value: payment.currency.toUpperCase(),
    },
    {
      label: t("pages:billing.detail.date"),
      value: format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            {t("pages:billing.detail.title")}
          </DialogTitle>
          <DialogDescription>{payment.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        {payment.stripeInvoiceUrl && (
          <>
            <Separator />
            <Button variant="outline" size="sm" asChild className="w-full">
              <a
                href={payment.stripeInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                {t("pages:billing.detail.viewInvoice")}
              </a>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BillingRoute() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedPayment, setSelectedPayment] = useState<ApiTypes.Payment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [subscriptionQuery, paymentsQuery] = useQueries({
    queries: [
      {
        queryKey: ["subscription"],
        queryFn: () =>
          api
            .get<ApiTypes.GetCurrentSubscriptionResponse>(
              apiEndpoints.getCurrentSubscription,
            )
            .then((response) => response.data),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: ["payments"],
        queryFn: () =>
          api
            .get<ApiTypes.GetPaymentsResponse>(apiEndpoints.getPayments)
            .then((response) => response.data),
        staleTime: 1000 * 60 * 60,
      },
    ],
  });

  const cancelCurrentSubscriptionMutation = useMutation({
    mutationFn: () => api.delete(apiEndpoints.cancelCurrentSubscription),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success(t("pages:billing.subscription.cancelSuccess"));
    },
    onError: () => {
      toast.error(t("pages:billing.subscription.cancelError"));
    },
  });

  function handleCancelSubscription() {
    cancelCurrentSubscriptionMutation.mutate();
  }

  const payments = paymentsQuery.data?.payments?.items ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => t("pages:billing.payments.columns.name"),
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("createdAt", {
        header: () => (
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {t("pages:billing.payments.columns.date")}
          </span>
        ),
        cell: (info) => format(new Date(info.getValue()), "dd/MM/yyyy HH:mm:ss"),
      }),
      columnHelper.accessor("totalValue", {
        header: () => t("pages:billing.payments.columns.amount"),
        cell: (info) =>
          formatCurrency(info.getValue(), info.row.original.currency),
      }),
      columnHelper.accessor("frequency", {
        header: () => t("pages:billing.payments.columns.frequency"),
        cell: (info) => t(`pages:billing.payments.frequencies.${info.getValue()}`),
      }),
      columnHelper.accessor("status", {
        header: () => t("pages:billing.payments.columns.status"),
        cell: (info) => <PaymentStatusBadge status={info.getValue()} />,
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      <SubscriptionCard
        subscription={subscriptionQuery.data?.subscription}
        isLoading={subscriptionQuery.isLoading}
        onCancel={handleCancelSubscription}
        isCancelling={cancelCurrentSubscriptionMutation.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            {t("pages:billing.payments.title")}
          </CardTitle>
          <CardDescription>{t("pages:billing.payments.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <Empty className="border-0 p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Receipt />
                </EmptyMedia>
                <EmptyTitle>{t("pages:billing.payments.empty")}</EmptyTitle>
                <EmptyDescription>
                  {t("pages:billing.payments.emptyDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedPayment(row.original);
                      setDetailOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentDetailDialog
        payment={selectedPayment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
