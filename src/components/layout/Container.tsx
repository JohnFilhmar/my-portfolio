import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Centered content column (max width + fluid padding from theme tokens). */
export function Container({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "mx-auto w-full max-w-container px-container-pad",
        className,
      )}
    >
      {children}
    </div>
  );
}
