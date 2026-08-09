import { cn, isExternalHref } from "@/lib/utils";

export interface IconLinkProps {
  label: string;
  href: string;
  /** Trailing glyph: ↗ external, ↓ download, none. */
  glyph?: "external" | "download" | "none";
  className?: string;
}

const glyphChar = { external: " ↗", download: " ↓", none: "" } as const;

/** Mono text link with an external/download glyph and accent hover. */
export function IconLink({
  label,
  href,
  glyph = "external",
  className,
}: IconLinkProps) {
  const external = isExternalHref(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "font-mono text-[13px] text-foreground no-underline transition-colors duration-fast hover:text-accent",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {label}
      {glyphChar[glyph]}
    </a>
  );
}
