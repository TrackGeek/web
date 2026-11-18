import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createColumnHelper, FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminReports, useUpdateAdminReport } from "@/hooks/admin";
import type { ApiTypes } from "@/lib/api";
import { seo } from "@/lib/utils/seo";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";

const STATUSES = ["Pending", "Resolved", "Dismissed"] as const;
const TARGET_TYPES = ["User", "Message", "Comment"] as const;
const ALL = "all";

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, ApiTypes.AdminReport>();

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({
    meta: [...seo({ title: "Admin - Reports" })],
  }),
  component: AdminReportsRoute,
});

function ReportUser({ user }: { user: ApiTypes.ChatUser | null }) {
  const { t } = useTranslation();

  if (!user) return <span className="italic text-muted-foreground">{t("chat:deletedUser")}</span>;

  return (
    <Link to="/user/$username" params={{ username: user.username }} className="hover:underline">
      @{user.username}
    </Link>
  );
}

interface ResolutionTarget {
  report: ApiTypes.AdminReport;
  status: "Resolved" | "Dismissed";
}

function AdminReportsRoute() {
  const { t } = useTranslation();

  const [status, setStatus] = useQueryState("status", parseAsStringLiteral(STATUSES));
  const [targetType, setTargetType] = useQueryState("targetType", parseAsStringLiteral(TARGET_TYPES));
  const [resolution, setResolution] = useState<ResolutionTarget | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminReports({
    status: status ?? undefined,
    targetType: targetType ?? undefined,
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const reports = data?.pages.flatMap((page) => page.items) ?? [];

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "createdAt",
          header: () => t("admin:createdAt"),
          cell: (info) => format(new Date(info.row.original.createdAt), "dd/MM/yyyy HH:mm"),
        }),
        columnHelper.display({
          id: "reporter",
          header: () => t("admin:reporter"),
          cell: (info) => <ReportUser user={info.row.original.reporter} />,
        }),
        columnHelper.display({
          id: "reportedUser",
          header: () => t("admin:reportedUser"),
          cell: (info) => <ReportUser user={info.row.original.reportedUser} />,
        }),
        columnHelper.display({
          id: "target",
          header: () => t("admin:target"),
          cell: (info) => <Badge variant="outline">{t(`admin:targetTypes.${info.row.original.targetType}`)}</Badge>,
        }),
        columnHelper.display({
          id: "reason",
          header: () => t("admin:reason"),
          cell: (info) => (
            <div className="flex max-w-56 flex-col gap-1">
              <span className="font-medium">{t(`report:reasons.${info.row.original.reason}`)}</span>
              {info.row.original.details && (
                <span className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {info.row.original.details}
                </span>
              )}
            </div>
          ),
        }),
        columnHelper.display({
          id: "content",
          header: () => t("admin:reportedContent"),
          cell: (info) => {
            const report = info.row.original;
            const content = report.message?.content ?? report.comment?.content ?? report.contentSnapshot;

            return (
              <div className="flex max-w-64 flex-col gap-1">
                {content && <span className="line-clamp-3 whitespace-pre-wrap break-words text-sm">{content}</span>}
                {report.message && (
                  <Link
                    to="/admin/chats/$conversationId"
                    params={{ conversationId: report.message.conversationId }}
                    className="text-xs text-primary hover:underline"
                  >
                    {t("admin:viewConversation")}
                  </Link>
                )}
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "status",
          header: () => t("common:status"),
          cell: (info) => (
            <Badge variant={info.row.original.status === "Pending" ? "destructive" : "secondary"}>
              {t(`admin:statuses.${info.row.original.status}`)}
            </Badge>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: () => t("admin:actions"),
          cell: (info) =>
            info.row.original.status === "Pending" && (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setResolution({ report: info.row.original, status: "Resolved" })}>
                  {t("admin:resolve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResolution({ report: info.row.original, status: "Dismissed" })}
                >
                  {t("admin:dismiss")}
                </Button>
              </div>
            ),
        }),
      ]),
    [t],
  );

  const table = useTable({ features, columns, data: reports });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="lucide:flag" className="size-5" />
          {t("admin:reports")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <Select value={status ?? ALL} onValueChange={(value) => setStatus(value === ALL ? null : (value as never))}>
            <SelectTrigger className="w-44" aria-label={t("admin:filters.status")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("common:all")}</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`admin:statuses.${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={targetType ?? ALL}
            onValueChange={(value) => setTargetType(value === ALL ? null : (value as never))}
          >
            <SelectTrigger className="w-44" aria-label={t("admin:filters.targetType")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("common:all")}</SelectItem>
              {TARGET_TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`admin:targetTypes.${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="lucide:flag" />
              </EmptyMedia>
              <EmptyTitle>{t("admin:noReports")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : <FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top whitespace-normal">
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div ref={sentinelRef} className="h-px" />
      </CardContent>

      <ResolutionDialog resolution={resolution} onClose={() => setResolution(null)} />
    </Card>
  );
}

const resolutionSchema = z.object({
  resolutionNote: z.string().trim().max(1000),
  removeContent: z.boolean(),
});

function ResolutionDialog({ resolution, onClose }: { resolution: ResolutionTarget | null; onClose: () => void }) {
  const { t } = useTranslation();

  const removeId = useId();
  const updateReport = useUpdateAdminReport();

  const form = useForm<z.infer<typeof resolutionSchema>>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: { resolutionNote: "", removeContent: false },
  });

  const canRemoveContent = resolution?.status === "Resolved" && resolution.report.targetType !== "User";

  function handleClose() {
    form.reset();
    onClose();
  }

  function handleSubmit({ resolutionNote, removeContent }: z.infer<typeof resolutionSchema>) {
    if (!resolution) return;

    updateReport.mutate(
      {
        reportId: resolution.report.id,
        status: resolution.status,
        resolutionNote: resolutionNote || undefined,
        removeContent: canRemoveContent && removeContent ? true : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("admin:updateSuccess"));
          handleClose();
        },
        onError: () => toast.error(t("admin:updateError")),
      },
    );
  }

  return (
    <Dialog open={Boolean(resolution)} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {resolution?.status === "Dismissed" ? t("admin:dismissTitle") : t("admin:resolveTitle")}
            </DialogTitle>
          </DialogHeader>

          {canRemoveContent && (
            <label htmlFor={removeId} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                id={removeId}
                checked={form.watch("removeContent")}
                onCheckedChange={(checked) => form.setValue("removeContent", checked === true)}
              />
              {t("admin:removeContent")}
            </label>
          )}

          <Field>
            <FieldLabel>{t("admin:note")}</FieldLabel>
            <Textarea
              placeholder={t("admin:notePlaceholder")}
              maxLength={1000}
              className="min-h-24 resize-none"
              {...form.register("resolutionNote")}
            />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common:cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateReport.isPending}>
              {resolution?.status === "Dismissed" ? t("admin:dismiss") : t("admin:resolve")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
