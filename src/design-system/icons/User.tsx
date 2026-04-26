import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const User = forwardRef<SVGSVGElement, IconProps>(function User(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20.5c.6-3.4 3.6-6 7.5-6s6.9 2.6 7.5 6" />
    </Icon>
  );
});
