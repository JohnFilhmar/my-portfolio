import type { Certification, CertificationsConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Tag } from "@/components/ui/Tag";
import { isExternalHref } from "@/lib/utils";

export interface CertificationCardProps {
  item: Certification;
  /** The section config, for its field labels. */
  labels: CertificationsConfig;
  /** h2 on the standalone page, where the page title is the h1. */
  headingLevel?: "h2" | "h3";
}

/**
 * One credential as a record: issuer, dates and credential number printed
 * plainly, and a verify link to the issuer's own page.
 */
export function CertificationCard({
  item,
  labels,
  headingLevel: Heading = "h3",
}: CertificationCardProps) {
  return (
    <Card interactive className="flex h-full flex-col gap-3">
      <div className="flex items-start gap-3.5">
        {item.image && (
          <div className="w-14 shrink-0 overflow-hidden rounded-md border border-border-muted">
            <ImageFrame
              src={item.image}
              alt={item.imageAlt ?? `${item.issuer} ${item.name} badge`}
              aspect="1/1"
              fit="contain"
              fallbackLabel={item.issuer}
            />
          </div>
        )}
        {/* The chip sits beside the issuer rather than the title, so
            a long credential name keeps the full card width. */}
        <div className="min-w-0 flex-1">
          <Heading className="m-0 mb-1 text-[17px] font-semibold leading-snug text-heading">
            {item.name}
          </Heading>
          <div className="flex items-center gap-2">
            <p className="m-0 truncate font-mono text-sm text-faint">
              {item.issuer}
            </p>
            <span className="flex-1" />
            {item.verifyUrl && (
              <Tag variant="verified" className="shrink-0">
                ✓ {labels.verifiedLabel}
              </Tag>
            )}
          </div>
        </div>
      </div>

      <dl className="m-0 flex flex-wrap gap-x-5 gap-y-1 font-mono text-2xs">
        <div className="flex gap-1.5">
          <dt className="m-0 uppercase tracking-[0.08em] text-dim">
            {labels.issuedLabel}
          </dt>
          <dd className="m-0 text-subtle">{item.issued}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="m-0 uppercase tracking-[0.08em] text-dim">
            {labels.expiresLabel}
          </dt>
          <dd className="m-0 text-subtle">
            {item.expires ?? labels.neverExpiresLabel}
          </dd>
        </div>
        {item.credentialId && (
          <div className="flex min-w-0 gap-1.5">
            <dt className="m-0 uppercase tracking-[0.08em] text-dim">
              {labels.credentialLabel}
            </dt>
            <dd className="m-0 truncate tracking-[0.06em] text-subtle">
              {item.credentialId}
            </dd>
          </div>
        )}
      </dl>

      {item.skills.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {item.skills.map((skill) => (
            <li key={skill}>
              <Tag variant="stack">{skill}</Tag>
            </li>
          ))}
        </ul>
      )}

      {item.verifyUrl && (
        <a
          href={item.verifyUrl}
          {...(isExternalHref(item.verifyUrl)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="mt-auto font-mono text-sm text-accent no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {labels.verifyLabel} ↗
        </a>
      )}
    </Card>
  );
}
