import type { Metadata } from "next";

import {
  allStorms, basinNames, basinTerms, formatDate, intensityClass, intensityLabel,
  knotToMs, stormPath, stormTitle, subName, type IndexedStorm,
} from "../../data/seo-index";

export const metadata: Metadata = {
  title: "역대 최강 태풍 순위 — 중심기압·풍속 기록",
  description: "역대 가장 강했던 태풍과 허리케인을 최저 중심기압과 최대 풍속 기준으로 정리했습니다. 1979년 태풍 팁(870hPa)을 비롯한 세계 기록과 북서태평양·북대서양 해역별 순위를 확인하세요.",
  alternates: { canonical: "/ranking" },
};

const basins = ["WP", "NA", "EP"] as const;

export default function RankingPage() {
  const byPressure = (list: IndexedStorm[]) => [...list].filter((storm) => storm.pp).sort((a, b) => (a.pp ?? 9999) - (b.pp ?? 9999));
  const global = byPressure(allStorms).slice(0, 25);
  const longest = [...allStorms].sort((a, b) => b.c - a.c).slice(0, 10);

  return (
    <main className="doc-main">
      <article className="doc-body">
        <h1>역대 최강 태풍 순위</h1>
        <p className="lede">각국 기상기관이 사후 재분석해 확정한 베스트트랙 기록을 기준으로, 가장 낮은 중심기압까지 발달했던 열대저기압을 모았습니다. 중심기압이 낮을수록 태풍이 강하게 발달한 것이고, 이 값은 태풍의 일생 중 가장 강했던 순간을 가리킵니다.</p>

        <section>
          <h2>세계 최저 중심기압 25</h2>
          <div className="table-scroll">
            <table>
              <thead><tr><th>순위</th><th>이름</th><th>중심기압</th><th>최대 풍속</th><th>해역</th><th>발생</th></tr></thead>
              <tbody>
                {global.map((storm, rank) => (
                  <tr key={storm.id}>
                    <td>{rank + 1}</td>
                    <td><a href={stormPath(storm)}>{storm.y}년 {stormTitle(storm)}</a><small>{subName(storm)}</small></td>
                    <td><b>{storm.pp} hPa</b></td>
                    <td><span className={`chip ${intensityClass(storm.pw)}`}>{storm.pw ? `${storm.pw} kt` : "—"}</span><small>{storm.pw ? `${knotToMs(storm.pw)} m/s` : ""}</small></td>
                    <td>{basinNames[storm.b]}</td>
                    <td>{formatDate(storm.s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>1위는 1979년 북서태평양에서 관측된 태풍 팁(TIP)입니다. 중심기압 870hPa은 지구에서 관측된 열대저기압 가운데 가장 낮은 값으로 남아 있습니다.</p>
        </section>

        {basins.map((basin) => {
          const list = byPressure(allStorms.filter((storm) => storm.b === basin)).slice(0, 15);
          return (
            <section key={basin}>
              <h2>{basinNames[basin]} {basinTerms[basin]} 순위</h2>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>순위</th><th>이름</th><th>중심기압</th><th>강도</th><th>한반도 최근접</th></tr></thead>
                  <tbody>
                    {list.map((storm, rank) => (
                      <tr key={storm.id}>
                        <td>{rank + 1}</td>
                        <td><a href={stormPath(storm)}>{storm.y}년 {stormTitle(storm)}</a></td>
                        <td>{storm.pp} hPa</td>
                        <td><span className={`chip ${intensityClass(storm.pw)}`}>{intensityLabel(storm.pw)}</span></td>
                        <td>{storm.kr !== null && storm.kr <= 1500 ? `약 ${storm.kr} km` : "먼 해상"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}

        <section>
          <h2>가장 오래 관측된 열대저기압</h2>
          <p>관측 지점 수가 많다는 것은 그만큼 오래 세력을 유지했다는 뜻입니다. 대부분 6시간 간격으로 기록됩니다.</p>
          <ul className="link-list">
            {longest.map((storm) => (
              <li key={storm.id}>
                <a href={stormPath(storm)}>
                  <b>{storm.y}년 {stormTitle(storm)}</b>
                  <span>{storm.c}회 관측 · {basinNames[storm.b]}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>순위를 비교할 때 주의할 점</h2>
          <p>해역마다 풍속을 재는 방식이 다릅니다. 북서태평양의 일본 기상청은 10분 평균 풍속을, 북대서양·북동태평양의 미국 국립허리케인센터는 1분 평균 풍속을 씁니다. 같은 태풍이라도 1분 평균이 10분 평균보다 대략 12% 높게 나오므로, 해역이 다른 두 태풍의 풍속 숫자를 그대로 비교하면 오해가 생깁니다. 중심기압은 측정 방식 차이가 상대적으로 작아 비교에 더 적합합니다.</p>
          <p>또한 1980년대 위성 관측이 정착하기 전 기록은 관측 자체의 정확도가 떨어집니다. 항공 정찰이 이뤄지던 북대서양과 그렇지 않은 해역 사이에도 차이가 있습니다.</p>
        </section>
      </article>
    </main>
  );
}
