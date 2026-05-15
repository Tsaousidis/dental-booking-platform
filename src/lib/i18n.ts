import "server-only";

import { Locale } from "@/config/locales";
import elMessages from "@/messages/el.json";

export type Dictionary = typeof elMessages;

const dictionaries = {
  el: () => import("@/messages/el.json").then((module) => module.default),
  en: () => import("@/messages/en.json").then((module) => module.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
