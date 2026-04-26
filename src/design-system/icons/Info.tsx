import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Info = forwardRef<SVGSVGElement, IconProps>(function Info(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
});
