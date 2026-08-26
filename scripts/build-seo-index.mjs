/**
 * Builds the lightweight index that server-rendered pages use for storm
 * listings, rankings and Korean-peninsula filters. Full tracks stay in
 * `public/data/years/*.json` and are fetched per request on detail pages.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const source = new URL("../public/data/years/", import.meta.url);
const output = new URL("../app/data/generated/", import.meta.url);

// Coastal reference points around the Korean peninsula. A storm's minimum
// distance to this set is what we call its approach distance — never
// "landfall", which needs a land mask we do not carry.
const koreaPoints = [
  [37.57, 126.98], [35.18, 129.08], [33.5, 126.53], [34.79, 126.39], [37.75, 128.9],
  [36.35, 127.38], [35.16, 126.85], [38.32, 128.5], [34.75, 127.66], [36.02, 129.37],
  [37.46, 126.7], [35.87, 128.6], [39.03, 125.75], [38.0, 127.06], [34.6, 125.45],
];

const files = readdirSync(source).filter((file) => /^\d{4}\.json$/.test(file));
const storms = [];
const years = new Map();

for (const file of files) {
  const data = JSON.parse(readFileSync(new URL(file, source), "utf8"));
  for (const storm of data.storms) {
    const entry = summarize(storm);
    storms.push(entry);
    const year = years.get(storm.year) ?? { year: storm.year, WP: 0, EP: 0, NA: 0, korea: 0 };
    year[storm.basin] += 1;
    if (entry.kr !== null && entry.kr <= 400) year.korea += 1;
    years.set(storm.year, year);
  }
}

storms.sort((a, b) => b.y - a.y || stormNumber(b) - stormNumber(a));
const yearList = [...years.values()].sort((a, b) => b.year - a.year);

writeFileSync(new URL("storm-index.json", output), JSON.stringify({
  builtAt: new Date().toISOString().slice(0, 10),
  years: yearList,
  storms,
}));
console.log(`Indexed ${storms.length} storms across ${yearList.length} years.`);

function summarize(storm) {
  const track = storm.track.filter((point) => point.kind !== "forecast");
  const points = track.length ? track : storm.track;
  const peak = points.reduce((best, point) => compareIntensity(point, best) > 0 ? point : best, points[0]);
  const distances = points.map(koreaDistance);
  const nearestIndex = distances.reduce((best, value, index) => value < distances[best] ? index : best, 0);
  const [start, end] = String(storm.dates).split(" — ");
  return {
    id: storm.id,
    y: storm.year,
    b: storm.basin,
    no: storm.number,
    n: storm.name,
    pw: storm.peakWind,
    pp: storm.peakPressure,
    s: start ?? null,
    e: end ?? start ?? null,
    c: points.length,
    // Genesis, peak and dissipation positions carry the route summary that
    // detail pages describe in prose without loading the full track.
    g: round(points[0]),
    p: round(peak),
    d: round(points.at(-1)),
    kr: distances.length ? Math.round(Math.min(...distances)) : null,
    kt: distances.length ? points[nearestIndex].time : null,
  };
}

function compareIntensity(point, best) {
  if (!best) return 1;
  if ((point.wind ?? 0) !== (best.wind ?? 0)) return (point.wind ?? 0) - (best.wind ?? 0);
  return (best.pressure ?? 9999) - (point.pressure ?? 9999);
}

function round(point) {
  return point ? [Math.round(point.lat * 10) / 10, Math.round(point.lng * 10) / 10, point.wind ?? null, point.pressure ?? null, point.time] : null;
}

function koreaDistance(point) {
  return Math.min(...koreaPoints.map(([lat, lng]) => haversine(point.lat, point.lng, lat, lng)));
}

function haversine(lat1, lng1, lat2, lng2) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function stormNumber(storm) {
  return Number(String(storm.no).replace(/\D/g, "")) || 0;
}
