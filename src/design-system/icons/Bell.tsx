import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Bell = forwardRef<SVGSVGElement, IconProps>(function Bell(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.4 2.2c.2.3-.02.7-.4.7H4.99c-.38 0-.6-.4-.4-.7L6 16Z" />
      <path d="M10.5 21a1.5 1.5 0 0 0 3 0" />
    </Icon>
  );
});
