import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Edit = forwardRef<SVGSVGElement, IconProps>(function Edit(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      {/* Pencil body — angled rectangle */}
      <path d="M14.06 4.94l5 5L8 21H3v-5L14.06 4.94z" />
      {/* Eraser/cap */}
      <path d="M13 6l5 5" />
    </Icon>
  );
});
