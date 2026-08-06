export function safeReturnUrl(value: string | null) {
  return value?.startsWith("/manage") && !value.startsWith("//")
    ? value
    : "/manage";
}
export const SESSION_COOKIE = "portfolio_session";
