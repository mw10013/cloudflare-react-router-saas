"use client";

/**
 * The `oui-base` module provides foundational Tailwind CSS styles and utilities.
 */
import { composeRenderProps } from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * A tagged template literal function that acts like an identity function for Tailwind CSS class strings.
 * Its primary purpose is to enable `prettier-plugin-tailwindcss` to sort classes in standalone
 * string literals or template literals not otherwise covered by the plugin (e.g., outside JSX `className`).
 * @see {@link https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#sorting-classes-in-template-literals}
 */
export const tw = (strings: TemplateStringsArray, ...values: string[]) =>
  String.raw({ raw: strings.raw }, ...values);

/**
 * Base focus visible styles.
 *
 * Shadcn UI generally uses a custom ring (`ring-ring/50 ring-[3px]`) with `outline-none` for `focus-visible`.
 *
 * Deviations occur for specific components:
 * - Sliders/Resizables: Adjusted ring thickness/offset for small interactive parts.
 * - Menubar items: Use background changes for focus.
 * - Tabs content: May omit explicit focus rings.
 * - Input OTP: Uses `data-[active=true]` for slot highlighting.
 *
 * This approach balances a consistent baseline with flexibility for component-specific needs.
 *
 * 'outline-none' resets user agent styles especially on Chrome
 */
export const focusVisibleStyles = tw`outline-none data-focus-visible:border-ring data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50`;

/**
 * Base group focus visible styles.
 *
 * Intended for child elements within a RAC component that structures with a label (eg. checkbox, radio).
 */
export const groupFocusVisibleStyles = tw`outline-none group-data-focus-visible:border-ring group-data-focus-visible:ring-[3px] group-data-focus-visible:ring-ring/50`;

/**
 * Base disabled styles.
 *
 * `cursor-not-allowed` is omitted as it is mainly for form controls in shadcn; visual/interaction cues are sufficient.
 *
 * Note that it includes `pointer-events-none` which prevents any cursor style (including `cursor-not-allowed`).
 * This may not be suitable for RAC components that structure with a <label> (eg. radio, checkbox and switch)
 * and `labelComponentStyles` from `oui-label` is preferred.
 */
export const disabledStyles = tw`data-disabled:pointer-events-none data-disabled:opacity-50`;

/**
 * Composes Tailwind CSS classes with render props.
 * @param className - Static or function-based CSS classes.
 * @param tw - Tailwind classes to merge.
 * @returns Composed class string or function.
 * @example
 * ```tsx
 * const newClassName = composeTailwindRenderProps(className, [
 *   focusVisibleStyles,
 *   "data-hovered:bg-accent",
 * ]);
 * ```
 */
export function composeTailwindRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tw: Parameters<typeof twMerge>[0],
): string | ((v: T) => string) {
  return composeRenderProps(className, (className) => twMerge(tw, className));
}
