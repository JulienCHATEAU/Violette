import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const ArrowLeft = forwardRef<SVGSVGElement, IconProps>(function ArrowLeft(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11.5 5.5 5 12 11.5 18.5" />
    </Icon>
  );
});
