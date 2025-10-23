"use client";

import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn DropdownMenuShortcut.
 */
export function Keyboard({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Keyboard>) {
  return (
    <Rac.Keyboard
      className={twMerge(
        // Specify font-sans since <kbd> uses mono font by default.
        "ml-auto font-sans text-xs tracking-widest opacity-60",
        className,
      )}
      {...props}
    />
  );
}
