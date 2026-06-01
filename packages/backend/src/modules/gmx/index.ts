import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { gmxService } from "./gmx.service.js";

const gmxModule = new Hono();

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address");

// --- Market routes ---

gmxModule.get("/markets", async (c) => {
  try {
    const data = await gmxService.getMarkets();
    return c.json(data);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

gmxModule.get("/markets/info", async (c) => {
  try {
    const data = await gmxService.getMarketsInfo();
    return c.json(data);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

gmxModule.get("/markets/volumes", async (c) => {
  try {
    const data = await gmxService.getDailyVolumes();
    return c.json(data ?? {});
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

// --- Position routes ---

gmxModule.get(
  "/positions/:userAddress",
  zValidator("param", z.object({ userAddress: addressSchema })),
  async (c) => {
    try {
      const { userAddress } = c.req.valid("param");
      const data = await gmxService.getPositions(userAddress as `0x${string}`);
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

gmxModule.get(
  "/positions/:userAddress/info",
  zValidator("param", z.object({ userAddress: addressSchema })),
  async (c) => {
    try {
      const { userAddress } = c.req.valid("param");
      const data = await gmxService.getPositionsInfo(userAddress as `0x${string}`);
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

// --- Order routes ---

gmxModule.get(
  "/orders/:userAddress",
  zValidator("param", z.object({ userAddress: addressSchema })),
  async (c) => {
    try {
      const { userAddress } = c.req.valid("param");
      const data = await gmxService.getOrders(userAddress as `0x${string}`);
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

gmxModule.get(
  "/order-status/:requestId",
  zValidator("param", z.object({ requestId: z.string().min(1) })),
  async (c) => {
    try {
      const { requestId } = c.req.valid("param");
      const data = await gmxService.fetchOrderStatus(requestId);
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

// --- Trade history ---

gmxModule.get(
  "/trades/:userAddress",
  zValidator("param", z.object({ userAddress: addressSchema })),
  zValidator(
    "query",
    z.object({
      pageSize: z.coerce.number().int().min(1).max(100).default(20),
      pageIndex: z.coerce.number().int().min(0).default(0),
    })
  ),
  async (c) => {
    try {
      const { userAddress } = c.req.valid("param");
      const { pageSize, pageIndex } = c.req.valid("query");
      const data = await gmxService.getTradeHistory({
        userAddress: userAddress as `0x${string}`,
        pageSize,
        pageIndex,
      });
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

// --- Subaccount setup (user runs once to authorize agent) ---

gmxModule.get("/agent-address", (c) => {
  return c.json({ agentAddress: gmxService.agentAddress });
});

gmxModule.post(
  "/subaccount/prepare",
  zValidator("json", z.object({ userAddress: addressSchema })),
  async (c) => {
    try {
      const { userAddress } = c.req.valid("json");
      const data = await gmxService.prepareSubaccountApproval(
        userAddress as `0x${string}`
      );
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

gmxModule.get(
  "/subaccount/status/:userAddress",
  zValidator("param", z.object({ userAddress: addressSchema })),
  async (c) => {
    try {
      const { userAddress } = c.req.valid("param");
      const data = await gmxService.getSubaccountStatus(
        userAddress as `0x${string}`
      );
      return c.json(data);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
    }
  }
);

export default gmxModule;
