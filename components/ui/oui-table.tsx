"use client";

import * as React from "react";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { ArrowDown, ArrowUp } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

// Table is not interactive on first click in SSR : https://github.com/adobe/react-spectrum/issues/8239

export interface TableProps extends Rac.TableProps {
  containerClassName?: string;
}

export function Table({
  className,
  containerClassName,
  children,
  ...props
}: TableProps) {
  return (
    <div
      className={twMerge("relative w-full overflow-x-auto", containerClassName)}
    >
      <Rac.Table
        className={composeTailwindRenderProps(
          className,
          "w-full caption-bottom text-sm",
        )}
        {...props}
      >
        {children}
      </Rac.Table>
    </div>
  );
}

export function TableHeader<T extends object>({
  className,
  ...props
}: Rac.TableHeaderProps<T>) {
  return (
    <Rac.TableHeader
      className={composeTailwindRenderProps(className, "[&_tr]:border-b")}
      {...props}
    />
  );
}

export function TableBody<T extends object>({
  className,
  ...props
}: Rac.TableBodyProps<T>) {
  return (
    <Rac.TableBody
      className={composeTailwindRenderProps(
        className,
        "[&_tr:last-child]:border-0",
      )}
      {...props}
    />
  );
}

export function TableFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={twMerge(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

export function Row<T extends object>({
  className,
  ...props
}: Rac.RowProps<T>) {
  return (
    <Rac.Row
      className={composeTailwindRenderProps(
        className,
        "border-b transition-colors data-disabled:opacity-50 data-hovered:bg-muted/50 data-selected:bg-muted",
      )}
      {...props}
    />
  );
}

export function Column({ className, children, ...props }: Rac.ColumnProps) {
  return (
    <Rac.Column
      className={composeTailwindRenderProps(
        className,
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground",
      )}
      {...props}
    >
      {(renderProps) => {
        const { allowsSorting, sortDirection } = renderProps;
        const content =
          typeof children === "function" ? children(renderProps) : children;
        return (
          <div className="flex items-center gap-2">
            {content}
            {allowsSorting &&
              sortDirection &&
              (sortDirection === "ascending" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              ))}
          </div>
        );
      }}
    </Rac.Column>
  );
}

export function Cell({ className, ...props }: Rac.CellProps) {
  return (
    <Rac.Cell
      className={composeTailwindRenderProps(
        className,
        "p-2 align-middle whitespace-nowrap",
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={twMerge("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
