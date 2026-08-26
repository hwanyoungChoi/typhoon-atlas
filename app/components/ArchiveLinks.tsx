import Link from "next/link";

const links = [
  { href: "/typhoon", label: "연도별 기록" },
  { href: "/korea", label: "한반도 접근" },
  { href: "/ranking", label: "역대 순위" },
  { href: "/names", label: "태풍 이름" },
  { href: "/guide", label: "태풍 가이드" },
];

export function ArchiveLinks() {
  return (
    <nav className="archive-links">
      {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
    </nav>
  );
}
