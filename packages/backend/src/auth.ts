import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { siwe, openAPI } from "better-auth/plugins";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "viem";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";

export const auth = betterAuth({
  experimental: {
    joins: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    openAPI(),
    siwe({
      domain: process.env.SIWE_DOMAIN || "localhost",
      anonymous: true,

      getNonce: async () => {
        return generateRandomString(32, "a-z", "A-Z", "0-9");
      },

      verifyMessage: async ({ message, signature, address }) => {
        try {
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
    }),
  ],
});
