import type { Metadata } from "next";

import { allStorms, stormPath, stormTitle, yearSummaries } from "../../data/seo-index";

export const metadata: Metadata = {
  title: "연도별 태풍 경로 아카이브 (1951~)",
  description: "1951년부터 올해까지 발생한 태풍의 연도별 목록과 경로 기록입니다. 북서태평양 태풍, 북대서양·북동태평양 허리케인의 발생 수, 최대 풍속, 최저 중심기압을 연도별로 정리했습니다.",
  alternates: { canonical: "/typhoon" },
};

const decadeStart = (year: number) => Math.floor(year / 10) * 10;

export default function TyphoonArchivePage() {
  const decades = new Map<number, typeof yearSummaries>();
  for (const summary of yearSummaries) decades.set(decadeStart(summary.year), [...(decades.get(decadeStart(summary.year)) ?? []), summary]);
  const recent = allStorms.filter((storm) => storm.b === "WP" && storm.kr !== null && storm.kr <= 200 && storm.y >= 2000).slice(0, 12);
  const totalStorms = allStorms.length;
  const koreaCount = allStorms.filter((storm) => storm.kr !== null && storm.kr <= 300).length;

  return (
    <main className="doc-main">
      <article className="doc-body">
        <h1>연도별 태풍 경로 아카이브</h1>
        <p className="lede">1951년 이후 북서태평양에서 발생한 태풍 전부와, 1851년까지 거슬러 올라가는 북대서양·북동태평양 허리케인의 확정 경로를 연도별로 모았습니다. 지금까지 {totalStorms.toLocaleString()}개 열대저기압을 담고 있고, 그중 {koreaCount.toLocaleString()}개가 한반도 300km 이내로 접근했습니다.</p>

        <section>
          <h2>연도 선택</h2>
          <p>연도를 고르면 그 해에 발생한 태풍 목록과 각 태풍의 발생·최성기·소멸 기록을 볼 수 있습니다. 태풍 하나를 고르면 6시간 간격 관측 경로 전체가 표로 나옵니다.</p>
          {[...decades.entries()].sort((a, b) => b[0] - a[0]).map(([decade, summaries]) => (
            <div className="decade" key={decade}>
              <h3>{decade}년대</h3>
              <ul className="year-grid">
                {summaries.sort((a, b) => b.year - a.year).map((summary) => (
                  <li key={summary.year}>
                    <a href={`/typhoon/${summary.year}`}>
                      <b>{summary.year}년</b>
                      <span>{summary.WP > 0 ? `태풍 ${summary.WP}개` : `허리케인 ${summary.NA + summary.EP}개`}</span>
                      {summary.korea > 0 && <em>한반도 접근 {summary.korea}</em>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2>2000년 이후 한반도를 가장 가깝게 지난 태풍</h2>
          <p>베스트트랙 중심 위치가 한반도 해안선 기준 200km 이내까지 들어온 태풍입니다. 접근 거리는 관측된 중심 위치와 한반도 주요 지점 사이의 최단 거리로, 상륙 여부를 판정한 값은 아닙니다.</p>
          <ul className="link-list">
            {recent.map((storm) => (
              <li key={storm.id}>
                <a href={stormPath(storm)}>
                  <b>{storm.y}년 {stormTitle(storm)}</b>
                  <span>최근접 약 {storm.kr}km · 최저 {storm.pp ? `${storm.pp}hPa` : "기록 없음"}</span>
                </a>
              </li>
            ))}
          </ul>
          <p><a href="/korea">한반도에 접근한 역대 태풍 전체 보기 →</a></p>
        </section>
      </article>
    </main>
  );
}
