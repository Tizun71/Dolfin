import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { honoLogger } from "@logtape/hono";

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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 8080,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  },
);
