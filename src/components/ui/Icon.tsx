import { iconMarkup, type IconName } from "@/lib/icons";

type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number };

/** Inline SVG icon from the shared registry (same source as the 3D texture atlas). */
export function Icon({ name, size = 16, className, strokeWidth = 1.75 }: Props) {
  const { body, filled } = iconMarkup(name);
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? undefined : "currentColor"}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Static markup from our own icon registry — no user input.
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
