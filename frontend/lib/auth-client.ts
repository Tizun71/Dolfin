import { createAuthClient } from "better-auth/react";
import { siweClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:8080/api/auth",
  plugins: [siweClient()],
});
