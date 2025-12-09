"use client";

import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Styles for the Popover component, derived from shadcn UI's `DropdownMenuContent` and `SelectContent`.
 * React Aria Components' Popover handles the actual placement and applies essential inline styles (e.g., z-index, positioning).
 * These `popoverStyles` primarily define appearance, animations, and context-specific sizing via the `trigger` variant.
 * The `trigger` variant styles are applied based on the `trigger` render prop from React Aria Components,
 * allowing contextual styling for different trigger types like `MenuTrigger`, `Select`, or `ComboBox`.
 */

const trigger = {
  DialogTrigger: " p-4",
  MenuTrigger: "",
  SubmenuTrigger: "shadow-lg",
  Select: "min-w-(--trigger-width) p-1",
  ComboBox: "min-w-(--trigger-width) p-1",
} as const;

const placement = {
  top: "data-[placement=top]:slide-in-from-bottom-2",
  bottom: "data-[placement=bottom]:slide-in-from-top-2",
  left: "data-[placement=left]:slide-in-from-right-2",
  right: "data-[placement=right]:slide-in-from-left-2",
} as const;

export const popoverVariants = cva(
  [
    // `pointer-events-auto` ensures popovers remain interactive even when the body has `pointer-events: none` (e.g., in modal contexts like mobile sidebars).
    "pointer-events-auto relative overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
    "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95",
    "data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95",
  ],
  {
    variants: { trigger, placement },
  },
);

function isPopoverVariantsTriggerKey(
  value: unknown,
): value is keyof typeof trigger {
  return typeof value === "string" && Object.keys(trigger).includes(value);
}

function isPopoverVariantsPlacementKey(
  value: unknown,
): value is keyof typeof placement {
  return typeof value === "string" && Object.keys(placement).includes(value);
}

export function Popover({ offset = 4, className, ...props }: Rac.PopoverProps) {
  return (
    <Rac.Popover
      data-slot="popover"
      offset={offset}
      className={Rac.composeRenderProps(
        className,
        (className, { trigger, placement, ...renderProps }) =>
          twMerge(
            popoverVariants({
              trigger: isPopoverVariantsTriggerKey(trigger)
                ? trigger
                : undefined,
              placement: isPopoverVariantsPlacementKey(placement)
                ? placement
                : undefined,
              ...renderProps,
              className,
            }),
          ),
      )}
      {...props}
    />
  );
}
