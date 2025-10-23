"use client";

import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * Derived from shadcn Tabs.
 */
export function Tabs({ className, ...props }: Rac.TabsProps) {
  return (
    <Rac.Tabs
      data-slot="tabs"
      className={composeTailwindRenderProps(className, "flex flex-col gap-2")}
      {...props}
    />
  );
}

/**
 * Derived from shadcn TabsList.
 */
export function TabList({ className, ...props }: Rac.TabListProps<object>) {
  return (
    <Rac.TabList
      data-slot="tab-list"
      className={composeTailwindRenderProps(className, [
        "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
      ])}
      {...props}
    />
  );
}

/**
 * Derived from shadcn TabsTrigger.
 */
export function Tab({ className, ...props }: Rac.TabProps) {
  return (
    <Rac.Tab
      data-slot="tab"
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground transition-[color,box-shadow] data-selected:bg-background data-selected:shadow-sm dark:text-muted-foreground dark:data-selected:border-input dark:data-selected:bg-input/30 dark:data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      ])}
      {...props}
    />
  );
}

/**
 * Derived from shadcn TabsContent.
 */
export function TabPanel({ className, ...props }: Rac.TabPanelProps) {
  return (
    <Rac.TabPanel
      data-slot="tab-panel"
      className={composeTailwindRenderProps(className, "flex-1 outline-none")}
      {...props}
    />
  );
}
