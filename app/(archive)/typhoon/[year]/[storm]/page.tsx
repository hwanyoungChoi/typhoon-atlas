import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  allStorms, basinNames, basinTerms, coordinate, durationDays, findStorm, formatDate, formatTime,
  intensityClass, intensityLabel, isIndexable, knotToMs, stormPath, stormSlug, stormTitle, stormsOfYear,
  type IndexedStorm, type Snapshot,
} from "../../../../data/seo-index";
import { loadStormTrack } from "../../../../data/track-source";
import { displayStormName } from "../../../../data/typhoon-names-ko";

type Params = { params: Promise<{ year: string; storm: string }> };

export function generateStaticParams() {
  return allStorms
    .filter((storm) => storm.b === "WP" && storm.y >= new Date().getFullYear() - 3 && isIndexable(storm))
    .map((storm) => ({ year: String(storm.y), storm: stormSlug(storm) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year, storm: slug } = await params;
  const storm = findStorm(Number(year), slug);
  if (!storm) return {};
  const name = stormTitle(storm);
  const term = basinTerms[storm.b];
  return {
    title: `${storm.y}년 ${name} 경로 — ${term} 이동 기록`,
    description: `${storm.y}년 ${name}(${storm.n})의 이동 경로 기록입니다. ${formatDate(storm.s)} 발생, 최저 중심기압 ${storm.pp ? `${storm.pp}hPa` : "미기록"}, 최대 풍속 ${storm.pw ? `${storm.pw}kt` : "미기록"}. ${storm.kr !== null && storm.kr <= 500 ? `한반도에 약 ${storm.kr}km까지 접근했습니다.` : "관측 지점별 위치와 강도를 표로 제공합니다."}`,
    alternates: { canonical: stormPath(storm) },
    robots: isIndexable(storm) ? undefined : { index: false, follow: true },
  };
}

export default async function StormPage({ params }: Params) {
  const { year, storm: slug } = await params;
  const storm = findStorm(Number(year), slug);
  if (!storm) notFound();

  const detail = await loadStormTrack(storm.y, storm.id);
  const track = detail?.track.filter((point) => point.kind !== "forecast") ?? [];
  const days = durationDays(storm);
  const siblings = stormsOfYear(storm.y).filter((item) => item.b === storm.b);
  const position = siblings.findIndex((item) => item.id === storm.id);
  const term = basinTerms[storm.b];
  const koreanName = displayStormName({ basin: storm.b, name: storm.n });

  return (
    <main className="doc-main">
      <article className="doc-body">
        <nav className="crumbs">
          <Link href="/typhoon">연도별 태풍</Link> <span>/</span> <Link href={`/typhoon/${storm.y}`}>{storm.y}년</Link> <span>/</span> {stormTitle(storm)}
        </nav>

        <h1>{storm.y}년 {stormTitle(storm)} 경로</h1>
        <p className="lede">
          {storm.y}년 {basinNames[storm.b]}에서 발생한 {term}입니다.
          {storm.n !== "UNNAMED" && ` 국제명은 ${storm.n}${storm.b === "WP" && koreanName !== storm.n ? `, 우리말 표기는 ${koreanName}` : ""}입니다.`}
          {storm.g && ` ${formatDate(storm.s)} ${coordinate(storm.g[0], storm.g[1])} 부근에서 처음 관측됐고`}
          {days ? ` 약 ${days}일 동안 ${storm.c}회 관측 위치가 기록됐습니다.` : ` ${storm.c}회 관측 위치가 기록됐습니다.`}
          {storm.kr !== null && storm.kr <= 500 && ` 한반도에는 최소 약 ${storm.kr}km까지 접근했습니다.`}
        </p>

        <dl className="facts">
          <div><dt>최저 중심기압</dt><dd>{storm.pp ? `${storm.pp} hPa` : "기록 없음"}</dd></div>
          <div><dt>최대 풍속</dt><dd>{storm.pw ? `${storm.pw} kt` : "기록 없음"}<small>{storm.pw ? `${knotToMs(storm.pw)} m/s · ${intensityLabel(storm.pw)}` : ""}</small></dd></div>
          <div><dt>활동 기간</dt><dd>{formatDate(storm.s)}<small>{storm.e && storm.e !== storm.s ? `~ ${formatDate(storm.e)}` : ""}</small></dd></div>
          <div><dt>한반도 최근접</dt><dd>{storm.kr !== null && storm.kr <= 3000 ? `약 ${storm.kr} km` : "먼 해상"}<small>{storm.kt ? formatTime(storm.kt) : ""}</small></dd></div>
        </dl>

        <section>
          <h2>경로 요약</h2>
          <div className="phases">
            <Phase label="발생" snapshot={storm.g} />
            <Phase label="최성기" snapshot={storm.p} />
            <Phase label="마지막 관측" snapshot={storm.d} />
          </div>
          <p>발생부터 소멸까지의 중심 위치는 각국 기상기관이 사후 재분석해 확정한 베스트트랙 값입니다. 실시간 발표 당시의 위치와는 다를 수 있습니다.</p>
          <p><Link href={`/?year=${storm.y}&storm=${storm.id}`}>지도에서 이 {term} 경로 보기 →</Link></p>
        </section>

        {track.length > 0 && (
          <section>
            <h2>관측 경로 전체 기록</h2>
            <p>6시간 간격으로 기록된 중심 위치, 중심기압, 최대 풍속입니다. 시각은 세계표준시(UTC)이며 한국 시간은 여기에 9시간을 더한 값입니다.</p>
            <div className="table-scroll">
              <table>
                <thead><tr><th>관측 시각 (UTC)</th><th>중심 위치</th><th>중심기압</th><th>최대 풍속</th><th>강도</th></tr></thead>
                <tbody>
                  {track.map((point, pointIndex) => (
                    <tr key={`${point.time}-${pointIndex}`}>
                      <td>{formatTime(point.time)}</td>
                      <td>{coordinate(point.lat, point.lng)}</td>
                      <td>{point.pressure ? `${point.pressure} hPa` : "—"}</td>
                      <td>{point.wind ? `${point.wind} kt` : "—"}<small>{point.wind ? `${knotToMs(point.wind)} m/s` : ""}</small></td>
                      <td><span className={`chip ${intensityClass(point.wind)}`}>{intensityLabel(point.wind)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section>
          <h2>{storm.y}년 같은 해 {term}</h2>
          <ul className="link-list compact">
            {siblings.map((item) => (
              <li key={item.id} className={item.id === storm.id ? "current" : ""}>
                <Link href={stormPath(item)}><b>{stormTitle(item)}</b><span>{item.pp ? `${item.pp} hPa` : "기압 기록 없음"}</span></Link>
              </li>
            ))}
          </ul>
          {position >= 0 && <p>{storm.y}년 {basinNames[storm.b]}에서는 모두 {siblings.length}개가 관측됐습니다. <Link href={`/typhoon/${storm.y}`}>{storm.y}년 전체 목록 →</Link></p>}
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(storm)) }}
        />
      </article>
    </main>
  );
}

function Phase({ label, snapshot }: { label: string; snapshot: Snapshot | null }) {
  if (!snapshot) return null;
  const [lat, lng, wind, pressure, time] = snapshot;
  return (
    <div className="phase">
      <span>{label}</span>
      <b>{coordinate(lat, lng)}</b>
      <small>{formatTime(time)}</small>
      <small>{pressure ? `${pressure} hPa` : "기압 기록 없음"}{wind ? ` · ${wind} kt` : ""}</small>
    </div>
  );
}

function structuredData(storm: IndexedStorm) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${storm.y}년 ${stormTitle(storm)} 경로 기록`,
    description: `${storm.y}년 ${basinNames[storm.b]} ${basinTerms[storm.b]} ${storm.n}의 베스트트랙 경로 기록`,
    url: `https://typhoon.conychoi.dev${stormPath(storm)}`,
    inLanguage: "ko-KR",
    temporalCoverage: storm.s && storm.e ? `${storm.s}/${storm.e}` : String(storm.y),
    creator: { "@type": "Organization", name: storm.b === "WP" ? "Japan Meteorological Agency RSMC Tokyo" : "NOAA National Hurricane Center" },
    license: "https://www.jma.go.jp/jma/en/copyright.html",
  };
}
