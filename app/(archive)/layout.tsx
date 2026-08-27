
const links = [
  { href: "/", label: "지도" },
  { href: "/typhoon", label: "연도별 태풍" },
  { href: "/korea", label: "한반도 접근" },
  { href: "/ranking", label: "역대 순위" },
  { href: "/names", label: "태풍 이름" },
  { href: "/guide", label: "태풍 가이드" },
];

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="doc">
      <header className="doc-header">
        <a className="doc-brand" href="/">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Typhoon Atlas<small>태풍 경로 아카이브</small></span>
        </a>
        <nav className="doc-nav">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      </header>
      {children}
      <footer className="doc-footer">
        <p>과거 확정 경로는 일본 기상청 RSMC Tokyo 베스트트랙과 미국 NOAA 국립허리케인센터 HURDAT2를 사용합니다. 현재·예보 정보는 일본 기상청 방재정보이며, 공식 경보가 아니라 참고용 재가공 자료입니다. 실제 대비는 기상청 발표를 따르세요.</p>
        <nav>
          <a href="/about">사이트 소개</a>
          <a href="/guide">태풍 가이드</a>
          <a href="/privacy">개인정보처리방침</a>
          <a href="https://www.weather.go.kr/w/typhoon/typ-korea.do" rel="noreferrer" target="_blank">기상청 태풍정보</a>
        </nav>
        <small>© {new Date().getFullYear()} Typhoon Atlas</small>
      </footer>
    </div>
  );
}
