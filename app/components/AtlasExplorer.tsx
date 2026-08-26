"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { fetchJmaLiveStorms } from "../data/jma-live";
import { basinLabels, type Basin, type Storm, type StormYear } from "../data/storms";
import { displayStormName } from "../data/typhoon-names-ko";
import { ArchiveLinks } from "./ArchiveLinks";
import { CycloneMap } from "./CycloneMap";

export function AtlasExplorer() {
  const searchParams = useSearchParams();
  const requestedYear = Number(searchParams.get("year")) || null;
  const requestedStorm = searchParams.get("storm");
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [stormYear, setStormYear] = useState<StormYear | null>(null);
  const [basin, setBasin] = useState<Basin>("WP");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);

  useEffect(() => {
    fetch("/data/years/index.json", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { years: number[] }) => {
        setYears(data.years);
        setYear(requestedYear && data.years.includes(requestedYear) ? requestedYear : data.years[0] ?? null);
      });
  }, [requestedYear]);

  useEffect(() => {
    if (!year) return;
    setStormYear(null);
    fetch(`/data/years/${year}.json`, { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data: StormYear) => {
        const live = year === new Date().getFullYear() ? await fetchJmaLiveStorms(year).catch(() => []) : [];
        const liveNumbers = new Set(live.map((storm) => storm.number));
        const storms = orderStorms([...live, ...data.storms.filter((storm) => !liveNumbers.has(storm.number))]);
        const requested = requestedStorm ? storms.find((storm) => storm.id === requestedStorm) : undefined;
        const defaultBasin: Basin = requested?.basin ?? (storms.some((storm) => storm.basin === "WP") ? "WP" : "all");
        setStormYear({ ...data, storms });
        setBasin(defaultBasin);
        setSelectedId(requested?.id ?? storms.find((storm) => defaultBasin === "all" || storm.basin === defaultBasin)?.id ?? null);
      });
  }, [year, requestedStorm]);

  const availableStorms = useMemo(() => orderStorms(stormYear?.storms.filter((storm) => basin === "all" || storm.basin === basin) ?? []), [stormYear, basin]);
  const selectedStorm = availableStorms.find((storm) => storm.id === selectedId) ?? availableStorms[0] ?? null;

  useEffect(() => {
    if (selectedStorm && selectedStorm.id !== selectedId) setSelectedId(selectedStorm.id);
  }, [selectedId, selectedStorm]);

  useEffect(() => { if (selectedStorm) setActivePoint(defaultPoint(selectedStorm)); }, [selectedStorm?.id]);

  function selectStorm(storm: Storm) { setSelectedId(storm.id); setActivePoint(defaultPoint(storm)); }
  function selectBasin(nextBasin: Basin) { setBasin(nextBasin); const nextStorm = stormYear?.storms.find((storm) => nextBasin === "all" || storm.basin === nextBasin); setSelectedId(nextStorm?.id ?? null); }

  if (!selectedStorm || !stormYear || year === null) return <main className="loading-screen"><h1>태풍 경로 · 과거 태풍 경로 지도</h1><strong>Typhoon Atlas</strong><span>태풍 기록을 불러오는 중입니다…</span><ArchiveLinks /></main>;
  const pointIndex = Math.min(activePoint, selectedStorm.track.length - 1);
  const point = selectedStorm.track[pointIndex];
  return (
    <main className="app-shell">
      <section className="map-area"><CycloneMap storm={selectedStorm} activePoint={activePoint} /></section>
      <aside className={`sidebar ${filtersOpen ? "is-open" : ""}`}>
        <header className="brand"><span className="brand-mark"><i /><i /><i /></span><h1>Typhoon Atlas<small>태풍 경로 · 과거 태풍 경로 지도</small></h1><button className={`panel-toggle filter-toggle ${filtersOpen ? "is-open" : ""}`} type="button" aria-label={filtersOpen ? "태풍 찾기 닫기" : "태풍 찾기 열기"} title={filtersOpen ? "닫기" : "태풍 찾기"} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><b aria-hidden="true" /></button></header>
        <div className="filter-content">
        <div className="filter-row">
          <label><span>연도</span><select value={year} onChange={(event) => setYear(Number(event.target.value))}>{years.map((item) => <option key={item} value={item}>{item}년</option>)}</select></label>
          <label><span>해역</span><select value={basin} onChange={(event) => selectBasin(event.target.value as Basin)}>{Object.entries(basinLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="storm-selector"><span>태풍</span><select value={selectedStorm.id} onChange={(event) => { const storm = availableStorms.find((item) => item.id === event.target.value); if (storm) selectStorm(storm); }}>{availableStorms.map((storm) => <option key={storm.id} value={storm.id}>{storm.status === "active" ? "현재 · " : ""}{storm.number} {displayStormName(storm)} ({storm.name})</option>)}</select></label>
        </div>
        <footer><ArchiveLinks />현재·예보: 일본 기상청 방재정보 · 과거 확정 경로: JMA RSMC Tokyo / NOAA NHC <Link href="/privacy">개인정보처리방침</Link></footer>
        </div>
      </aside>
      <section className={`storm-panel ${detailsOpen ? "is-open" : ""}`} aria-live="polite">
        <button className="storm-summary" type="button" aria-label={detailsOpen ? "태풍 상세 닫기" : "태풍 상세 보기"} title={detailsOpen ? "닫기" : "상세 보기"} aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}><span className="summary-copy"><i className={selectedStorm.status === "active" ? "active" : ""} /><span><b>{selectedStorm.number} {displayStormName(selectedStorm)}</b><small>{selectedStorm.status === "active" ? "현재 진행 중" : "과거 경로"} · {basinLabels[selectedStorm.basin]}</small></span></span><span className="summary-action"><span>{detailsOpen ? "접기" : "상세"}</span><b aria-hidden="true" /></span></button>
        <div className="storm-details">
        <div className="storm-panel-top"><div><span className="eyebrow"><i /> {basinLabels[selectedStorm.basin]}</span><h1>{selectedStorm.number} {displayStormName(selectedStorm)}</h1><p>{selectedStorm.name} · {selectedStorm.dates}</p></div><span className={`status ${selectedStorm.status}`}>{selectedStorm.status === "active" ? "진행 중" : selectedStorm.status === "provisional" ? "속보 분석" : "기록 완료"}</span></div>
        <p className="storm-record-link"><Link href={stormRecordPath(selectedStorm)}>{selectedStorm.number} {displayStormName(selectedStorm)} 상세 기록 보기 →</Link></p>
        <div className="metrics"><div><span>최대 풍속</span><b>{selectedStorm.peakWind ? `${selectedStorm.peakWind} kt` : "기록 없음"}</b></div><div><span>최저 중심기압</span><b>{selectedStorm.peakPressure ? `${selectedStorm.peakPressure} hPa` : "기록 없음"}</b></div></div>
        <div className="timeline"><div><div><span>{point.kind === "forecast" ? "예보 시점" : "경로 시점"}</span><b>{point.time}</b></div><span>{pointIndex + 1} / {selectedStorm.track.length}</span></div><input aria-label="경로 시점" type="range" min="0" max={selectedStorm.track.length - 1} value={pointIndex} onChange={(event) => setActivePoint(Number(event.target.value))} /><div className="point-details"><span>{point.radiusType === "wind" ? `강풍 경계 약 ${Math.round(point.radiusKm ?? 0)} km` : point.radiusType === "probability" ? `예보 확률 원 약 ${Math.round(point.radiusKm ?? 0)} km` : `풍속 ${point.wind ? `${point.wind} kt` : "—"}`}</span><span>중심기압 {point.pressure ? `${point.pressure} hPa` : "—"}</span></div></div>
        </div>
      </section>
      <div className="map-legend"><span className="line-swatch" />관측·분석 경로 {selectedStorm.status === "active" && <><span className="forecast-swatch" />예보 경로 <span className="wind-range-swatch" />강풍 경계 <span className="probability-range-swatch" />70% 확률 원</>} <span className="intensity-swatch" />지점 색 = 풍속 <span className="dot-swatch" />선택 시점</div>
    </main>
  );
}

function defaultPoint(storm: Storm) {
  const firstForecast = storm.track.findIndex((point) => point.kind === "forecast");
  return firstForecast > 0 ? firstForecast - 1 : storm.track.length - 1;
}

/** Mirrors `stormSlug` in `app/data/seo-index.ts`. */
function stormRecordPath(storm: Storm) {
  const agency = /^[A-Z]{2}\d/.test(storm.id) ? storm.id.slice(0, 2).toLowerCase() : "wp";
  const number = storm.number.replace(/\D/g, "") || "0";
  const name = storm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unnamed";
  return `/typhoon/${storm.year}/${agency}-${number}-${name}`;
}

function orderStorms(storms: Storm[]) {
  return [...storms].sort((a, b) => Number(b.number.replace(/\D/g, "")) - Number(a.number.replace(/\D/g, "")));
}
