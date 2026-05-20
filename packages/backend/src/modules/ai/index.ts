import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { hasDelegatedToDolfinAccount, isAgentWhitelisted } from "./services.js";
import type { Address } from "viem";

const aiModule = new Hono();

aiModule.get(
  "/check",
  zValidator(
    "query",
    z.object({
      address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    }),
  ),
  async (c) => {
    const { address } = c.req.valid("query");

    return c.json({
      delegated: await hasDelegatedToDolfinAccount(address as Address),
      whitelisted: await isAgentWhitelisted(address as Address),
    });
  },
);

export default aiModule;
