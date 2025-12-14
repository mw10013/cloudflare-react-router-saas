"use client";

import * as React from "react";
import { focusVisibleStyles } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * React aria components GridListItem with shadcn characteristics for Card.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/components/ui/oui-index";
 *
 * <Card>
 *   <CardContent>
 *     <Rac.GridList aria-label="Items">
 *       <Oui.CardGridListItem textValue="Item 1">
 *         Item content
 *       </Oui.CardGridListItem>
 *     </Rac.GridList>
 *   </CardContent>
 * </Card>
 * ```
 */
export function CardGridListItem({
  className,
  ...props
}: React.ComponentProps<typeof Rac.GridListItem>) {
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
