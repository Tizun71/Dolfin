import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { configure, getConsoleSink } from "@logtape/logtape";
import { honoLogger } from "@logtape/hono";
import { appLogger } from "./constants.js";
import { PrivyClient, type User } from "@privy-io/node";

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

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
});

app.get("/api/users", async (c) => {
  const users: User[] = [];
  for await (const user of privy.users().list()) {
    users.push(user);
  }
  return c.json(users);
});

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    hostname: process.env.HOST || "localhost",
  },
  (info) => {
    appLogger.info(`Server is running at ${info.address}:${info.port}`);
  },
);
