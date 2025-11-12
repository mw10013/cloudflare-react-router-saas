"use client";

/**
 * The `oui-card-ex` module provides CardExGridListItem to use with shadcn Card.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/components/ui/oui-index";
 *
 * <Card>
 *   <CardContent>
 *     <Rac.GridList aria-label="Items">
 *       <Oui.CardExGridListItem textValue="Item 1">
 *         Item content
 *       </Oui.CardExGridListItem>
 *     </Rac.GridList>
 *   </CardContent>
 * </Card>
 * ```
 */
import { focusVisibleStyles } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

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
          "rounded-md data-focus-visible:ring-offset-4 data-focus-visible:ring-offset-card",
          className,
        ),
      )}
    />
  );
}
