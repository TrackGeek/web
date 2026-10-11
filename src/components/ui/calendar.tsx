import {
  type DayButton,
  DayPicker,
  dateMatchModifiers,
  getDefaultClassNames,
  type Modifiers,
  type RootProps,
  useDayPicker,
} from "@daypicker/react";
import { Icon } from "@iconify/react";
import { endOfMonth, format, isAfter, isBefore, isSameDay, isValid, parse, startOfMonth } from "date-fns";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();
  const hasYearDropdown = captionLayout === "dropdown" || captionLayout === "dropdown-years";
  const currentYear = (props.today ?? new Date()).getFullYear();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn("flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label,
        ),
        month_grid: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday,
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn("select-none w-(--cell-size)", defaultClassNames.week_number_header),
        week_number: cn("text-[0.8rem] select-none text-muted-foreground", defaultClassNames.week_number),
        day: cn(
          "relative size-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day,
        ),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today,
        ),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: CalendarRoot,
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <Icon icon={"lucide:chevron-left"} className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <Icon icon={"lucide:chevron-right"} className={cn("size-4", className)} {...props} />;
          }

          return <Icon icon={"lucide:chevron-down"} className={cn("size-4", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
      startMonth={props.startMonth ?? (hasYearDropdown ? new Date(currentYear - 100, 0) : undefined)}
      endMonth={props.endMonth ?? (hasYearDropdown ? new Date(currentYear + 100, 11) : undefined)}
    />
  );
}

function CalendarRoot({ className, rootRef, children, ...props }: RootProps) {
  const { dayPickerProps } = useDayPicker();

  return (
    <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props}>
      {dayPickerProps.mode === "single" && <CalendarDateInput />}
      {children}
    </div>
  );
}

function CalendarDateInput() {
  const { t } = useTranslation();
  const { selected, select, goToMonth, dayPickerProps } = useDayPicker<{ mode: "single" }>();
  const id = React.useId();
  const selectedValue = selected ? format(selected, "dd/MM/yyyy") : "";
  const [value, setValue] = React.useState(selectedValue);
  const [error, setError] = React.useState<"invalidDate" | "unavailableDate" | null>(null);
  const dateFormat = t("common:calendar.dateFormat");

  React.useEffect(() => {
    setValue(selectedValue);
    setError(null);
  }, [selectedValue]);

  function getDateModifiers(date: Date): Modifiers {
    const modifiers: Modifiers = {
      selected: !!selected && isSameDay(selected, date),
      today: isSameDay(dayPickerProps.today ?? new Date(), date),
      disabled: dateMatchModifiers(date, dayPickerProps.disabled ?? false),
      hidden: dateMatchModifiers(date, dayPickerProps.hidden ?? false),
      outside: false,
      focused: false,
    };

    for (const [name, matcher] of Object.entries(dayPickerProps.modifiers ?? {})) {
      modifiers[name] = dateMatchModifiers(date, matcher ?? false);
    }

    return modifiers;
  }

  function applyDate(event: React.MouseEvent | React.KeyboardEvent) {
    const input = value.trim();

    if (!input && !dayPickerProps.required) {
      if (selected) select?.(selected, getDateModifiers(selected), event);
      setError(null);
      return;
    }

    const date = parse(input, "d/M/yyyy", new Date());

    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(input) || !isValid(date)) {
      setError("invalidDate");
      return;
    }

    const modifiers = getDateModifiers(date);
    const beforeStart = dayPickerProps.startMonth && isBefore(date, startOfMonth(dayPickerProps.startMonth));
    const afterEnd = dayPickerProps.endMonth && isAfter(date, endOfMonth(dayPickerProps.endMonth));

    if (modifiers.disabled || modifiers.hidden || beforeStart || afterEnd) {
      setError("unavailableDate");
      return;
    }

    setValue(format(date, "dd/MM/yyyy"));
    setError(null);
    goToMonth(date);
    if (!selected || !isSameDay(selected, date)) select?.(date, modifiers, event);
  }

  return (
    <div className="mb-4 space-y-2">
      <Label htmlFor={id}>{t("feed:pickADate")}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={dateFormat}
          maxLength={10}
          value={value}
          aria-invalid={!!error}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              applyDate(event);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("common:calendar.applyDate")}
          onClick={applyDate}
        >
          <Icon icon="lucide:check" className="size-4" />
        </Button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="max-w-56 text-xs text-destructive">
          {t(`common:calendar.${error}`, { format: dateFormat })}
        </p>
      )}
    </div>
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
