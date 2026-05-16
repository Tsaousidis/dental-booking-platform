import type { MetadataRoute } from "next";

import { locales } from "@/config/locales";
import { absoluteUrl, localizedPath, publicSeoPaths } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    publicSeoPaths.map((path) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      lastModified: new Date(),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/booking" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((availableLocale) => [
            availableLocale,
            absoluteUrl(localizedPath(availableLocale, path)),
          ]),
        ),
      },
    })),
  );
}
