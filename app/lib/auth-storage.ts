import type { CookieRef } from "nuxt/app";

const COOKIE_NAME = "better-auth-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type CookieData = Record<string, string>;

/**
 * Creates a cookie-only storage adapter for Better Auth's crossDomainClient.
 * Must be called within a Nuxt context (plugin, composable, or component).
 */
export function createAuthStorage() {
  const cookie = useCookie<CookieData | null>(COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  }) as CookieRef<CookieData | null>;

  return {
    getItem(key: string): string | null {
      return cookie.value?.[key] ?? null;
    },
    setItem(key: string, value: string): void {
      const existing = cookie.value ?? {};
      cookie.value = { ...existing, [key]: value };
    },
    removeItem(key: string): void {
      if (cookie.value) {
        const { [key]: _, ...rest } = cookie.value;
        cookie.value = Object.keys(rest).length > 0 ? rest : null;
      }
    },
  };
}

/**
 * Reads the `better-auth_cookie` entry from the Nuxt cookie, parses the JSON,
 * filters out expired entries, and returns a `name=value; ...` header string
 * suitable for the `Better-Auth-Cookie` request header.
 */
export function getCookieHeader(): string {
  const cookie = useCookie<CookieData | null>(COOKIE_NAME, {
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });

  const raw = cookie.value?.["better-auth_cookie"];
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw) as Record<
      string,
      { value: string; expires: string | null }
    >;
    return Object.entries(parsed)
      .filter(([_, c]) => !c.expires || new Date(c.expires) > new Date())
      .map(([name, c]) => `${name}=${c.value}`)
      .join("; ");
  } catch {
    return "";
  }
}
