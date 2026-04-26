import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Thermometer = forwardRef<SVGSVGElement, IconProps>(function Thermometer(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M14 14.6V5.5a2 2 0 0 0-4 0v9.1a3.8 3.8 0 1 0 4 0Z" />
      <line x1="12" y1="9" x2="12" y2="16" />
    </Icon>
  );
});
