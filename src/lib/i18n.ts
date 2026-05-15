import "server-only";

import { Locale } from "@/config/locales";

const dictionaries = {
  el: () => import("@/messages/el.json").then((module) => module.default),
  en: () => import("@/messages/en.json").then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
