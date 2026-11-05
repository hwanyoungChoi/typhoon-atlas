import { headers } from "next/headers";

import type { Storm, StormYear } from "./storms";
import type { TrackLine } from "../components/TrackMap";

/**
 * Full best-track fixes stay in `public/data` — 16MB of them — rather than in
 * the worker bundle. Archive pages read one year per request. Static assets
 * are matched ahead of the worker, so requesting our own origin returns the
 * file without re-entering this handler.
 */
export async function loadYear(year: number): Promise<StormYear | null> {
  try {
    const host = (await headers()).get("host");
    if (!host) return null;
    const protocol = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host) ? "http" : "https";
    const response = await fetch(`${protocol}://${host}/data/years/${year}.json`);
    if (!response.ok) return null;
    return (await response.json()) as StormYear;
  } catch {
    return null;
  }
}

export async function loadStormTrack(year: number, id: string): Promise<Storm | null> {
  return (await loadYear(year))?.storms.find((storm) => storm.id === id) ?? null;
}

/** The observed part of a track, trimmed to what the still maps draw. */
export function toTrackLine(storm: Storm): TrackLine {
  return {
    id: storm.id,
    points: storm.track
      .filter((point) => point.kind !== "forecast")
      .map((point) => [point.lng, point.lat, point.wind]),
  };
}
