import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { z } from "zod";
import {
  DEFAULT_RATE_LIMIT_PER_MINUTE,
  getAssistantEnv,
  getContactEndpoint,
  getSmtpConfig,
} from "@/lib/env";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/contact  { name?, email?, message }
 *
 * Delivery precedence (first configured wins):
 *   1. SMTP     — send the message directly (set SMTP_HOST / SMTP_USER / SMTP_PASS).
 *   2. CONTACT_ENDPOINT — forward the payload server-side to your own URL.
 *   3. Neither  — 501; the form falls back to composing a mailto: link client-side.
 *
 * A visitor `email`, when supplied, is set as Reply-To so replies go straight
 * to them (the message itself is sent from your SMTP account).
 */

const bodySchema = z.object({
  name: z.string().max(200).default(""),
  email: z.string().email().max(320).optional(),
  message: z.string().trim().min(1).max(5000),
});

const FORWARD_TIMEOUT_MS = 10_000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const smtp = getSmtpConfig();
  const endpoint = getContactEndpoint();
  if (!smtp && !endpoint) {
    res.status(501).json({
      error:
        "Contact API is not configured. The contact form uses mailto: instead.",
    });
    return;
  }

  const ip = getClientIp(req.headers, req.socket.remoteAddress);
  // The contact route shouldn't go down over unrelated assistant env issues.
  let limitPerMinute = DEFAULT_RATE_LIMIT_PER_MINUTE;
  try {
    limitPerMinute = getAssistantEnv().rateLimitPerMinute;
  } catch {
    // keep the default
  }
  const rate = checkRateLimit(`contact:${ip}`, limitPerMinute);
  if (!rate.ok) {
    res.setHeader("Retry-After", String(rate.retryAfterSeconds));
    res.status(429).json({ error: "Rate limit reached, try again shortly." });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  const { name, email, message } = parsed.data;

  // 1. SMTP — send the message directly.
  if (smtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      });
      const who = name.trim() || "A visitor";
      await transporter.sendMail({
        from: smtp.from,
        to: smtp.to,
        replyTo: email || undefined,
        subject: `Portfolio contact: ${name.trim() || "no name"}`,
        text: `From: ${who}${email ? ` <${email}>` : ""}\n\n${message}`,
      });
      res.status(200).json({ ok: true });
      return;
    } catch (err) {
      console.error("[api/contact] smtp send failed:", err);
      res.status(502).json({ error: "Could not deliver the message." });
      return;
    }
  }

  // 2. CONTACT_ENDPOINT — forward the payload server-side (endpoint is non-null
  // here: the !smtp && !endpoint case returned 501 above).
  if (endpoint) {
    try {
      const upstream = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
      });
      if (!upstream.ok) {
        throw new Error(`upstream responded ${upstream.status}`);
      }
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[api/contact] forward failed:", err);
      res.status(502).json({ error: "Could not deliver the message." });
    }
  }
}
