/**
 * JMA intensity classes, expressed in the 10-minute mean wind the best track
 * carries. Kept free of the storm index so client components can use it.
 */
export const intensityScale = [
  { cls: "depression", label: "열대저압부", range: "34kt 미만", color: "#5fceff" },
  { cls: "storm", label: "열대폭풍", range: "34~47kt", color: "#43d6a3" },
  { cls: "severe", label: "강한 열대폭풍", range: "48~63kt", color: "#ffd166" },
  { cls: "typhoon", label: "태풍(중)", range: "64~84kt", color: "#ff9f43" },
  { cls: "very-strong", label: "매우 강한 태풍", range: "85~104kt", color: "#fb7185" },
  { cls: "violent", label: "맹렬한 태풍", range: "105kt 이상", color: "#c77dff" },
] as const;

const unknownColor = "#9aafba";
const lowerBounds = [0, 34, 48, 64, 85, 105];

function scaleEntry(wind: number | null) {
  if (wind === null) return null;
  let index = 0;
  while (index + 1 < lowerBounds.length && wind >= lowerBounds[index + 1]) index += 1;
  return intensityScale[index];
}

export function intensityLabel(wind: number | null) {
  return scaleEntry(wind)?.label ?? "기록 없음";
}

export function intensityClass(wind: number | null) {
  return scaleEntry(wind)?.cls ?? "unknown";
}

export function intensityColor(wind: number | null) {
  return scaleEntry(wind)?.color ?? unknownColor;
}

/** kt → m/s, the unit Korean forecasts use for maximum wind. */
export function knotToMs(wind: number | null) {
  return wind === null ? null : Math.round(wind * 0.514444);
}
