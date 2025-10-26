"use client";

import { Label } from "@/components/ui/oui-label";
import {
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/oui-slider";
import * as Rac from "react-aria-components";

export interface SliderExProps extends Rac.SliderProps {
  label?: React.ReactNode;
}

export function SliderEx({ label, ...props }: SliderExProps) {
  return (
    <Slider {...props}>
      <div className="flex items-center justify-between gap-2">
        {label && typeof label === "string" ? <Label>{label}</Label> : label}
        <SliderOutput />
      </div>
      <SliderTrack>
        <SliderThumb />
      </SliderTrack>
    </Slider>
  );
}
