import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  basinNames, basinTerms, formatDate, intensityClass, intensityLabel, knotToMs,
  stormPath, stormTitle, stormsOfYear, subName, yearSummaries,
} from "../../../data/seo-index";

type Params = { params: Promise<{ year: string }> };

export function generateStaticParams() {
  return yearSummaries.slice(0, 30).map((summary) => ({ year: String(summary.year) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const year = Number((await params).year);
  const storms = stormsOfYear(year);
  if (!storms.length) return {};
  const typhoons = storms.filter((storm) => storm.b === "WP");
  const korea = storms.filter((storm) => storm.kr !== null && storm.kr <= 300);
  const title = typhoons.length
    ? `${year}년 태풍 경로 목록 — 태풍 ${typhoons.length}개 기록`
    : `${year}년 허리케인 경로 목록 — ${storms.length}개 기록`;
  return {
    title: `${title}`,
    description: `${year}년에 발생한 열대저기압 ${storms.length}개의 경로 기록입니다.${typhoons.length ? ` 북서태평양 태풍 ${typhoons.length}개` : ""}${korea.length ? `, 그중 ${korea.length}개가 한반도 300km 이내로 접근했습니다.` : "."} 발생일, 최대 풍속, 최저 중심기압을 표로 정리했습니다.`,
    alternates: { canonical: `/typhoon/${year}` },
  };
}

export default async function YearPage({ params }: Params) {
  const year = Number((await params).year);
  const storms = stormsOfYear(year);
  if (!Number.isInteger(year) || !storms.length) notFound();

  const summary = yearSummaries.find((item) => item.year === year);
  const years = yearSummaries.map((item) => item.year);
  const previous = years.find((item) => item < year);
  const next = [...years].reverse().find((item) => item > year);
  const korea = storms.filter((storm) => storm.kr !== null && storm.kr <= 300).sort((a, b) => (a.kr ?? 0) - (b.kr ?? 0));
  const strongest = [...storms].filter((storm) => storm.pp).sort((a, b) => (a.pp ?? 9999) - (b.pp ?? 9999))[0];
  const basins = (["WP", "EP", "NA"] as const).filter((basin) => storms.some((storm) => storm.b === basin));

  return (
    <main className="doc-main">
      <article className="doc-body">
        <nav className="crumbs"><Link href="/typhoon">연도별 태풍</Link> <span>/</span> {year}년</nav>
        <h1>{year}년 태풍 경로 기록</h1>
        <p className="lede">
          {year}년에는 전 세계에서 열대저기압 {storms.length}개가 관측됐습니다.
          {summary?.WP ? ` 북서태평양에서 발생한 태풍은 ${summary.WP}개입니다.` : ""}
          {korea.length ? ` 이 가운데 ${korea.length}개가 한반도 300km 이내를 지났고, 가장 가까이 접근한 것은 ${stormTitle(korea[0])}(약 ${korea[0].kr}km)입니다.` : " 한반도 300km 이내로 접근한 태풍은 없었습니다."}
          {strongest ? ` 그해 가장 강했던 것은 중심기압 ${strongest.pp}hPa까지 발달한 ${stormTitle(strongest)}입니다.` : ""}
        </p>

        <p className="year-jump">
          {previous && <Link href={`/typhoon/${previous}`}>← {previous}년</Link>}
          <Link href="/typhoon">전체 연도</Link>
          {next && <Link href={`/typhoon/${next}`}>{next}년 →</Link>}
        </p>

        {basins.map((basin) => {
          const list = storms.filter((storm) => storm.b === basin);
          return (
            <section key={basin}>
              <h2>{basinNames[basin]} {basinTerms[basin]} {list.length}개</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>번호·이름</th><th>기간</th><th>최대 풍속</th><th>최저 기압</th><th>한반도 최근접</th></tr>
                  </thead>
                  <tbody>
                    {list.map((storm) => (
                      <tr key={storm.id}>
                        <td><Link href={stormPath(storm)}>{stormTitle(storm)}</Link><small>{subName(storm)}</small></td>
                        <td>{formatDate(storm.s)}<small>{storm.e && storm.e !== storm.s ? `~ ${formatDate(storm.e)}` : ""}</small></td>
                        <td><span className={`chip ${intensityClass(storm.pw)}`}>{storm.pw ? `${storm.pw} kt` : "—"}</span><small>{storm.pw ? `${knotToMs(storm.pw)} m/s · ${intensityLabel(storm.pw)}` : "기록 없음"}</small></td>
                        <td>{storm.pp ? `${storm.pp} hPa` : "—"}</td>
                        <td>{storm.kr !== null && storm.kr <= 1500 ? `약 ${storm.kr} km` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        <section>
          <h2>표를 읽는 법</h2>
          <p>최대 풍속은 베스트트랙에 기록된 값입니다. 북서태평양은 일본 기상청 기준 10분 평균 풍속, 북대서양·북동태평양은 미국 기준 1분 평균 풍속이라 같은 숫자라도 해역 사이 직접 비교는 어렵습니다. 한반도 최근접은 관측된 중심 위치와 한반도 주요 지점 사이의 최단 거리이며, 상륙 여부나 피해 규모를 뜻하지 않습니다.</p>
          <p><Link href="/guide">태풍 등급과 단위 자세히 보기 →</Link></p>
        </section>
      </article>
    </main>
  );
}
