import { Suspense } from "react";

import { AtlasExplorer } from "./components/AtlasExplorer";
import { ArchiveLinks } from "./components/ArchiveLinks";

export default function Home() {
  return (
    <Suspense fallback={<main className="loading-screen"><h1>태풍 경로 · 과거 태풍 경로 지도</h1><strong>Typhoon Atlas</strong><span>태풍 기록을 불러오는 중입니다…</span><ArchiveLinks /></main>}>
      <AtlasExplorer />
    </Suspense>
  );
}
