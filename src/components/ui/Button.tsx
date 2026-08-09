import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";
type Size = "md" | "sm";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const base =
  "inline-block cursor-pointer rounded-lg font-mono no-underline transition duration-fast " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100";

const variantClass: Record<Variant, string> = {
  solid:
    "border border-accent bg-accent font-semibold text-accent-contrast hover:brightness-110 focus-visible:outline-bright",
  outline:
    "border border-border-strong bg-transparent text-bright hover:border-accent hover:text-accent",
  ghost: "border border-transparent text-subtle hover:text-accent",
};

const sizeClass: Record<Size, string> = {
  md: "px-[18px] py-3 text-md",
  sm: "px-[13px] py-2 text-sm",
};

/** Terminal-styled button/link primitive with variant + size props. */
export function Button(props: ButtonProps) {
  const {
    variant = "outline",
    size = "md",
    className,
    children,
    ...rest
  } = props;
  const classes = cn(base, variantClass[variant], sizeClass[size], className);

  if ("href" in rest && typeof rest.href === "string") {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...anchorProps} className={classes}>
        {children}
      </a>
    );
  }
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
