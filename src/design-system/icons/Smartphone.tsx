import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Smartphone = forwardRef<SVGSVGElement, IconProps>(function Smartphone(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" ry="2.5" />
      <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
    </Icon>
  );
});
