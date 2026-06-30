import type { TFunction } from "i18next";
import { useTranslation } from 'react-i18next';
import HeatMap, { type SVGProps } from "@uiw/react-heat-map";
import { useEffect, useRef, useState } from "react";

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
	const totalDays =
		Math.round((today.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

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
	): SVGProps["rectRender"] =>
	(props, data) => {
		const date = new Date(data.date);

		const formattedDate = `${date.toLocaleDateString("en-US", { month: "long" })} ${date.getDate()}${getDateSuffix(date.getDate())}, ${date.getFullYear()}`;

		const tileInfo = t("user:activityTooltip", {
			value: data.count ? formatNumber(data.count) : t("user:activityNoCount"),
			date: formattedDate,
		});

		return (
			<rect
				className="transition-all hover:brightness-125"
				onMouseEnter={() => handleMouseEnter(tileInfo)}
				{...props}
			/>
		);
	};

export function ActivityCard() {
  const { t } = useTranslation();
  
  const defaultValue = t("user:activityLastYear", { value: formatNumber(0) });

	const { weeks, ...dateProps } = getCalendarDateProps();

	const [hoveredTile, setHoveredTile] = useState<string | null>(defaultValue);
	const [width, setWidth] = useState(700);
	const scrollRef = useRef<HTMLDivElement>(null);

	const space = 2;
	const rectSize = Math.max(1, width / weeks - space);
	const height = 7 * (rectSize + space);

	useEffect(() => {
		const el = scrollRef.current;

		if (!el) return;

		const observer = new ResizeObserver(([entry]) => {
			setWidth(entry.contentRect.width);
		});

		observer.observe(el);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
		}
	}, [width]);
  
  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 flex flex-col gap-4">
      <div className='flex flex-col gap-2'>
        <h4 className="text-md font-semibold text-card-foreground">{t("user:activity")}</h4>
      
        <span className="text-sm text-gray-600">{hoveredTile}</span>
      </div>

      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <HeatMap
          {...dateProps}
          onMouseLeave={() => setHoveredTile(defaultValue)}
          weekLabels={false}
          monthLabels={false}
          legendCellSize={0}
          rectSize={rectSize}
          space={space}
          rectProps={{ rx: 4 }}
          rectRender={renderRect(t, (date) => setHoveredTile(date))}
          height={height}
          width={width}
          panelColors={{
            "0": "#022c22",
            "5": "#065f46",
            "10": "#047857",
            "20": "#059669",
            "30": "#10b981",
          }}
        />
      </div>
    </div>
  )
}