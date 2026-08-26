import { headers } from "next/headers";

import type { Storm, StormYear } from "./storms";

/**
 * Full best-track fixes stay in `public/data` — 16MB of them — rather than in
 * the worker bundle. Detail pages read one year per request. Static assets are
 * matched ahead of the worker, so requesting our own origin returns the file
 * without re-entering this handler.
 */
export async function loadStormTrack(year: number, id: string): Promise<Storm | null> {
  try {
    const host = (await headers()).get("host");
    if (!host) return null;
    const protocol = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(host) ? "http" : "https";
    const response = await fetch(`${protocol}://${host}/data/years/${year}.json`);
    if (!response.ok) return null;
    const data = (await response.json()) as StormYear;
    return data.storms.find((storm) => storm.id === id) ?? null;
  } catch {
    return null;
  }
}
