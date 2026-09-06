import type { CertificationsConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { isExternalHref } from "@/lib/utils";

export interface CertificationsProps {
  number: string;
  certifications: CertificationsConfig;
}

/**
 * Credentials, presented as records rather than badges: issuer, dates and the
 * credential number are printed plainly and the verify link points at the
 * issuer's own page, so an employer can check an entry without asking.
 */
export function Certifications({
  number,
  certifications,
}: CertificationsProps) {
  return (
    <>
      <SectionLabel number={number} label={certifications.label} />
      <p className="m-0 mb-4 text-section font-bold tracking-[-0.02em] text-heading">
        {certifications.heading}
      </p>
      <p className="m-0 mb-7 max-w-[62ch] text-lg leading-[1.7] text-prose">
        {certifications.blurb}
      </p>

      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-3.5 p-0">
        {certifications.items.map((item) => (
          <li key={item.id} className="h-full">
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
                  <h3 className="m-0 mb-1 text-[17px] font-semibold leading-snug text-heading">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="m-0 truncate font-mono text-sm text-faint">
                      {item.issuer}
                    </p>
                    <span className="flex-1" />
                    {item.verifyUrl && (
                      <Tag variant="verified" className="shrink-0">
                        ✓ {certifications.verifiedLabel}
                      </Tag>
                    )}
                  </div>
                </div>
              </div>

              <dl className="m-0 flex flex-wrap gap-x-5 gap-y-1 font-mono text-2xs">
                <div className="flex gap-1.5">
                  <dt className="m-0 uppercase tracking-[0.08em] text-dim">
                    {certifications.issuedLabel}
                  </dt>
                  <dd className="m-0 text-subtle">{item.issued}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="m-0 uppercase tracking-[0.08em] text-dim">
                    {certifications.expiresLabel}
                  </dt>
                  <dd className="m-0 text-subtle">
                    {item.expires ?? certifications.neverExpiresLabel}
                  </dd>
                </div>
                {item.credentialId && (
                  <div className="flex min-w-0 gap-1.5">
                    <dt className="m-0 uppercase tracking-[0.08em] text-dim">
                      {certifications.credentialLabel}
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
                  {certifications.verifyLabel} ↗
                </a>
              )}
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
