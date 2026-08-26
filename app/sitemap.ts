import type { MetadataRoute } from "next";

import { allStorms, isIndexable, stormPath, yearSummaries } from "./data/seo-index";

const site = "https://typhoon.conychoi.dev";
const currentYear = new Date().getFullYear();

/**
 * Storm pages only enter the sitemap when they carry enough of a record to be
 * worth a visit: a name people search for, or hurricane-strength winds.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${site}/typhoon`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/korea`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site}/ranking`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/names`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/guide`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const summary of yearSummaries) {
    pages.push({
      url: `${site}/typhoon/${summary.year}`,
      changeFrequency: summary.year === currentYear ? "daily" : "yearly",
      priority: summary.year >= currentYear - 5 ? 0.8 : 0.6,
    });
  }

  for (const storm of allStorms) {
    if (!isIndexable(storm)) continue;
    if (storm.b !== "WP" && (storm.pw ?? 0) < 64) continue;
    pages.push({
      url: `${site}${stormPath(storm)}`,
      changeFrequency: storm.y === currentYear ? "daily" : "yearly",
      priority: storm.y >= currentYear - 3 ? 0.7 : 0.5,
    });
  }

  return pages;
}
