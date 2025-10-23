"use client";

import React from "react";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

// TODO: Slider: vertical, multiple
export function Slider({ className, ...props }: Rac.SliderProps) {
  return (
    <Rac.Slider
      {...props}
      className={composeTailwindRenderProps(
        className,
        "group flex w-full flex-col gap-2",
      )}
    ></Rac.Slider>
  );
}

export function SliderOutput({ className, ...props }: Rac.SliderOutputProps) {
  return (
    <Rac.SliderOutput
      {...props}
      className={composeTailwindRenderProps(
        className,
        "text-sm font-medium tabular-nums",
      )}
    ></Rac.SliderOutput>
  );
}

export interface SliderTrackProps
  extends Omit<Rac.SliderTrackProps, "children">,
    Rac.SliderTrackProps {
  children?: React.ReactNode;
}

export function SliderTrack({
  className,
  children,
  ...props
}: SliderTrackProps) {
  return (
    <Rac.SliderTrack
      className={composeTailwindRenderProps(className, [disabledStyles, "h-4"])}
      {...props}
    >
      {({ state }) => (
        <>
          <div className="absolute top-[50%] h-1.5 w-full translate-y-[-50%] rounded-full bg-primary/20" />
          <div
            className="absolute top-[50%] h-1.5 translate-y-[-50%] rounded-full bg-primary"
            style={{
              width: `${String(state.getThumbPercent(0) * 100)}%`,
            }}
          />
          {children}
        </>
      )}
    </Rac.SliderTrack>
  );
}

export function SliderThumb({ className, ...props }: Rac.SliderThumbProps) {
  return (
    <Rac.SliderThumb
      {...props}
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        "top-[50%] size-4 rounded-full border border-primary/50 bg-background shadow transition-colors data-disabled:opacity-100",
      ])}
    ></Rac.SliderThumb>
  );
}
