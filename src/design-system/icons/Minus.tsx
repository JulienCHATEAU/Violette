import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Minus = forwardRef<SVGSVGElement, IconProps>(function Minus(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <line x1="5.5" y1="12" x2="18.5" y2="12" />
    </Icon>
  );
});
