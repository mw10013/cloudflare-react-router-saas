"use client";

import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn Separator
 */
export function Separator({
  orientation,
  className,
  ...props
}: React.ComponentProps<typeof Rac.Separator>) {
  // RAC sets aria-orientation="vertical" for vertical separators; horizontal separators use <hr> with implicit orientation.
  return (
    <Rac.Separator
      data-slot="separator"
      orientation={orientation}
      className={twMerge(
        "h-px w-full shrink-0 bg-border aria-[orientation=vertical]:h-full aria-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}
