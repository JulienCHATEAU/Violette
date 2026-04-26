/**
 * Violette Design System — "Herbier moderne".
 *
 * This barrel re-exports every public surface of the design system so consumers
 * can import from `@/design-system` without knowing the internal layout.
 *
 * Evolution rule (Phase 2 onwards):
 *   - Every new component lives in `src/design-system/components/`.
 *   - Every new component MUST have a matching demo page in `src/app/design-system/`
 *     (dev-only viz module) covering its variants, props and the UX law(s) it applies.
 *   - Every new component should expose a JSDoc block citing the UX laws it embodies
 *     (see https://lawsofux.com).
 */

// Tokens
export * from "./tokens/colors";
export * from "./tokens/motion";
export * from "./tokens/radii";

// Lib
export { cn } from "./lib/cn";
export type { ClassValue } from "./lib/cn";

// Components
export * from "./components/Typography";
export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";
export { Card } from "./components/Card";
export type { CardProps, CardRadius, CardElevation, CardPadding } from "./components/Card";
export { TextInput, TextArea, NumberStepper, SegmentedControl } from "./components/Input";
export type {
  TextInputProps,
  TextAreaProps,
  NumberStepperProps,
  SegmentedControlProps,
  SegmentOption,
} from "./components/Input";
export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeVariant } from "./components/Badge";
export { PlantBubble } from "./components/PlantBubble";
export type { PlantBubbleProps, BubblePosition, BubbleSize } from "./components/PlantBubble";
export { WaterCTA } from "./components/WaterCTA";
export type { WaterCTAProps, WaterCTAState, WaterCTASize } from "./components/WaterCTA";
export { ConfirmDialog } from "./components/Dialog";
export type { ConfirmDialogProps } from "./components/Dialog";

// Icons
export * from "./icons";
