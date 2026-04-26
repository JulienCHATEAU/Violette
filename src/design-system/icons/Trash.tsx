import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Trash = forwardRef<SVGSVGElement, IconProps>(function Trash(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <polyline points="3.5 6.5 5 6.5 20.5 6.5" />
      <path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M6 6.5l1 13.2a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-13.2" />
      <line x1="10" y1="10.5" x2="10" y2="17.5" />
      <line x1="14" y1="10.5" x2="14" y2="17.5" />
    </Icon>
  );
});
