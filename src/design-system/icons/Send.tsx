import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Send = forwardRef<SVGSVGElement, IconProps>(function Send(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M21 3 11 13" />
      <path d="M21 3 14.5 21l-3.5-8L3 9.5 21 3Z" />
    </Icon>
  );
});
