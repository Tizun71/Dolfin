import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { honoLogger } from "@logtape/hono";
import userModule from "./modules/user/index.js";
import aaveModule from "./modules/aave/index.js";
import { saveMarketHistory } from "./jobs/save_market_history.js";

// Start the cron job to save market history
saveMarketHistory.start();

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
