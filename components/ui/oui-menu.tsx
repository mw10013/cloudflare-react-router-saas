"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { cva } from "class-variance-authority";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn DropdownMenuContent
 */
export function Menu<T extends object>({
  className,
  ...props
}: Rac.MenuProps<T>) {
  return (
    <Rac.Menu
      data-slot="menu"
      className={composeTailwindRenderProps(
        className,
        "w-full min-w-32 overflow-x-hidden overflow-y-auto p-1",
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn DropdownMenuItem
 */
export const menuItemVariants = cva(
  [
    "relative flex cursor-default items-center gap-x-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none",
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&_svg:not([class*="text-"])]:text-muted-foreground',
    "data-focused:bg-accent data-focused:text-accent-foreground",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "",
        destructive: [
          "text-destructive [&_svg]:text-destructive",
          "data-focused:bg-destructive/10 data-focused:text-destructive dark:data-focused:bg-destructive/20",
        ],
      },
      selectionMode: {
        none: "",
        single: "pl-8",
        multiple: "pl-8",
      },
    },
    defaultVariants: {
      variant: "default",
      selectionMode: "none",
    },
  },
);

export interface MenuItemProps<T extends object> extends Rac.MenuItemProps<T> {
  variant?: "default" | "destructive";
}

/**
 * Derived from shadcn DropdownMenuCheckboxItem and DropdownMenuRadioGroup
 */
export function MenuItem<T extends object>({
  variant,
  className,
  children,
  ...props
}: MenuItemProps<T>) {
  return (
    <Rac.MenuItem
      data-slot="menu-item"
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          menuItemVariants({
            variant,
            ...renderProps,
            className,
          }),
        ),
      )}
      {...props}
    >
      {({ isSelected, selectionMode, hasSubmenu, ...renderProps }) => {
        const isCheckboxItem = isSelected && selectionMode === "multiple";
        const isRadioItem = isSelected && selectionMode === "single";

        return (
          <>
            {isCheckboxItem && (
              <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <CheckIcon className="size-4" />
              </span>
            )}
            {isRadioItem && (
              <span className="absolute left-2 flex size-3.5 items-center justify-center">
                <CircleIcon className="size-2 fill-current" />
              </span>
            )}
            {typeof children === "function"
              ? children({
                  isSelected,
                  selectionMode,
                  hasSubmenu,
                  ...renderProps,
                })
              : children}
            {hasSubmenu && <ChevronRightIcon className="ml-auto size-4" />}
          </>
        );
      }}
    </Rac.MenuItem>
  );
}

/**
 * Derived from shadcn DropdownMenuLabel
 */
export function MenuHeader({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof Rac.Header> & {
  inset?: boolean;
}) {
  return (
    <Rac.Header
      data-slot="menu-header"
      data-inset={inset}
      className={twMerge(
        "px-2 py-1.5 text-sm font-medium data-inset:pl-8",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn DropdownMenuSeparator
 */
export function MenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Separator>) {
  return (
    <Rac.Separator
      data-slot="menu-separator"
      orientation="horizontal"
      className={twMerge("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
