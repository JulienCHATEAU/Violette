import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Clock = forwardRef<SVGSVGElement, IconProps>(function Clock(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Icon>
  );
});
