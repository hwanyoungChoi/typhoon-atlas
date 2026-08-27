import type { Metadata } from "next";

import { allStorms, builtAt, yearSummaries } from "../../data/seo-index";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "Typhoon Atlas가 어떤 자료를 어떻게 가공해 태풍 경로를 보여주는지, 데이터 출처와 갱신 주기, 만든 사람과 문의 방법을 안내합니다.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const koreaCount = allStorms.filter((storm) => storm.kr !== null && storm.kr <= 300).length;

  return (
    <main className="doc-main">
      <article className="doc-body">
        <h1>사이트 소개</h1>
        <p className="lede">Typhoon Atlas는 전 세계 열대저기압의 과거 경로와 현재 예보를 지도 한 장에서 볼 수 있게 만든 개인 프로젝트입니다. 기상기관이 공개한 원자료를 한국어 사용자가 읽기 쉬운 형태로 정리하는 것이 목적입니다.</p>

        <section>
          <h2>담고 있는 자료</h2>
          <ul>
            <li>북서태평양 태풍 — 1951년부터 현재까지, 일본 기상청 RSMC Tokyo 베스트트랙</li>
            <li>북대서양·북동태평양 허리케인 — 1851년부터, 미국 NOAA 국립허리케인센터 HURDAT2</li>
            <li>현재 진행 중인 태풍의 위치·예보 — 일본 기상청 방재정보</li>
          </ul>
          <p>현재 {allStorms.length.toLocaleString()}개 열대저기압, {yearSummaries.length}개 연도의 기록을 담고 있습니다. 그중 {koreaCount.toLocaleString()}개가 한반도 300km 이내로 접근했습니다. 마지막 자료 갱신은 {builtAt}입니다.</p>
        </section>

        <section>
          <h2>어떻게 가공하나</h2>
          <p>원자료는 고정폭 텍스트로 배포됩니다. 이를 3시간마다 내려받아 태풍별 경로로 변환하고, 관측 지점의 위치·중심기압·최대 풍속을 그대로 보존한 채 지도에 표시합니다. 한반도 접근 거리처럼 이 사이트에서 계산한 값은 관측 위치로부터 직접 산출한 것이며, 어떤 기준으로 계산했는지 각 페이지에 밝혀 두었습니다.</p>
          <p>원자료의 값을 임의로 보정하거나 추정치로 채우지 않습니다. 기록이 없는 항목은 &quot;기록 없음&quot;으로 표시합니다.</p>
        </section>

        <section>
          <h2>이 사이트가 하지 않는 것</h2>
          <p>자체 예보를 생산하지 않습니다. 진행 중인 태풍에 대해 표시되는 예보 경로는 일본 기상청 발표를 그대로 옮긴 것이고, 공식 경보를 대신하지 않습니다. 태풍 대비와 관련한 판단은 반드시 <a href="https://www.weather.go.kr/w/typhoon/typ-korea.do" rel="noreferrer" target="_blank">기상청</a>과 <a href="https://www.safekorea.go.kr" rel="noreferrer" target="_blank">국민재난안전포털</a>의 발표를 기준으로 하세요.</p>
        </section>

        <section>
          <h2>만든 사람과 문의</h2>
          <p>프론트엔드 개발자 최환영이 만들고 운영합니다. 자료 오류나 개선 제안은 <a href="mailto:welcomechoi@kakao.com">welcomechoi@kakao.com</a>으로 보내주세요. 다른 작업 기록은 <a href="https://conychoi.dev" rel="noreferrer">conychoi.dev</a>에 있습니다.</p>
          <p><a href="/privacy">개인정보처리방침</a></p>
        </section>
      </article>
    </main>
  );
}
