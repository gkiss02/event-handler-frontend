import i18n from "./index";

export function translateErrorMessage(message: unknown): string {
  if (typeof message === "string" && i18n.exists(`errors:${message}`)) {
    return i18n.t(`errors:${message}`);
  }
  return i18n.t("errors:fallback");
}
