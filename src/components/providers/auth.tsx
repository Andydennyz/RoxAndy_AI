import { HerculesAuthProvider } from "@usehercules/auth/react";

const authority = import.meta.env.VITE_HERCULES_OIDC_AUTHORITY as string;
const clientId = import.meta.env.VITE_HERCULES_OIDC_CLIENT_ID as string;
const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (bypassAuth) {
    console.info("Auth bypass enabled; rendering app without Hercules auth.");
    return <>{children}</>;
  }

  const defaultRedirectUri = `${window.location.origin}/auth/callback`;
  const envRedirectUri = import.meta.env.VITE_HERCULES_OIDC_REDIRECT_URI as string | undefined;
  const redirectUri = envRedirectUri ? envRedirectUri : defaultRedirectUri;

  const maskedClientId = clientId ? clientId.replace(/.(?=.{4})/g, "*") : undefined;
  console.debug("HerculesAuthProvider init", {
    authority,
    clientId: maskedClientId,
    envRedirectUri,
    redirectUri,
    defaultRedirectUri,
  });

  return (
    <HerculesAuthProvider
      authority={authority}
      client_id={clientId}
      userManagerSettings={{
        prompt: (import.meta.env.VITE_HERCULES_OIDC_PROMPT as string) ?? "select_account",
        response_type:
          (import.meta.env.VITE_HERCULES_OIDC_RESPONSE_TYPE as string) ?? "code",
        scope:
          (import.meta.env.VITE_HERCULES_OIDC_SCOPE as string) ??
          "openid profile email offline_access",
        redirect_uri: redirectUri,
      }}
    >
      {children}
    </HerculesAuthProvider>
  );
}
