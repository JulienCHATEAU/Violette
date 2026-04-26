import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Cloud = forwardRef<SVGSVGElement, IconProps>(function Cloud(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M7 17.5h10a3.5 3.5 0 0 0 .6-6.95A5 5 0 0 0 8.1 9.4 4 4 0 0 0 7 17.5Z" />
      <path d="M9 20.2v.6M12 20.6v.8M15 20.2v.6" opacity="0.7" />
    </Icon>
  );
});
