import { Hono } from "hono";
import { PrivyClient } from "@privy-io/node";

const userModule = new Hono();

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
  webhookSigningSecret: process.env.PRIVY_WEBHOOK_SIGNING_SECRET!,
});

userModule.post("/webhook", async (c) => {
  const verifiedPayload = await privy.webhooks().verify({
    payload: c.req.json(),
    svix: {
      id: c.req.header("svix-id")!,
      timestamp: c.req.header("svix-timestamp")!,
      signature: c.req.header("svix-signature")!,
    },
  });

  if (verifiedPayload.type === "user.created") {
    const user = verifiedPayload.user;
    // TODO: Save user to database
    console.log("User created:", user);
  }

  return c.json({ received: true });
});

export default userModule;
