import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { honoLogger } from "@logtape/hono";
import agentModule from "./modules/dolfin-agent/index.js";
import { saveMarketHistory } from "./jobs/save_market_history.js";
import { runDolfinAgents } from "./jobs/run_dolfin_agents.js";

// Start the cron job to save market history
saveMarketHistory.start();

// Start the cron job to run enabled Dolfin agents on a schedule
runDolfinAgents.start();

// Configure Logtape logger
await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: ["hono"], sinks: ["console"], lowestLevel: "info" },
    {
      category: ["logtape", "meta"],
      sinks: ["console"],
      lowestLevel: "warning",
    },
  ],
});

const logger = getLogger("hono");

const app = new Hono();
app.use(honoLogger());

// CORS: the frontend (separate origin) calls this API directly from the browser.
// CORS_ORIGINS is a comma-separated allowlist; defaults to the local Next dev server.
const corsOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

// Register Dolfin agent module
app.route("/agent", agentModule);

serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT || "8080"),
    hostname: process.env.HOSTNAME || "localhost",
  },
  (info) => {
    logger.info(`Server is running on ${info.address}:${info.port}`);
  },
);
