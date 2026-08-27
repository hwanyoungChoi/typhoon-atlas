import type { Metadata } from "next";

import { allStorms, stormPath, type IndexedStorm } from "../../data/seo-index";
import { activeNames, retiredNames } from "../../data/typhoon-names-ko";

export const metadata: Metadata = {
  title: "태풍 이름 목록과 사용 이력",
  description: "현재 쓰이는 태풍 이름 140개와 각 이름이 지금까지 어떤 태풍에 붙었는지 정리했습니다. 개미, 나리, 장미 같은 우리말 이름과 매미·루사처럼 퇴출된 이름까지 확인하세요.",
  alternates: { canonical: "/names" },
};

export default function NamesPage() {
  const usage = new Map<string, IndexedStorm[]>();
  for (const storm of allStorms) {
    if (storm.b !== "WP" || storm.n === "UNNAMED") continue;
    const key = storm.n.toUpperCase();
    usage.set(key, [...(usage.get(key) ?? []), storm]);
  }

  const active = Object.entries(activeNames).map(([name, korean]) => ({ name, korean, storms: usage.get(name) ?? [] }));
  const retired = Object.entries(retiredNames)
    .map(([name, korean]) => ({ name, korean, storms: usage.get(name) ?? [] }))
    .filter((entry) => entry.storms.length > 0 && !(entry.name in activeNames))
    .sort((a, b) => (b.storms[0]?.y ?? 0) - (a.storms[0]?.y ?? 0));

  return (
    <main className="doc-main">
      <article className="doc-body">
        <h1>태풍 이름 목록과 사용 이력</h1>
        <p className="lede">태풍 이름은 태풍위원회 회원국 14개국이 각각 10개씩 제출한 140개를 순서대로 돌려 씁니다. 한 바퀴 도는 데 4~5년쯤 걸리므로, 같은 이름이 여러 해에 걸쳐 다시 등장합니다. 아래는 각 이름이 실제로 어떤 태풍에 붙었는지를 베스트트랙 기록에서 뽑은 것입니다.</p>

        <section>
          <h2>현재 사용 중인 이름</h2>
          <p>이름을 누르면 그 이름을 썼던 역대 태풍의 경로 기록으로 이동합니다. 아직 순번이 돌아오지 않아 기록이 없는 이름도 있습니다.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>이름</th><th>국제명</th><th>사용 이력</th></tr></thead>
              <tbody>
                {active.map((entry) => (
                  <tr key={entry.name}>
                    <td><b>{entry.korean}</b></td>
                    <td>{entry.name}</td>
                    <td className="name-uses">
                      {entry.storms.length
                        ? entry.storms.slice(0, 8).map((storm) => <a key={storm.id} href={stormPath(storm)}>{storm.y}년 {storm.no}</a>)
                        : <span>기록 없음</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>퇴출된 이름</h2>
          <p>큰 피해를 낸 태풍의 이름은 회원국 요청으로 목록에서 빠지고 새 이름으로 교체됩니다. 2003년 매미, 2002년 루사, 2022년 힌남노가 그런 경우입니다. 아래는 이 사이트가 한국어 표기를 갖고 있는 과거 이름들입니다.</p>
          <div className="table-scroll">
            <table>
              <thead><tr><th>이름</th><th>국제명</th><th>사용 이력</th></tr></thead>
              <tbody>
                {retired.map((entry) => (
                  <tr key={entry.name}>
                    <td><b>{entry.korean}</b></td>
                    <td>{entry.name}</td>
                    <td className="name-uses">
                      {entry.storms.slice(0, 8).map((storm) => <a key={storm.id} href={stormPath(storm)}>{storm.y}년 {storm.no}</a>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>우리말 태풍 이름</h2>
          <p>한국이 제출한 이름은 개미, 나리, 장미, 미리내, 노루, 제비, 너구리, 고니, 메기, 독수리입니다. 북한이 제출한 기러기, 도라지, 갈매기, 수리개, 메아리, 소나무, 버들, 노을, 민들레, 날개까지 더하면 우리말 이름은 20개입니다. 태풍 이름 가운데 우리말 비중이 높은 이유입니다.</p>
          <p>이름이 짧고 부르기 쉬워야 하고, 회원국 언어에서 부정적인 뜻이 없어야 한다는 조건이 있습니다. 태풍의 세력을 약하게 하려는 뜻에서 부드러운 이름을 고른다는 이야기가 널리 알려져 있지만, 공식 선정 기준에 그런 항목은 없습니다.</p>
          <p><a href="/guide">태풍 번호와 등급 기준 보기 →</a></p>
        </section>
      </article>
    </main>
  );
}
