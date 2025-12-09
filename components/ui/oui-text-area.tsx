"use client";

import type { ComponentProps } from "react";
import {
  composeTailwindRenderProps,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * TextArea component for multi-line text input.
 * Derived from shadcn Textarea.
 * Can be nested inside TextField for label and description.
 *
 * @example
 * ```tsx
 * <Oui.TextField
 *   name="bio"
 * >
 *   <Oui.FieldLabel>Bio</Oui.FieldLabel>
 *   <Oui.TextArea
 *     className="resize-none"
 *     placeholder="Tell us a little bit about yourself"
 *   />
 *   <Oui.FieldDescription>You can mention other users and organizations.</Oui.FieldDescription>
 *   <Oui.FieldError />
 * </Oui.TextField>
 * ```
 */
export function TextArea({
  className,
  ...props
}: ComponentProps<typeof Rac.TextArea>) {
  return (
    <Rac.TextArea
    data-slot="text-area"
    className={composeTailwindRenderProps(className, [
      focusVisibleStyles,
      "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
      "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
      "data-disabled:cursor-not-allowed data-disabled:opacity-50",
    ])}
    {...props}
    />
  );
}
