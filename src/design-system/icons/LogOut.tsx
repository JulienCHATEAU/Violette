import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const LogOut = forwardRef<SVGSVGElement, IconProps>(function LogOut(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M9.5 4.5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3.5" />
      <polyline points="15.5 8.5 20 12 15.5 15.5" />
      <line x1="20" y1="12" x2="9.5" y2="12" />
    </Icon>
  );
});
