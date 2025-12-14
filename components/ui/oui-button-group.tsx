"use client";

import type { VariantProps } from "class-variance-authority";
import {
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { composeTailwindRenderProps } from "./oui-base";

export { ButtonGroupText, ButtonGroupSeparator };

/**
 * Button group variant styles.
 *
 * ## Select in ButtonGroup - Corner Rounding
 *
 * Both Shadcn and RAC Selects require special handling in ButtonGroup because
 * their visible trigger buttons are not direct children of ButtonGroup.
 *
 * ### Shadcn Structure (SelectTrigger):
 * ```
 * ButtonGroup
 * ├── SelectTrigger [data-slot=select-trigger]  ← visible trigger, direct child
 * └── <select aria-hidden="true">               ← hidden native select, IS last-child
 * ```
 * The hidden `<select>` has `aria-hidden="true"` directly on it and becomes the
 * actual last-child, so SelectTrigger won't match `:last-child`. We detect this with
 * `has-[select[aria-hidden=true]:last-child]` and restore `rounded-r-md` on
 * `select-trigger:last-of-type`.
 *
 * ### RAC/Oui Structure (SelectButton):
 * ```
 * ButtonGroup
 * ├── <template>                                ← RAC inserts hidden template
 * ├── [data-slot=select]                        ← wrapper div, direct child
 * │   ├── SelectButton [data-slot=select-button]  ← visible trigger (NESTED)
 * │   └── <div aria-hidden="true">              ← hidden select container
 * │       └── <select>
 * └── Input
 * ```
 * The SelectButton is nested inside the `[data-slot=select]` wrapper, so ButtonGroup's
 * direct child selectors (`[&>*:not(:first-child)]`, etc.) don't reach it. We must
 * explicitly target the nested button based on the wrapper's position.
 *
 * Key considerations:
 * - CSS `border-radius` doesn't inherit, so we can't use `rounded-[inherit]`
 * - RAC inserts a `<template>` element before other children, so we use
 *   `:first-of-type` instead of `:first-child` for left-side styles
 * - Use `:not(:last-child)` for right-side styles (template doesn't affect this)
 */
export const buttonGroupVariants = cva(
  [
    "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*[data-focus-visible]]:relative [&>*[data-focus-visible]]:z-10 [&>input]:flex-1",
    // Shadcn Select: restore right rounding when hidden <select aria-hidden> is last-child
    "has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit",
    // RAC Select: restore right rounding when wrapper with hidden select is last-child
    "has-[[aria-hidden=true]_select:last-child]:[&>[data-slot=select-button]:last-of-type]:rounded-r-md [&>[data-slot=select-button]:not([class*='w-'])]:w-fit",
    // RAC Select: default wrapper width to fit content inside ButtonGroup
    "[&>[data-slot=select]]:w-fit",
    // RAC Select: propagate border styles to nested SelectButton based on wrapper position
    "[&>[data-slot=select]:not(:last-child)>[data-slot=select-button]]:rounded-r-none",
    "[&>[data-slot=select]:not(:first-of-type)>[data-slot=select-button]]:rounded-l-none",
    "[&>[data-slot=select]:not(:first-of-type)>[data-slot=select-button]]:border-l-0",

    // When input is a child, remove focus ring from the input and apply focusVisibleStyles (with rounding/offset) to the ButtonGroup when the input is keyboard-focused.
    "[&:has(>input)>input[data-focus-visible]]:!border-input [&:has(>input[data-focus-visible])>input[data-focus-visible]]:!ring-0",
    "[&:has(>input[data-focus-visible])]:rounded-md [&:has(>input[data-focus-visible])]:border-ring [&:has(>input[data-focus-visible])]:ring-[3px] [&:has(>input[data-focus-visible])]:ring-ring/50 [&:has(>input[data-focus-visible])]:ring-offset-2 [&:has(>input[data-focus-visible])]:ring-offset-background",
  ],
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

export function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof Rac.Group> &
  VariantProps<typeof buttonGroupVariants>) {
  return (
    <Rac.Group
      data-slot="button-group"
      data-orientation={orientation}
      className={composeTailwindRenderProps(
        className,
        buttonGroupVariants({ orientation }),
      )}
      {...props}
    />
  );
}
