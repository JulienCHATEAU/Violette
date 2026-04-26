import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Leaf = forwardRef<SVGSVGElement, IconProps>(function Leaf(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M5 19c0-7 5-13 14-14-1 9-7 14-14 14Z" />
      <path d="M5 19c4-4 8-6 13-9" opacity="0.7" />
      <path d="M9 15c1-1 2-1.6 3-1.8M11.5 12c.8-.8 1.6-1.2 2.5-1.4" opacity="0.5" />
    </Icon>
  );
});
