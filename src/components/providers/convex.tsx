import { ConvexProviderWithHerculesAuth } from "@usehercules/auth/convex-react";
import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3000";
const convex = new ConvexReactClient(convexUrl);
const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  if (bypassAuth) {
    return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>;
  }

  return (
    <ConvexProviderWithHerculesAuth client={convex}>
      {children}
    </ConvexProviderWithHerculesAuth>
  );
}