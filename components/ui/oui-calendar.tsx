"use client";

import * as React from "react";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { Button, buttonVariants } from "@/components/ui/oui-button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn Calendar.
 */
export function Calendar<T extends Rac.DateValue>({
  className,
  ...props
}: Rac.CalendarProps<T>) {
  return (
    <Rac.Calendar
      data-slot="calendar"
      className={composeTailwindRenderProps(className, [
        // shadcn Calendar
        "group/calendar bg-background p-3 [--cell-size:--spacing(8)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        // shadcn Calendar classNames root
        "w-fit",
        // shadcn Calendar classNames month
        "flex flex-col gap-4",
      ])}
      {...props}
    />
  );
}

/**
 * Derived from shadcn Calendar classNames nav.
 */
export function CalendarHeader({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <header
      className={twMerge("flex w-full items-center justify-between", className)}
      {...props}
    />
  );
}

/**
 * Derived from shadcn Calendar classNames caption_label.
 */
export function CalendarHeading({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Heading>) {
  return (
    <Rac.Heading
      data-slot="calendar-heading"
      className={twMerge("text-sm font-medium", className)}
      {...props}
    />
  );
}

/**
 * Derived from shadcn Calendar classNames button_previous and button_next.
 */
export function CalendarButton({
  slot,
  variant = "ghost",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "slot"> & {
  slot: "previous" | "next";
}) {
  const { direction } = Rac.useLocale();
  return (
    <Button
      slot={slot}
      variant={variant}
      className={composeTailwindRenderProps(
        className,
        "size-(--cell-size) p-0 select-none",
      )}
      {...props}
    >
      {slot === "previous" ? (
        direction === "rtl" ? (
          <ChevronRight aria-hidden />
        ) : (
          <ChevronLeft aria-hidden />
        )
      ) : direction === "rtl" ? (
        <ChevronLeft aria-hidden />
      ) : (
        <ChevronRight aria-hidden />
      )}
    </Button>
  );
}

/**
 * Derived from shadcn Calendar classNames table.
 */
export function CalendarGrid({
  className,
  ...props
}: React.ComponentProps<typeof Rac.CalendarGrid>) {
  return (
    <Rac.CalendarGrid
      data-slot="calendar-grid"
      className={twMerge(
        "w-full border-collapse",
        // "[&_tbody_tr]:w-full ",
        // "[&_tbody_tr]:mt-2",
        // "[&_thead_th]:p-0",
        // "[&_tbody_td]:p-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn Calendar classNames weekdays for nested tr.
 */
export function CalendarGridHeader({
  className,
  ...props
}: React.ComponentProps<typeof Rac.CalendarGridHeader>) {
  return (
    <Rac.CalendarGridHeader
      data-slot="calendar-grid-header"
      className={twMerge("[&_tr]:flex", className)}
      {...props}
    />
  );
}

/**
 * Derived from shadcn Calendar classNames weekday.
 */
export function CalendarHeaderCell({
  className,
  ...props
}: React.ComponentProps<typeof Rac.CalendarHeaderCell>) {
  return (
    <Rac.CalendarHeaderCell
      data-slot="calendar-header-cell"
      className={twMerge(
        "flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn Calendar classNames week for nested tr and day for nested td.
 */
export function CalendarGridBody({
  className,
  ...props
}: React.ComponentProps<typeof Rac.CalendarGridBody>) {
  return (
    <Rac.CalendarGridBody
      data-slot="calendar-grid-body"
      className={twMerge(
        // shadcn Calendar classNames week
        "[&_tr]:mt-2 [&_tr]:flex [&_tr]:w-full",
        // shadcn Calendar classNames day
        // Not sure how to handle this one: [&:last-child[data-selected=true]_button]:rounded-r-md
        "[&_td]:group/day [&_td]:relative [&_td]:aspect-square [&_td]:h-full [&_td]:w-full [&_td]:p-0 [&_td]:text-center [&_td]:select-none [&_td]:[&:last-child[data-selected=true]_button]:rounded-r-md",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn CalendarDayButton
 */
export function CalendarCell({
  className,
  ...props
}: React.ComponentProps<typeof Rac.CalendarCell>) {
  return (
    <Rac.CalendarCell
      data-slot="calendar-cell"
      className={composeTailwindRenderProps(className, [
        buttonVariants({ variant: "ghost", size: "icon" }),
        "flex aspect-square size-auto w-full min-w-(--cell-size) cursor-default flex-col gap-1 leading-none font-normal",
        "data-selected:bg-primary data-selected:text-primary-foreground",
        "group-data-[slot=range-calendar]:data-selected:bg-accent group-data-[slot=range-calendar]:data-selected:text-accent-foreground",
        "group-data-[slot=range-calendar]:data-selection-start:bg-primary group-data-[slot=range-calendar]:data-selection-start:text-primary-foreground",
        "group-data-[slot=range-calendar]:data-selection-end:bg-primary group-data-[slot=range-calendar]:data-selection-end:text-primary-foreground",
        "group-data-[slot=range-calendar]:data-selected:rounded-none group-data-[slot=range-calendar]:data-selection-end:rounded-r-md group-data-[slot=range-calendar]:data-selection-start:rounded-l-md",
        "dark:data-hovered:text-accent-foreground",
        "[&>span]:text-xs [&>span]:opacity-70",

        // shadcn CalendarDayButton group-data-[focused=true]/day
        "data-pressed:relative data-pressed:z-10 data-pressed:border-ring data-pressed:ring-[3px] data-pressed:ring-ring/50",
        "data-selected:relative data-selected:z-10 data-selected:border-ring data-selected:ring-[3px] data-selected:ring-ring/50",

        // shadcn Calendar classNames outside
        "data-outside-month:text-muted-foreground data-outside-month:data-selected:text-muted-foreground",

        // shadcn Calendar classNames disabled
        "data-unavailable:text-muted-foreground data-unavailable:opacity-50",

        // shadcn Calendar classNames today
        "data-today:rounded-md data-today:bg-accent data-today:text-accent-foreground data-today:data-selected:rounded-none",
      ])}
      {...props}
    />
  );
}

/* shadcn CalendarDayButton
data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground 
data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground 
data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground 
data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground 

group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 

dark:hover:text-accent-foreground 

flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal 
group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] 
data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none 
data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md 
[&>span]:text-xs [&>span]:opacity-70

*/
