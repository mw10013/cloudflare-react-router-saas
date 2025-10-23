"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { buttonVariants } from "@/components/ui/oui-button";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Experimental ListBox reusable wrapper for pagination controls
 */

export function ListBoxExPagination<T extends object>({
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: Rac.ListBoxProps<T>) {
  return (
    <nav aria-label="pagination" className="mx-auto flex w-full justify-center">
      <Rac.ListBox
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
export function ListBoxItemExPagination<T extends object>({
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) {
  return (
    <Rac.ListBoxItem
      {...props}
      textValue={
        props.textValue ??
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
    >
      {children}
    </Rac.ListBoxItem>
  );
}

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>ListBoxExPagination</Label>
      <Text slot="description">
        A reusable wrapper that extends{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/ListBox.html"
          underline="always"
        >
          ListBox
        </Link>{" "}
        for pagination controls — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=list-box-ex-pagination"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
