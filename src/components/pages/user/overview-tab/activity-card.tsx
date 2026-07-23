import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import HeatMap, { type SVGProps } from "@uiw/react-heat-map";
import type { TFunction } from "i18next";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import { cn } from "@/lib/utils";

function getDateSuffix(day: number) {
  if (day > 3 && day < 21) return "th";

  return ["th", "st", "nd", "rd"][day % 10] || "th";
}

function formatNumber(value: number) {
  const formatter = new Intl.NumberFormat("en-US");

  return formatter.format(value);
}

function getCalendarDateProps() {
  const today = new Date();
  const startDate = new Date();

  startDate.setMonth(today.getMonth() - 12);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const totalDays = Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

  const weeks = Math.ceil((startDate.getDay() + totalDays) / 7);

  return {
    startDate,
    endDate: today,
    weeks,
  };
}

const renderRect =
  (
    t: TFunction,
    handleMouseEnter: (date: string) => void,
    handleTooltip: (pos: { x: number; y: number } | null) => void,
  ): SVGProps["rectRender"] =>
  (props, data) => {
    const [year, month, day] = String(data.date).split(/[-/]/).map(Number);
    const date = new Date(year, month - 1, day);

    const formattedDate = `${date.toLocaleDateString("en-US", { month: "long" })} ${date.getDate()}${getDateSuffix(date.getDate())}, ${date.getFullYear()}`;

    const tileInfo = t("user:activityTooltip", {
      value: data.count ? formatNumber(data.count) : t("user:activityNoCount"),
      date: formattedDate,
    });

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: decorative heatmap tile, hover only shows a tooltip
      <rect
        className="transition-all hover:brightness-125"
        onMouseEnter={() => {
          handleMouseEnter(tileInfo);
          handleTooltip({ x: props.x || 0, y: props.y || 0 } as { x: number; y: number });
        }}
        onMouseLeave={() => handleTooltip(null)}
        {...props}
      />
    );
  };

interface ActivityCardProps {
  userId: string;
}

export function ActivityCard({ userId }: ActivityCardProps) {
  const { t } = useTranslation();
  const activityCalendarQuery = useQuery({
    queryKey: ["user-activity-calendar", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetUserActivityCalendarResponse>(apiEndpoints.getCalendarActivitiesByUserId(userId))
        .then(({ data }) => data.activityCalendar),
    enabled: !!userId,
  });

  const totalActivities = activityCalendarQuery.data?.total ?? 0;
  const defaultValue = t("user:activityLastYear", { value: formatNumber(totalActivities) });

  const { weeks, ...dateProps } = getCalendarDateProps();

  const [hoveredTile, setHoveredTile] = useState<string | null>(defaultValue);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const space = 3;
  const leftPad = 30;
  const rectSize = 15;
  const width = leftPad + weeks * (rectSize + space);
  const height = 8 * (rectSize + space);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run to scroll to the end whenever the data changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeks, activityCalendarQuery.data]);

  useEffect(() => {
    setHoveredTile(defaultValue);
  }, [defaultValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon icon="lucide:activity" className="size-5" />

          {t("user:activity")}
        </CardTitle>

        <CardDescription>{hoveredTile}</CardDescription>
      </CardHeader>

      <CardContent>
        <div ref={containerRef} className="relative overflow-visible">
          <div
            ref={scrollRef}
            className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <HeatMap
              {...dateProps}
              value={activityCalendarQuery.data?.items ?? []}
              onMouseLeave={() => setHoveredTile(defaultValue)}
              rectSize={rectSize}
              space={space}
              rectProps={{ rx: 4 }}
              rectRender={renderRect(t, (date) => setHoveredTile(date), setTooltipPos)}
              height={height}
              width={width}
              style={{
                color: "oklch(0.708 0 0)",
              }}
              panelColors={{
                "0": "#022c22",
                "5": "#065f46",
                "10": "#047857",
                "20": "#059669",
                "30": "#10b981",
              }}
            />
          </div>

          {tooltipPos && scrollRef.current && (
            <div
              className={cn(
                "absolute z-10 pointer-events-none min-w-[100px] max-w-[200px] rounded-md border bg-popover px-2.5 py-1.5 text-[10px] leading-snug text-popover-foreground shadow-md",
                "transition-opacity animate-in fade-in zoom-in-95 break-words",
              )}
              style={{
                left: Math.max(
                  12,
                  Math.min(tooltipPos.x + rectSize / 2 + leftPad - scrollRef.current.scrollLeft, containerWidth - 12),
                ),
                top: tooltipPos.y - 8,
                transform: "translate(-50%, -100%)",
              }}
            >
              {hoveredTile}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
