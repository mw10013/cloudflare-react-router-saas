"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  FieldContent,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/oui-label";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { composeTailwindRenderProps } from "./oui-base";

export {
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldContent,
  FieldTitle,
};

/**
 * Derived from shadcn Field.
 */
export const fieldStyles = cva(
  "group/field flex w-full gap-3 data-invalid:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col *:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "*:data-[slot=field-label]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto [&>.sr-only]:w-auto",
          "@md/field-group:*:data-[slot=field-label]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

export type FieldProps = React.ComponentProps<"div"> &
  VariantProps<typeof fieldStyles>;

/**
 * Oui RAC fields use specific slots (e.g., data-slot="text-field") plus data-slot-type="field".
 * Shadcn legacy styles still target data-slot="field", so we mirror selectors with data-slot-type="field".
 *
 * Why? Shadcn's Field component is a generic wrapper for layout (e.g., <Field><Label/><Input/></Field>).
 * RAC components like TextField are self-contained fields that render their own structure (label, input, etc.),
 * so they don't need an extra wrapper. To reuse fieldStyles for layout, we use data-slot-type="field"
 * on RAC components, allowing shared Tailwind selectors without breaking shadcn compatibility.
 */
export function Field({
  orientation = "vertical",
  className,
  ...props
}: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-slot-type="field"
      data-orientation={orientation}
      className={twMerge(fieldStyles({ orientation }), className)}
      {...props}
    />
  );
}

export type FieldStylesProps = VariantProps<typeof fieldStyles>;

/**
 * FieldLabel
 * Derived from shadcn FieldLabel.
 */
export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={twMerge(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-disabled/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-4",
        // Duplicate for Oui RAC components using data-slot-type=field
        "has-[>[data-slot-type=field]]:w-full has-[>[data-slot-type=field]]:flex-col has-[>[data-slot-type=field]]:rounded-md has-[>[data-slot-type=field]]:border *:data-[slot-type=field]:p-4",
        "has-data-selected:border-primary has-data-selected:bg-primary/5 dark:has-data-selected:bg-primary/10",
        // shadcn does not have. We use this for the case where an RAC control appears after the label.
        "group-has-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * FieldDescription
 * Derived from shadcn FieldDescription in field.tsx
 */
export function FieldDescription({ className, ...props }: Rac.TextProps) {
  return (
    <Rac.Text
      data-slot="field-description"
      slot="description"
      elementType="p"
      className={twMerge(
        "text-sm leading-normal font-normal text-muted-foreground group-has-data-[orientation=horizontal]/field:text-balance",
        // shadcn uses `last:mt-0` which breaks with RAC `aria-hidden`.
        // `&:not(:has(~_:not([aria-hidden])))` selects the last visible FieldDescription (no subsequent visible siblings).
        // - ~_ : any subsequent sibling (space from _)
        // - :not([aria-hidden]) : not hidden (visible)
        // - :has(...) : has a subsequent visible sibling
        // - :not(...) : does NOT have subsequent visible siblings → last visible
        "[&:not(:has(~_:not([aria-hidden])))]:mt-0",
        // shadcn uses `nth-last-2:-mt-1` which breaks with RAC `aria-hidden`.
        // `&:has(+_:not([aria-hidden])):not(:has(+_:not([aria-hidden])~_:not([aria-hidden])))` selects the second-to-last visible FieldDescription (exactly one subsequent visible sibling).
        // - +_ : immediately following sibling (space from _)
        // - :not([aria-hidden]) : not hidden (visible)
        // - First :has(...) : has an adjacent visible sibling
        // - Second :has(...) : that adjacent visible has another visible sibling after it
        // - :not(second :has) : the adjacent visible does NOT have another after → adjacent is last visible
        // - Combined: has adjacent visible (which is last) → this is second-to-last visible
        "[&:has(+_:not([aria-hidden])):not(:has(+_:not([aria-hidden])~_:not([aria-hidden])))]:-mt-1",
        "[[data-variant=legend]+&]:-mt-1.5",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        // shadcn does not have. We use this for the case where an RAC control appears after the description.
        "group-has-data-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function FieldError({
  className,
  children,
  ...props
}: Rac.FieldErrorProps) {
  // https://github.com/adobe/react-spectrum/issues/7525
  return (
    <Rac.TextContext.Provider value={{ elementType: "div" }}>
      <Rac.FieldError
        data-slot="field-error"
        className={composeTailwindRenderProps(
          className,
          "text-sm font-normal text-destructive",
        )}
        {...props}
      >
        {(renderProps) =>
          children ? (
            typeof children === "function" ? (
              children(renderProps)
            ) : (
              children
            )
          ) : renderProps.isInvalid ? (
            renderProps.validationErrors.length === 1 ? (
              renderProps.validationErrors[0]
            ) : (
              <ul className="ml-4 flex list-disc flex-col gap-1">
                {renderProps.validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )
          ) : null
        }
      </Rac.FieldError>
    </Rac.TextContext.Provider>
  );
}

/**
 * Hook that generates an ID but only returns it if an element with that ID exists in the DOM.
 * Prevents dangling aria-describedby references when slotted elements are not rendered.
 *
 * Simplified version of RAC's useSlotId. Edge case: if a slotted child suspends after the
 * parent renders but before mounting, the ID may dangle until the next render. This doesn't
 * apply when Suspense wraps the entire Field—only when a slot child itself suspends.
 */
export function useSlotId(deps: React.DependencyList = []): string | undefined {
  const id = React.useId();
  const [resolvedId, setResolvedId] = React.useState<string | undefined>(id);
  React.useLayoutEffect(() => {
    setResolvedId(document.getElementById(id) ? id : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ...deps]);
  return resolvedId;
}

/**
 * Field to compose a checkbox with a label and description.
 *
 * @example
 * ```tsx
 * #import * as Oui from "@/components/ui/oui-index";
 *
 * <Oui.FieldCheckbox>
 *   <Oui.Checkbox defaultSelected>Sync Desktop & Documents folders</Oui.Checkbox>
 *   <Oui.FieldContent>
 *     <Oui.FieldLabel>Sync Desktop & Documents folders</Oui.FieldLabel>
 *     <Oui.FieldDescription>
 *       Your Desktop & Documents folders are being synced with iCloud Drive.
 *       You can access them from other devices.
 *     </Oui.FieldDescription>
 *   </Oui.FieldContent>
 * </Oui.FieldCheckbox>
 * ```
 *
 * Not necessary if you have no description.
 */
export function FieldCheckbox({
  orientation = "horizontal",
  className,
  children,
  ...props
}: FieldProps) {
  const checkboxId = React.useId();
  const descriptionId = useSlotId();
  return (
    <div
      role="group"
      data-slot="field-checkbox"
      data-slot-type="field"
      data-orientation={orientation}
      className={twMerge(fieldStyles({ orientation }), className)}
      {...props}
    >
      <Rac.Provider
        values={[
          [
            Rac.CheckboxContext,
            { id: checkboxId, "aria-describedby": descriptionId },
          ],
          [Rac.LabelContext, { htmlFor: checkboxId }],
          [
            Rac.TextContext,
            {
              slots: {
                description: { id: descriptionId },
              },
            },
          ],
        ]}
      >
        {children}
      </Rac.Provider>
    </div>
  );
}

/**
 * Field to compose a switch with a label and field description.
 *
 * @example
 * ```tsx
 * #import * as Oui from "@/components/ui/oui-index";
 *
 * <Oui.FieldSwitch orientation="horizontal">
 *   <Oui.FieldContent>
 *     <Oui.FieldLabel>Multi-factor authentication</Oui.FieldLabel>
 *     <Oui.FieldDescription>
 *       Enable multi-factor authentication.
 *     </Oui.FieldDescription>
 *   </Oui.FieldContent>
 *   <Oui.Switch />
 * </Oui.FieldSwitch>
 * ```
 *
 * Not necessary if you have no description.
 */
export function FieldSwitch({
  orientation = "horizontal",
  className,
  children,
  ...props
}: FieldProps) {
  const switchId = React.useId();
  const descriptionId = useSlotId();
  return (
    <div
      role="group"
      data-slot="field-switch"
      data-slot-type="field"
      data-orientation={orientation}
      className={twMerge(fieldStyles({ orientation }), className)}
      {...props}
    >
      <Rac.Provider
        values={[
          [
            Rac.SwitchContext,
            { id: switchId, "aria-describedby": descriptionId },
          ],
          [Rac.LabelContext, { htmlFor: switchId }],
          [
            Rac.TextContext,
            {
              slots: {
                description: { id: descriptionId },
              },
            },
          ],
        ]}
      >
        {children}
      </Rac.Provider>
    </div>
  );
}

/**
 * Field to compose a radio with a label and description.
 *
 * Uses `slot="radioDescription"` to avoid conflict with RadioGroup's `description` slot.
 *
 * @example
 * ```tsx
 * #import * as Oui from "@/components/ui/oui-index";
 *
 * <Oui.FieldRadio>
 *   <Oui.Radio value="option1">Option 1</Oui.Radio>
 *   <Oui.FieldContent>
 *     <Oui.FieldLabel>Option 1</Oui.FieldLabel>
 *     <Oui.FieldDescription slot="radioDescription">
 *       Description for option 1.
 *     </Oui.FieldDescription>
 *   </Oui.FieldContent>
 * </Oui.FieldRadio>
 * ```
 *
 * Not necessary if you have no description.
 */
export function FieldRadio({
  orientation = "horizontal",
  className,
  children,
  ...props
}: FieldProps) {
  const radioId = React.useId();
  const descriptionId = useSlotId();
  return (
    <div
      role="group"
      data-slot="field-radio"
      data-slot-type="field"
      data-orientation={orientation}
      className={twMerge(fieldStyles({ orientation }), className)}
      {...props}
    >
      <Rac.Provider
        values={[
          [
            Rac.RadioContext,
            { id: radioId, "aria-describedby": descriptionId },
          ],
          [Rac.LabelContext, { htmlFor: radioId }],
          [
            Rac.TextContext,
            {
              slots: {
                radioDescription: { id: descriptionId },
              },
            },
          ],
        ]}
      >
        {children}
      </Rac.Provider>
    </div>
  );
}
