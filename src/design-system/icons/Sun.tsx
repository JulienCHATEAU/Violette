import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Sun = forwardRef<SVGSVGElement, IconProps>(function Sun(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M5.9 5.9l1.4 1.4M16.7 16.7l1.4 1.4M5.9 18.1l1.4-1.4M16.7 7.3l1.4-1.4" />
    </Icon>
  );
});
