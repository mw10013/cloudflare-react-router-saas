"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { buttonVariants } from "@/components/ui/oui-button";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * RAC ListBox with shadcn characteristics for pagination.
 *
 * Derived from shadcn Pagination component.
 */
export function Pagination<T extends object>({
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: Rac.ListBoxProps<T>) {
  return (
    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
      <Rac.ListBox
        data-slot="pagination"
        aria-label={ariaLabel}
        orientation="horizontal"
        selectionMode="single"
        className={composeTailwindRenderProps(
          className,
          "flex flex-row items-center gap-1",
        )}
        {...props}
      />
    </nav>
  );
}

/**
 * Pagination item styled as a button. Selected items use outline variant, others use ghost.
 */
export function PaginationItem<T extends object>({
  textValue,
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) {
  return (
    <Rac.ListBoxItem
      textValue={
        textValue ??
        (typeof children === "string"
          ? children
          : typeof children === "number"
            ? String(children)
            : undefined)
      }
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          "cursor-pointer",
          buttonVariants({
            ...renderProps,
            variant: renderProps.isSelected ? "outline" : "ghost",
            className,
          }),
        ),
      )}
      {...props}
    >
      {children}
    </Rac.ListBoxItem>
  );
}
