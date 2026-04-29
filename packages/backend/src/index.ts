import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { configure, getConsoleSink } from "@logtape/logtape";
import { honoLogger } from "@logtape/hono";
import { appLogger } from "./constants.js";
import { auth } from "./auth.js";

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

const app = new Hono();
app.use(honoLogger());

// Integrate better-auth
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  },
  (info) => {
    appLogger.info(`Server is running at ${info.address}:${info.port}`);
  },
);
