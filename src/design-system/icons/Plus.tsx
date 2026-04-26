import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Plus = forwardRef<SVGSVGElement, IconProps>(function Plus(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <line x1="12" y1="5.5" x2="12" y2="18.5" />
      <line x1="5.5" y1="12" x2="18.5" y2="12" />
    </Icon>
  );
});
