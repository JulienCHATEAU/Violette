import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const PlantPot = forwardRef<SVGSVGElement, IconProps>(function PlantPot(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M6 12.5h12l-1 7.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 12.5Z" />
      <path d="M5.2 12.5h13.6" />
      <path d="M12 12.5V8.5M12 8.5c0-2 1.6-3.6 3.6-3.6M12 8.5c0-1.7-1.3-3-3-3" opacity="0.85" />
    </Icon>
  );
});
