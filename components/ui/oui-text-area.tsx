"use client";

import type { ComponentProps } from "react";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * TextArea component for multi-line text input.
 * Derived from shadcn Textarea.
 * Can be nested inside TextFieldEx for label and description.
 *
 * @example
 * ```tsx
 * <Oui.TextFieldEx
 *   name="bio"
 *   label="Bio"
 *   description="You can mention other users and organizations."
 * >
 *   <Oui.TextArea
 *     className="resize-none"
 *     placeholder="Tell us a little bit about yourself"
 *   />
 * </Oui.TextFieldEx>
 * ```
 */
export function TextArea({
  className,
  ...props
}: ComponentProps<typeof Rac.TextArea>) {
  return (
    <Rac.TextArea
      {...props}
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
        "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
        "data-disabled:cursor-not-allowed",
      ])}
    />
  );
}
