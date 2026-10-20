import type { AssistantMode } from "@config/schema";

/**
 * Typed accessor for all server-side environment variables.
 * Fails loudly (clear error messages) when live mode is requested without
 * the variables it needs — never silently degrades a misconfigured deploy.
 */

export const DEFAULT_LLM_MODEL = "claude-opus-5-5";
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 10;
/** Real model answers one visitor (IP + user agent) gets per 24 hours. */
export const DEFAULT_LLM_QUOTA = 5;
/** Real model answers the whole site serves per 24 hours, across all visitors. */
export const DEFAULT_DAILY_LLM_CAP = 150;

export interface AssistantEnv {
  provider: string;
  apiKey: string | null;
  model: string;
  /** Raw setting from ASSISTANT_MODE. */
  modeSetting: "auto" | "demo" | "live";
  rateLimitPerMinute: number;
  llmQuota: number;
  dailyLlmCap: number;
}

function readTrimmed(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = readTrimmed(name);
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`[env] ${name} must be a positive number, got "${raw}".`);
  }
  return Math.floor(parsed);
}

export function getAssistantEnv(): AssistantEnv {
  const modeRaw = (readTrimmed("ASSISTANT_MODE") ?? "auto").toLowerCase();
  if (modeRaw !== "auto" && modeRaw !== "demo" && modeRaw !== "live") {
    throw new Error(
      `[env] ASSISTANT_MODE must be "auto", "demo" or "live" — got "${modeRaw}".`,
    );
  }

  return {
    provider: (readTrimmed("LLM_PROVIDER") ?? "anthropic").toLowerCase(),
    apiKey: readTrimmed("LLM_API_KEY"),
    model: readTrimmed("LLM_MODEL") ?? DEFAULT_LLM_MODEL,
    modeSetting: modeRaw,
    rateLimitPerMinute: readPositiveInt(
      "ASSISTANT_RATE_LIMIT",
      DEFAULT_RATE_LIMIT_PER_MINUTE,
    ),
    llmQuota: readPositiveInt("ASSISTANT_LLM_QUOTA", DEFAULT_LLM_QUOTA),
    dailyLlmCap: readPositiveInt(
      "ASSISTANT_DAILY_LLM_CAP",
      DEFAULT_DAILY_LLM_CAP,
    ),
  };
}

/**
 * live  → always live (throws if no key: fail loudly, not silently demo)
 * demo  → always demo
 * auto  → live when a key is present, demo otherwise
 */
export function resolveAssistantMode(env: AssistantEnv): AssistantMode {
  if (env.modeSetting === "live") {
    if (!env.apiKey) {
      throw new Error(
        "[env] ASSISTANT_MODE=live requires LLM_API_KEY to be set. " +
          "Set the key, or use ASSISTANT_MODE=auto to fall back to demo mode.",
      );
    }
    return "live";
  }
  if (env.modeSetting === "demo") return "demo";
  return env.apiKey ? "live" : "demo";
}

export function getSiteUrl(fallback: string): string {
  return readTrimmed("NEXT_PUBLIC_SITE_URL") ?? fallback;
}

export function getContactEndpoint(): string | null {
  return readTrimmed("CONTACT_ENDPOINT");
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  /** From header on outgoing mail. Defaults to the SMTP user. */
  from: string;
  /** Where contact messages are delivered. Defaults to the SMTP user. */
  to: string;
}

/**
 * SMTP settings for the contact form. Returns null unless host, user and pass
 * are all set — the route then falls back to CONTACT_ENDPOINT, then to mailto.
 * Throws on a malformed SMTP_PORT so misconfiguration fails loudly.
 */
export function getSmtpConfig(): SmtpConfig | null {
  const host = readTrimmed("SMTP_HOST");
  const user = readTrimmed("SMTP_USER");
  const pass = readTrimmed("SMTP_PASS");
  if (!host || !user || !pass) return null;

  const portRaw = readTrimmed("SMTP_PORT");
  const port = portRaw ? Number(portRaw) : 587;
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(
      `[env] SMTP_PORT must be a positive integer — got "${portRaw}".`,
    );
  }

  const secureRaw = readTrimmed("SMTP_SECURE");
  // Implicit TLS on 465; STARTTLS on 587. Override with SMTP_SECURE=true|false.
  const secure = secureRaw ? secureRaw.toLowerCase() === "true" : port === 465;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from: readTrimmed("CONTACT_FROM") ?? user,
    to: readTrimmed("CONTACT_TO") ?? user,
  };
}
