import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Camera = forwardRef<SVGSVGElement, IconProps>(function Camera(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h1.7l1.4-1.8a1.5 1.5 0 0 1 1.2-.6h3.4c.5 0 .9.2 1.2.6L16.3 6H18a2.5 2.5 0 0 1 2.5 2.5v8.5A2.5 2.5 0 0 1 18 19.5H6A2.5 2.5 0 0 1 3.5 17V8.5Z" />
      <circle cx="12" cy="13" r="3.4" />
    </Icon>
  );
});
