"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export default function LoginWithEmail() {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) return <div>Loading...</div>;

  return (
    <div>
      {authenticated ? (
        <Button variant="outline" onClick={() => logout()}>
          Logout
        </Button>
      ) : (
        <Button variant="outline" onClick={() => login()}>
          Login
        </Button>
      )}
    </div>
  );
}
