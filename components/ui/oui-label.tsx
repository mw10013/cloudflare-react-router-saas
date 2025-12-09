"use client";

import { tw } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";

/**
 * Derived from shadcn Label.
 *
 * For RAC components that structure with a 'label' prefer 'labelComponentStyles' instead.
 */
export const baseLabelStyles = tw`flex items-center gap-2 text-sm leading-none font-medium select-none`;

/**
 * Label styles for RAC components that structure with a 'label' and have render props (eg. radio, checkbox and switch).
 * Derived from shadcn Label.
 * It styles disabled. It does not style focus-visible.
 */
export const labelComponentStyles = twJoin(
  baseLabelStyles,
  // Cannot use 'disabledStyles' from oui-base since it includes pointer-events-none preventing cursor style.
  "data-disabled:cursor-not-allowed data-disabled:opacity-50",
);

/**
 * Derived from shadcn Label.
 */
export function Label({ className, ...props }: Rac.LabelProps) {
  return (
    <Rac.Label
      data-slot="label"
      className={twMerge(
        baseLabelStyles,
        "group-data-disabled:pointer-events-none group-data-disabled:opacity-50",
        "peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
