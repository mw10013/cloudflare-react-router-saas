"use client";

/**
 * @fileoverview ListBox components for the Oui UI library.
 *
 * This module provides styled ListBoxItem components but intentionally does not
 * provide a styled ListBox wrapper. The Rac.ListBox component is used directly
 * without additional styling for the following reasons:
 *
 * 1. **Context-Dependent Styling**: ListBox containers are often used in different
 *    contexts (standalone lists, dropdowns, sidebars, pagination) where styling
 *    needs vary significantly. A single styled wrapper would be too restrictive.
 *
 * 2. **Minimal Container Role**: The ListBox component primarily handles behavior
 *    (keyboard navigation, selection, accessibility) rather than visual presentation.
 *    Visual styling is typically applied to the items themselves or the parent container.
 *
 * 3. **Flexibility**: By not providing a styled wrapper, users can apply their own
 *    container styles or use the ListBox in unstyled contexts.
 *
 * 4. **Common Usage Patterns**: In most cases, ListBox is used within other
 *    components like Select, ComboBox, or Popover, where the container styling
 *    is handled by the parent component.
 *
 * @example
 * // Standalone list with custom `container` styling
 * <div className="max-h-64 overflow-auto border rounded-md">
 *   <Rac.ListBox aria-label="Options" selectionMode="single">
 *     <ListBoxItem>Option 1</ListBoxItem>
 *     <ListBoxItem>Option 2</ListBoxItem>
 *   </Rac.ListBox>
 * </div>
 *
 * @example
 * // Within a Select dropdown (container styled by Popover)
 * <Select>
 *   <SelectButton>Select an option</SelectButton>
 *   <Popover>
 *     <Rac.ListBox items={options}>
 *       {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
 *     </Rac.ListBox>
 *   </Popover>
 * </Select>
 *
 * @example
 * // Horizontal pagination (custom wrapper for specific use case)
 * <ListBoxExPagination>
 *   <ListBoxItemExPagination>1</ListBoxItemExPagination>
 *   <ListBoxItemExPagination>2</ListBoxItemExPagination>
 * </ListBoxExPagination>
 */
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import { Check } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/** Styles derived from shadcn SelectItem.
 * https://github.com/adobe/react-spectrum/issues/7601
 */
export function ListBoxItem<T extends object>({
  className,
  children,
  ...props
}: Rac.ListBoxItemProps<T>) {
  return (
    <Rac.ListBoxItem
      {...props}
      textValue={
        props.textValue ?? (typeof children === "string" ? children : undefined)
      }
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        "data-focused:bg-accent data-focused:text-accent-foreground",
        "data-hovered:bg-accent data-hovered:text-accent-foreground",
      ])}
    >
      {Rac.composeRenderProps(children, (children, renderProps) => (
        <>
          {renderProps.isSelected && (
            <span className="absolute right-2 flex size-3.5 items-center justify-center">
              <Check className="size-4" />
            </span>
          )}
          {children}
        </>
      ))}
    </Rac.ListBoxItem>
  );
}

/**
 * Dervied from shadcn SelectLabel
 */
export function ListBoxHeader({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Header>) {
  return (
    <Rac.Header
      data-slot="list-box-header"
      className={twMerge(
        "px-2 py-1.5 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
