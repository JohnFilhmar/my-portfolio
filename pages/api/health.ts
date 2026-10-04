import type { NextApiRequest, NextApiResponse } from "next";
import { loadConfig } from "@config/index";

/**
 * Liveness and readiness for the container healthcheck and the deploy job.
 * Loading the config proves the JSON on disk is valid, so a deploy with a
 * broken config file reports unhealthy and is rolled back. The response
 * says nothing about why: details stay in the server log.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    loadConfig();
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("[health] config failed to load", error);
    res.status(503).json({ status: "unavailable" });
  }
}
