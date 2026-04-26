import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Droplet = forwardRef<SVGSVGElement, IconProps>(function Droplet(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M12 3.2c-2.6 3.4-5.5 6.6-5.5 10.1a5.5 5.5 0 0 0 11 0c0-3.5-2.9-6.7-5.5-10.1Z" />
      <path d="M9.6 14.5a2.4 2.4 0 0 0 2.4 2.4" opacity="0.7" />
    </Icon>
  );
});
