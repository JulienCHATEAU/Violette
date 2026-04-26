import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const BellOff = forwardRef<SVGSVGElement, IconProps>(function BellOff(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M8.4 6.4A6 6 0 0 1 18 11v5l1.4 2.2c.2.3-.02.7-.4.7H10" />
      <path d="M6 19h-1c-.38 0-.6-.4-.4-.7L6 16v-5c0-.65.1-1.27.3-1.85" />
      <line x1="3.5" y1="3.5" x2="20.5" y2="20.5" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
    </Icon>
  );
});
