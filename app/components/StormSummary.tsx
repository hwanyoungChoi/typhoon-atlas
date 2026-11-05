import { intensityLabel, knotToMs } from "../data/intensity";
import { displayStormName } from "../data/typhoon-names-ko";

import type { Storm } from "../data/storms";

const JMA_TYPHOON_PAGE = "https://www.jma.go.jp/bosai/map.html#contents=typhoon";
const KMA_TYPHOON_PAGE = "https://www.weather.go.kr/w/typhoon/typ-korea.do";

/**
 * The selected storm at a glance, with where its track comes from. For a
 * storm in progress this carries the agency's issue time and points to the
 * official bulletins, so the map never reads as a warning of its own.
 */
export function StormSummary({ storm }: { storm: Storm }) {
  const name = displayStormName(storm);
  const isActive = storm.status === "active";

  return (
    <section className="storm-summary" aria-label="선택한 태풍 요약">
      <h2>
        {storm.number} {name}
        {name !== storm.name && <small>{storm.name}</small>}
      </h2>
      {isActive ? (
        <p className="storm-issued">
          일본 기상청 발표 <time dateTime={storm.issuedAt}>{formatIssued(storm.issuedAt)}</time>
        </p>
      ) : (
        <p className="storm-dates">{formatDates(storm.dates)}</p>
      )}
      {!isActive && (
        <dl className="storm-figures">
          <div>
            <dt>최대 풍속</dt>
            <dd>
              {storm.peakWind ? (
                <>
                  {storm.peakWind}
                  <span> kt</span>
                </>
              ) : (
                "—"
              )}
            </dd>
            <dd className="storm-figure-note">
              {storm.peakWind
                ? `${knotToMs(storm.peakWind)} m/s · ${intensityLabel(storm.peakWind)}`
                : "기록 없음"}
            </dd>
          </div>
          <div>
            <dt>최저 기압</dt>
            <dd>
              {storm.peakPressure ? (
                <>
                  {storm.peakPressure}
                  <span> hPa</span>
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      )}
      <p className="storm-source">
        {sourceLine(storm)}
        {isActive && (
          <>
            {" "}
            공식 정보는{" "}
            <a href={JMA_TYPHOON_PAGE} target="_blank" rel="noreferrer">
              일본 기상청
            </a>
            ·
            <a href={KMA_TYPHOON_PAGE} target="_blank" rel="noreferrer">
              한국 기상청
            </a>
            에서 확인하세요.
          </>
        )}
      </p>
    </section>
  );
}

function sourceLine(storm: Storm) {
  if (storm.status === "active") return "실선은 분석 경로, 점선은 예보입니다.";
  if (storm.status === "provisional") return "일본 기상청 잠정 위치표 · 확정 전 경로";
  if (storm.basin === "WP") return "일본 기상청 RSMC Tokyo 베스트트랙 · 사후 확정 경로";
  return "미국 NOAA NHC 베스트트랙 · 사후 확정 경로";
}

/** "2019-12-19 — 2019-12-29" → "2019.12.19 – 12.29" */
function formatDates(dates: string) {
  const [start, end] = dates.split(" — ");
  if (!start) return dates;
  const startText = start.replaceAll("-", ".");
  if (!end || end === start) return startText;
  const sameYear = end.slice(0, 4) === start.slice(0, 4);
  return `${startText} – ${sameYear ? end.slice(5).replace("-", ".") : end.replaceAll("-", ".")}`;
}

function formatIssued(issuedAt?: string) {
  if (!issuedAt) return "시각 미상";
  const time = new Date(issuedAt);
  if (Number.isNaN(time.getTime())) return issuedAt;
  const text = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(time);
  return `${text} (한국시간)`;
}
