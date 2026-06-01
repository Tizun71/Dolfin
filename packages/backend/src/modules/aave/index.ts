import { Hono } from "hono";
import { getArbitrumMarketData } from "./services.js";

const aaveModule = new Hono();

aaveModule.get("/market", async (c) => {
  try {
    const marketData = await getArbitrumMarketData();
    return c.json(marketData);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "An unknown error occurred" }, 500);
  }
});

export default aaveModule;
