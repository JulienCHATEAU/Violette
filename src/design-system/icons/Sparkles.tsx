import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Sparkles = forwardRef<SVGSVGElement, IconProps>(function Sparkles(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M12 4 13.4 8.6 18 10l-4.6 1.4L12 16l-1.4-4.6L6 10l4.6-1.4L12 4Z" />
      <path d="M18.5 14.5 19.2 16.6 21.3 17.3 19.2 18 18.5 20.1 17.8 18 15.7 17.3 17.8 16.6Z" opacity="0.7" />
    </Icon>
  );
});
