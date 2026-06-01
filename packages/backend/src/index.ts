import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { honoLogger } from "@logtape/hono";
import userModule from "./modules/user/index.js";
import aaveModule from "./modules/aave/index.js";
import aiModule from "./modules/ai/index.js";
import gmxModule from "./modules/gmx/index.js";
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

// Register user module
app.route("/user", userModule);

// Register aave module
app.route("/aave", aaveModule);

// Register AI module
app.route("/ai", aiModule);

// Register GMX module
app.route("/gmx", gmxModule);

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
