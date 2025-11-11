"use client";

/**
 * The `oui-card-ex` module provides CardExGridList and CardExGridListItem to use with shadcn Card.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/components/ui/oui-index";
 *
 * <Card>
 *   <CardContent>
 *     <Oui.CardExGridList aria-label="Items">
 *       <Oui.CardExGridListItem textValue="Item 1">
 *         Item content
 *       </Oui.CardExGridListItem>
 *     </Oui.CardExGridList>
 *   </CardContent>
 * </Card>
 * ```
 */
import {
  composeTailwindRenderProps,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function CardExGridList<T extends object>({
  className,
  ...props
}: Rac.GridListProps<T>) {
  return (
    <Rac.GridList
      {...props}
      className={composeTailwindRenderProps(className, "divide-y")}
    />
  );
}

export function CardExGridListItem({
  className,
  ...props
}: Rac.GridListItemProps) {
  return (
    <Rac.GridListItem
      {...props}
      className={Rac.composeRenderProps(className, (className) =>
        twMerge(
          focusVisibleStyles,
          "data-focus-visible:ring-offset-card flex items-center justify-between gap-4 rounded-md py-4 first:pt-0 last:pb-0 data-focus-visible:border-transparent data-focus-visible:ring-offset-4",
          className,
        ),
      )}
    />
  );
}
