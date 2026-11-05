import type { Storm, TrackPoint } from "./storms";

const JMA_TYPHOON_DATA = "https://www.jma.go.jp/bosai/typhoon/data";

type TargetCyclone = {
  tropicalCyclone: string;
  typhoonNumber: string;
  category: string;
  issue: string;
};
type ForecastPart = {
  part: "title" | { jp: string; en: string };
  issue?: { JST: string; UTC: string };
  name?: { jp: string; en: string };
  advancedHours?: number;
  validtime?: { JST: string; UTC: string };
  center?: [number, number];
  track?: { preTyphoon?: [number, number][]; typhoon?: [number, number][] };
  galeWarningArea?: { center: [number, number]; radius: number };
  probabilityCircle?: { radius: number };
};

export async function fetchJmaLiveStorms(year: number): Promise<Storm[]> {
  const response = await fetch(`${JMA_TYPHOON_DATA}/targetTc.json`);
  if (!response.ok) throw new Error("JMA current cyclone list request failed");
  const targets = (await response.json()) as TargetCyclone[];
  const currentTargets = targets.filter(
    (target) => Number(`20${target.typhoonNumber.slice(0, 2)}`) === year,
  );

  const storms = await Promise.all(
    currentTargets.map(async (target) => {
      const forecastResponse = await fetch(
        `${JMA_TYPHOON_DATA}/${target.tropicalCyclone}/forecast.json`,
      );
      if (!forecastResponse.ok)
        throw new Error(`JMA forecast request failed: ${target.tropicalCyclone}`);
      return toStorm(target, (await forecastResponse.json()) as ForecastPart[], year);
    }),
  );
  return storms.sort(
    (a, b) => Number(a.number.replace(/\D/g, "")) - Number(b.number.replace(/\D/g, "")),
  );
}

function toStorm(target: TargetCyclone, parts: ForecastPart[], year: number): Storm {
  const title = parts.find((part) => part.part === "title");
  const analysis = parts.find((part) => typeof part.part !== "string" && part.advancedHours === 0);
  const coordinates = [...(analysis?.track?.preTyphoon ?? []), ...(analysis?.track?.typhoon ?? [])];
  const observed = coordinates.map(([lat, lng], index): TrackPoint => ({
    time:
      index === coordinates.length - 1 ? formatTime(analysis?.validtime?.UTC) : "기상청 분석 경로",
    lat,
    lng,
    wind: null,
    pressure: null,
    kind: "observed",
    ...(index === coordinates.length - 1 && analysis?.galeWarningArea
      ? {
          radiusKm: analysis.galeWarningArea.radius / 1000,
          radiusCenter: analysis.galeWarningArea.center,
          radiusType: "wind" as const,
        }
      : {}),
  }));
  const forecasts = parts
    .filter(
      (part) =>
        typeof part.part !== "string" &&
        (part.advancedHours ?? 0) > 0 &&
        part.center &&
        part.validtime,
    )
    .map((part): TrackPoint => ({
      time: formatTime(part.validtime?.UTC),
      lat: part.center![0],
      lng: part.center![1],
      wind: null,
      pressure: null,
      kind: "forecast",
      ...(part.probabilityCircle
        ? { radiusKm: part.probabilityCircle.radius / 1000, radiusType: "probability" as const }
        : {}),
    }));
  const track = [...dedupe(observed), ...forecasts];
  const number = Number(target.typhoonNumber.slice(2));
  return {
    id: `JMA-LIVE-${target.typhoonNumber}`,
    year,
    basin: "WP",
    regionalName: target.category === "TD" ? "열대저압부" : "태풍",
    number: `${number}호`,
    name: title?.name?.en?.toUpperCase() ?? target.typhoonNumber,
    status: "active",
    issuedAt: title?.issue?.JST ?? target.issue,
    peakWind: null,
    peakPressure: null,
    dates: `현재 경로 · ${formatTime(title?.issue?.UTC)}`,
    track,
  };
}

function dedupe(points: TrackPoint[]) {
  return points.filter(
    (point, index) =>
      index === 0 || point.lat !== points[index - 1].lat || point.lng !== points[index - 1].lng,
  );
}

function formatTime(value?: string) {
  if (!value) return "발표 시각 없음";
  return `${value.slice(0, 10)} ${value.slice(11, 16)} UTC`;
}
