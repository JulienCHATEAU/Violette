import { forwardRef } from "react";
import { Icon, type IconProps } from "./Icon";

export const Home = forwardRef<SVGSVGElement, IconProps>(function Home(props, ref) {
  return (
    <Icon ref={ref} {...props}>
      <path d="M4 11.2 12 4.5l8 6.7v8.3a1 1 0 0 1-1 1h-4.5v-5.5h-5V20.5H5a1 1 0 0 1-1-1v-8.3Z" />
    </Icon>
  );
});
