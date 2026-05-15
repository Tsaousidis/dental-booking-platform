import { brand } from "./brand";

export const site = {
  name: brand.clinicName,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supportedLocales: ["el", "en"],
};
