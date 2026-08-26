import type { Metadata } from "next";
import Link from "next/link";

import { allStorms, formatDate, intensityClass, intensityLabel, knotToMs, stormPath, stormTitle, subName } from "../../data/seo-index";

export const metadata: Metadata = {
  title: "한반도에 접근한 역대 태풍 목록",
  description: "한반도 300km 이내로 들어온 역대 태풍을 접근 거리 순으로 정리했습니다. 매미, 루사, 볼라벤, 힌남노를 비롯해 연도별 한반도 접근 태풍의 최저 중심기압과 최대 풍속을 확인하세요.",
  alternates: { canonical: "/korea" },
};

const NEAR = 300;

export default function KoreaPage() {
  const approached = allStorms.filter((storm) => storm.kr !== null && storm.kr <= NEAR);
  const closest = [...approached].sort((a, b) => (a.kr ?? 0) - (b.kr ?? 0));
  const strongest = [...approached].filter((storm) => storm.pp).sort((a, b) => (a.pp ?? 9999) - (b.pp ?? 9999)).slice(0, 20);
  const byDecade = new Map<number, number>();
  for (const storm of approached) byDecade.set(Math.floor(storm.y / 10) * 10, (byDecade.get(Math.floor(storm.y / 10) * 10) ?? 0) + 1);
  const decades = [...byDecade.entries()].filter(([decade]) => decade >= 1950).sort((a, b) => a[0] - b[0]);
  const byMonth = new Map<number, number>();
  for (const storm of approached) if (storm.kt) byMonth.set(Number(storm.kt.slice(5, 7)), (byMonth.get(Number(storm.kt.slice(5, 7))) ?? 0) + 1);
  const months = [...byMonth.entries()].sort((a, b) => a[0] - b[0]);
  const peakMonth = [...months].sort((a, b) => b[1] - a[1])[0];

  return (
    <main className="doc-main">
      <article className="doc-body">
        <h1>한반도에 접근한 역대 태풍</h1>
        <p className="lede">베스트트랙에 기록된 중심 위치가 한반도 주요 지점에서 {NEAR}km 이내로 들어온 태풍은 모두 {approached.length}개입니다. 접근 거리는 관측된 중심 위치와 한반도 해안 기준점 사이의 최단 거리로, 상륙 여부나 피해 규모를 판정한 값이 아닙니다. 실제 영향은 태풍의 크기, 이동 속도, 진행 방향에 따라 크게 달라집니다.</p>

        <section>
          <h2>가장 가깝게 지난 태풍 40개</h2>
          <p>중심이 한반도에 가장 가까이 들어온 순서입니다. 상위권은 대부분 실제로 한반도에 상륙했거나 해안을 스치듯 지나간 태풍입니다.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>순위</th><th>태풍</th><th>최근접</th><th>최저 기압</th><th>최대 풍속</th><th>시기</th></tr></thead>
              <tbody>
                {closest.slice(0, 40).map((storm, rank) => (
                  <tr key={storm.id}>
                    <td>{rank + 1}</td>
                    <td><Link href={stormPath(storm)}>{storm.y}년 {stormTitle(storm)}</Link><small>{subName(storm)}</small></td>
                    <td>약 {storm.kr} km</td>
                    <td>{storm.pp ? `${storm.pp} hPa` : "—"}</td>
                    <td><span className={`chip ${intensityClass(storm.pw)}`}>{storm.pw ? `${storm.pw} kt` : "—"}</span><small>{storm.pw ? `${knotToMs(storm.pw)} m/s` : ""}</small></td>
                    <td>{formatDate(storm.s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>한반도 접근 태풍 중 가장 강했던 20개</h2>
          <p>접근 시점의 강도가 아니라 태풍 일생 전체의 최저 중심기압 기준입니다. 중심기압이 낮을수록 태풍이 발달한 정도가 큽니다.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>순위</th><th>태풍</th><th>최저 기압</th><th>강도</th><th>최근접</th></tr></thead>
              <tbody>
                {strongest.map((storm, rank) => (
                  <tr key={storm.id}>
                    <td>{rank + 1}</td>
                    <td><Link href={stormPath(storm)}>{storm.y}년 {stormTitle(storm)}</Link></td>
                    <td>{storm.pp} hPa</td>
                    <td><span className={`chip ${intensityClass(storm.pw)}`}>{intensityLabel(storm.pw)}</span></td>
                    <td>약 {storm.kr} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>언제 가장 많이 오나</h2>
          <p>한반도 {NEAR}km 이내 접근 시점을 월별로 세면 {peakMonth ? `${peakMonth[0]}월이 ${peakMonth[1]}회로 가장 많습니다` : "여름과 초가을에 몰립니다"}. 북태평양고기압이 물러나면서 태풍 진로가 한반도 쪽으로 휘는 시기와 겹칩니다.</p>
          <ul className="stat-bars">
            {months.map(([month, count]) => (
              <li key={month}>
                <span>{month}월</span>
                <b style={{ width: `${Math.round((count / (peakMonth?.[1] ?? count)) * 100)}%` }} />
                <em>{count}회</em>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>연대별 접근 횟수</h2>
          <p>1951년 이후 북서태평양 베스트트랙이 정비되면서 기록이 일정해졌습니다. 그 이전 수치는 관측 체계가 달라 그대로 비교하기 어렵습니다.</p>
          <ul className="stat-bars">
            {decades.map(([decade, count]) => (
              <li key={decade}>
                <span>{decade}년대</span>
                <b style={{ width: `${Math.round((count / Math.max(...decades.map((item) => item[1]))) * 100)}%` }} />
                <em>{count}회</em>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>이 수치를 어떻게 읽어야 하나</h2>
          <p>접근 거리는 태풍 중심의 위치만 본 값입니다. 강풍 반경이 400km를 넘는 대형 태풍이라면 중심이 300km 밖을 지나도 전국이 영향권에 들 수 있고, 반대로 중심이 가까이 지나도 세력이 약해진 뒤라면 피해가 작을 수 있습니다. 실제 대비는 기상청이 발표하는 태풍 정보와 특보를 기준으로 하세요.</p>
          <p><Link href="/guide">태풍 강도와 크기 기준 알아보기 →</Link></p>
        </section>
      </article>
    </main>
  );
}
