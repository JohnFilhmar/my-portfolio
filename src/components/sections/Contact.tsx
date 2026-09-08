import { useEffect, useState, type FormEvent } from "react";
import type { ContactConfig, SiteConfig } from "@config/schema";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconLink } from "@/components/ui/IconLink";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface ContactProps {
  number: string;
  contact: ContactConfig;
  site: SiteConfig;
  /** True when CONTACT_ENDPOINT is configured — form POSTs instead of mailto. */
  contactViaApi: boolean;
}

type FormStatus = "idle" | "sending" | "sent" | "error";

/** Client-side send throttle (seconds). The server enforces the real per-IP
 * rate limit; this just stops accidental/rapid re-submits from one browser. */
const COOLDOWN_SECONDS = 30;

/** Contact: email CTA + socials on the left, send-message card on the right. */
export function Contact({
  number,
  contact,
  site,
  contactViaApi,
}: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [cooldown, setCooldown] = useState(0);

  // Tick the post-send cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Clear a sent/error notice as soon as the visitor edits the form again.
  const clearNotice = () => {
    setStatus((s) => (s === "sent" || s === "error" ? "idle" : s));
  };

  const composeMailto = () => {
    const subject = encodeURIComponent(
      contact.form.subjectTemplate.replaceAll("{{name}}", name || site.name),
    );
    const body = encodeURIComponent(
      email ? `${message}\n\nreply to: ${email}` : message,
    );
    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!contactViaApi) {
      composeMailto();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error(`contact endpoint returned ${res.status}`);
      setStatus("sent");
      setCooldown(COOLDOWN_SECONDS);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "box-border w-full rounded-lg border border-border-chip bg-surface-inset px-3 py-2.5 font-mono text-[16px] text-bright caret-accent outline-none transition-colors duration-fast placeholder:text-dim focus:border-accent";

  return (
    <>
      <SectionLabel number={number} label={contact.label} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-column-gap">
        <div>
          <p className="m-0 mb-4 text-section font-bold tracking-[-0.02em] text-heading">
            {contact.heading}
          </p>
          <p className="m-0 mb-[26px] max-w-[46ch] text-[16px] leading-[1.7] text-prose">
            {contact.blurb}
          </p>
          <Button
            variant="solid"
            href={`mailto:${site.contact.email}`}
            className="mb-[22px] text-[14px]"
          >
            {site.contact.email}
          </Button>
          <div className="flex flex-wrap gap-4">
            {site.socials.map((social) => (
              <IconLink
                key={social.label}
                label={social.label}
                href={social.href}
                glyph="external"
              />
            ))}
            <IconLink
              label={site.resume.label}
              href={site.resume.href}
              glyph="download"
            />
          </div>
        </div>

        <Card>
          <p className="m-0 mb-3.5 font-mono text-[12px] text-dim">
            {contact.form.commandLine}{" "}
            <span className="text-ghost">{contact.form.commandComment}</span>
          </p>
          <form onSubmit={onSubmit}>
            <label
              htmlFor="contact-name"
              className="mb-[5px] block font-mono text-xs text-faint"
            >
              {contact.form.nameLabel}
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearNotice();
              }}
              placeholder={contact.form.namePlaceholder}
              className={`${inputClass} mb-3.5`}
            />
            <label
              htmlFor="contact-email"
              className="mb-[5px] block font-mono text-xs text-faint"
            >
              {contact.form.emailLabel}
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearNotice();
              }}
              placeholder={contact.form.emailPlaceholder}
              className={`${inputClass} mb-3.5`}
            />
            <label
              htmlFor="contact-message"
              className="mb-[5px] block font-mono text-xs text-faint"
            >
              {contact.form.messageLabel}
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                clearNotice();
              }}
              rows={4}
              placeholder={contact.form.messagePlaceholder}
              className={`${inputClass} mb-4 resize-y leading-relaxed`}
            />
            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                variant="solid"
                type="submit"
                className="px-[18px] py-[11px] text-[13px]"
                disabled={
                  status === "sending" ||
                  cooldown > 0 ||
                  message.trim().length === 0
                }
                aria-busy={status === "sending"}
              >
                {status === "sending"
                  ? contact.form.sendingLabel
                  : cooldown > 0
                    ? contact.form.cooldownLabel.replace("{s}", String(cooldown))
                    : contact.form.submitLabel}
              </Button>
              <span
                role="status"
                aria-live="polite"
                className="font-mono text-xs"
              >
                {status === "sending" && (
                  <span className="text-dim">{contact.form.sendingLabel}</span>
                )}
                {status === "sent" && (
                  <span className="text-success">
                    {contact.form.sentMessage}
                  </span>
                )}
                {status === "error" && (
                  <span className="text-danger">
                    {contact.form.errorMessage}
                  </span>
                )}
              </span>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
