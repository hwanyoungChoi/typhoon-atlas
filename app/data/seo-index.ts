import indexData from "./generated/storm-index.json";
import type { Basin } from "./storms";
import { displayStormName } from "./typhoon-names-ko";

/** Genesis / peak / dissipation snapshot: [lat, lng, wind, pressure, time]. */
export type Snapshot = [number, number, number | null, number | null, string];

export type IndexedStorm = {
  id: string;
  y: number;
  b: Exclude<Basin, "all">;
  no: string;
  n: string;
  pw: number | null;
  pp: number | null;
  s: string | null;
  e: string | null;
  c: number;
  g: Snapshot | null;
  p: Snapshot | null;
  d: Snapshot | null;
  /** Closest approach to the Korean peninsula in km, from the best-track positions. */
  kr: number | null;
  kt: string | null;
};

export type YearSummary = { year: number; WP: number; EP: number; NA: number; korea: number };

const index = indexData as unknown as { builtAt: string; years: YearSummary[]; storms: IndexedStorm[] };

export const builtAt = index.builtAt;
export const yearSummaries = index.years;
export const allStorms = index.storms;

const byYear = new Map<number, IndexedStorm[]>();
for (const storm of allStorms) byYear.set(storm.y, [...(byYear.get(storm.y) ?? []), storm]);

const bySlug = new Map<string, IndexedStorm>();
for (const storm of allStorms) bySlug.set(`${storm.y}/${stormSlug(storm)}`, storm);

export function stormsOfYear(year: number) {
  return byYear.get(year) ?? [];
}

export function findStorm(year: number, slug: string) {
  return bySlug.get(`${year}/${slug}`) ?? null;
}

/** `wp-11-hinnamnor`. The agency code keeps EP and CP numbering apart. */
export function stormSlug(storm: IndexedStorm) {
  const agency = /^[A-Z]{2}\d/.test(storm.id) ? storm.id.slice(0, 2).toLowerCase() : "wp";
  const number = String(storm.no).replace(/\D/g, "") || "0";
  const name = storm.n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unnamed";
  return `${agency}-${number}-${name}`;
}

export function stormPath(storm: IndexedStorm) {
  return `/typhoon/${storm.y}/${stormSlug(storm)}`;
}

export function stormTitle(storm: IndexedStorm) {
  const korean = displayStormName({ basin: storm.b, name: storm.n });
  return storm.n === "UNNAMED" ? `${storm.y}년 ${storm.no}` : `${storm.no} ${korean}`;
}

/** The international name, shown only when it differs from what we display. */
export function subName(storm: IndexedStorm) {
  if (storm.n === "UNNAMED") return "";
  return stormTitle(storm).endsWith(storm.n) ? "" : storm.n;
}

/**
 * Pages thin enough to hurt more than help stay out of the sitemap and carry
 * `noindex`: a handful of observation points and no name to search for.
 */
export function isIndexable(storm: IndexedStorm) {
  if (storm.c < 8) return false;
  if (storm.n !== "UNNAMED") return true;
  return (storm.pw ?? 0) >= 64;
}

export const basinNames: Record<Exclude<Basin, "all">, string> = {
  WP: "북서태평양",
  EP: "북동태평양",
  NA: "북대서양",
};

export const basinTerms: Record<Exclude<Basin, "all">, string> = {
  WP: "태풍",
  EP: "허리케인",
  NA: "허리케인",
};

/** JMA intensity classes, expressed in the 10-minute mean wind the best track carries. */
export function intensityLabel(wind: number | null) {
  if (wind === null) return "기록 없음";
  if (wind < 34) return "열대저압부";
  if (wind < 48) return "열대폭풍";
  if (wind < 64) return "강한 열대폭풍";
  if (wind < 85) return "태풍(중)";
  if (wind < 105) return "매우 강한 태풍";
  return "맹렬한 태풍";
}

export function intensityClass(wind: number | null) {
  if (wind === null) return "unknown";
  if (wind < 34) return "depression";
  if (wind < 48) return "storm";
  if (wind < 64) return "severe";
  if (wind < 85) return "typhoon";
  if (wind < 105) return "very-strong";
  return "violent";
}

/** kt → m/s, the unit Korean forecasts use for maximum wind. */
export function knotToMs(wind: number | null) {
  return wind === null ? null : Math.round(wind * 0.514444);
}

export function formatDate(value: string | null) {
  if (!value) return "기록 없음";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${year}년 ${Number(month)}월 ${Number(day)}일` : value;
}

export function formatTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]} ${match[4]}:${match[5]} UTC` : value;
}

export function coordinate(lat: number, lng: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns} ${Math.abs(lng).toFixed(1)}°${ew}`;
}

/** How long the storm was tracked, in days, from the first and last fix. */
export function durationDays(storm: IndexedStorm) {
  if (!storm.s || !storm.e) return null;
  const start = Date.parse(`${storm.s}T00:00:00Z`);
  const end = Date.parse(`${storm.e}T00:00:00Z`);
  return Number.isNaN(start) || Number.isNaN(end) ? null : Math.max(1, Math.round((end - start) / 86400000) + 1);
}
