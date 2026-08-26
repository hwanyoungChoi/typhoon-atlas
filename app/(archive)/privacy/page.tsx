import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Typhoon Atlas 개인정보처리방침 및 광고 쿠키 안내",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <main className="doc-main"><article className="doc-body">
    <h1>개인정보처리방침</h1>
    <p>시행일: 2026년 8월 7일</p>
    <section><h2>수집하는 정보</h2><p>Typhoon Atlas는 회원가입이나 직접적인 개인정보 입력을 요구하지 않습니다. 서비스 운영 과정에서 브라우저와 광고 제공업체가 쿠키 등 온라인 식별자를 사용할 수 있습니다.</p></section>
    <section><h2>광고 및 쿠키</h2><p>이 서비스는 Google AdSense를 사용해 광고를 제공할 수 있습니다. Google을 포함한 제3자 제공업체는 사용자의 이전 방문 정보를 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있습니다.</p><p>Google의 광고 쿠키 사용으로 Google 및 파트너는 이 사이트와 다른 웹사이트 방문 기록을 기반으로 맞춤 광고를 표시할 수 있습니다. 사용자는 <a href="https://adssettings.google.com/" rel="noreferrer" target="_blank">Google 광고 설정</a>에서 맞춤 광고를 관리하거나 거부할 수 있습니다.</p></section>
    <section><h2>외부 서비스</h2><p>지도는 OpenStreetMap 기반 지도 타일을 사용하며, 태풍 데이터는 일본기상청과 미국 국립허리케인센터의 공개 자료를 활용합니다. 각 서비스는 자체 개인정보처리방침에 따라 정보를 처리할 수 있습니다.</p></section>
    <section><h2>정책 변경</h2><p>본 방침은 서비스 또는 관련 법령의 변경에 따라 갱신될 수 있으며, 변경 사항은 이 페이지에 게시합니다.</p></section>
  </article></main>;
}
