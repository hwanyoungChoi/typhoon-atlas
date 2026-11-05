"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ArchiveLinks } from "./ArchiveLinks";
import { CycloneMap } from "./CycloneMap";
import { StormSummary } from "./StormSummary";
import { intensityScale } from "../data/intensity";
import { fetchJmaLiveStorms } from "../data/jma-live";
import { basinLabels, type Basin, type Storm, type StormYear } from "../data/storms";
import { displayStormName } from "../data/typhoon-names-ko";

export function AtlasExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Captured once: a link like /?year=2022&storm=... should seed the initial
  // selection, but must not keep re-triggering fetches once we start writing
  // the *current* selection back into the URL below (that would refetch on
  // every pick and flash the loading screen).
  const [{ requestedYear, requestedStorm }] = useState(() => ({
    requestedYear: Number(searchParams.get("year")) || null,
    requestedStorm: searchParams.get("storm"),
  }));
  const [years, setYears] = useState<number[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [stormYear, setStormYear] = useState<StormYear | null>(null);
  const [basin, setBasin] = useState<Basin>("WP");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  // The control rail floats over the map: beside it on wide screens, across
  // the top on phones. Tell the map which edge it covers.
  function coveredInset() {
    const rail = railRef.current?.getBoundingClientRect();
    const none = { top: 0, right: 0, bottom: 0, left: 0 };
    if (!rail) return none;
    return rail.width > window.innerWidth * 0.6
      ? { ...none, top: rail.bottom }
      : { ...none, left: rail.right };
  }

  useEffect(() => {
    fetch("/data/years/index.json", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { years: number[] }) => {
        setYears(data.years);
        setYear(
          requestedYear && data.years.includes(requestedYear)
            ? requestedYear
            : (data.years[0] ?? null),
        );
      });
  }, [requestedYear]);

  useEffect(() => {
    if (!year) return;
    setStormYear(null);
    fetch(`/data/years/${year}.json`, { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data: StormYear) => {
        const live =
          year === new Date().getFullYear() ? await fetchJmaLiveStorms(year).catch(() => []) : [];
        const liveNumbers = new Set(live.map((storm) => storm.number));
        const storms = orderStorms([
          ...live,
          ...data.storms.filter((storm) => !liveNumbers.has(storm.number)),
        ]);
        const requested = requestedStorm
          ? storms.find((storm) => storm.id === requestedStorm)
          : undefined;
        const defaultBasin: Basin =
          requested?.basin ?? (storms.some((storm) => storm.basin === "WP") ? "WP" : "all");
        setStormYear({ ...data, storms });
        setBasin(defaultBasin);
        setSelectedId(
          requested?.id ??
            storms.find((storm) => defaultBasin === "all" || storm.basin === defaultBasin)?.id ??
            null,
        );
      });
  }, [year, requestedStorm]);

  const availableStorms = useMemo(
    () =>
      orderStorms(
        stormYear?.storms.filter((storm) => basin === "all" || storm.basin === basin) ?? [],
      ),
    [stormYear, basin],
  );
  const selectedStorm =
    availableStorms.find((storm) => storm.id === selectedId) ?? availableStorms[0] ?? null;

  useEffect(() => {
    if (selectedStorm && selectedStorm.id !== selectedId) setSelectedId(selectedStorm.id);
  }, [selectedId, selectedStorm]);

  useEffect(() => {
    if (selectedStorm) setActivePoint(defaultPoint(selectedStorm));
  }, [selectedStorm?.id]);

  // Keep the URL in sync with the current selection so it's always
  // shareable, not just when someone arrived via a ?year=&storm= link.
  useEffect(() => {
    if (year === null) return;
    const params = new URLSearchParams();
    params.set("year", String(year));
    if (selectedStorm) params.set("storm", selectedStorm.id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, year, selectedStorm?.id]);

  function selectStorm(storm: Storm) {
    setSelectedId(storm.id);
    setActivePoint(defaultPoint(storm));
  }
  function selectBasin(nextBasin: Basin) {
    setBasin(nextBasin);
    const nextStorm = stormYear?.storms.find(
      (storm) => nextBasin === "all" || storm.basin === nextBasin,
    );
    setSelectedId(nextStorm?.id ?? null);
  }

  if (!stormYear || year === null)
    return (
      <main className="loading-screen">
        <h1>태풍 경로 · 과거 태풍 경로 지도</h1>
        <strong>Typhoon Atlas</strong>
        <span>태풍 기록을 불러오는 중입니다…</span>
        <ArchiveLinks />
      </main>
    );
  return (
    <main className="app-shell">
      <section className="map-area">
        {selectedStorm ? (
          <CycloneMap storm={selectedStorm} activePoint={activePoint} coveredInset={coveredInset} />
        ) : (
          <div className="map-empty">
            <p>
              {year}년 {basinLabels[basin]} 기록이 없습니다.
            </p>
            <span>
              해당 시즌이 아직 시작되지 않았거나, 이 해역·연도 조합에 관측된 태풍이 없습니다.
            </span>
          </div>
        )}
      </section>
      <div className="left-rail" ref={railRef}>
        <aside className={`sidebar ${filtersOpen ? "is-open" : ""}`}>
          <header className="brand">
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            <h1>
              Typhoon Atlas<small>태풍 경로 · 과거 태풍 경로 지도</small>
            </h1>
            <button
              className={`panel-toggle filter-toggle ${filtersOpen ? "is-open" : ""}`}
              type="button"
              aria-label={filtersOpen ? "태풍 찾기 닫기" : "태풍 찾기 열기"}
              title={filtersOpen ? "닫기" : "태풍 찾기"}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <b aria-hidden="true" />
            </button>
          </header>
          <div className="filter-content">
            <div className="filter-row">
              <label>
                <span>연도</span>
                <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}년
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>해역</span>
                <select
                  value={basin}
                  onChange={(event) => selectBasin(event.target.value as Basin)}
                >
                  {Object.entries(basinLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {selectedStorm && (
                <label className="storm-selector">
                  <span>태풍</span>
                  <select
                    value={selectedStorm.id}
                    onChange={(event) => {
                      const storm = availableStorms.find((item) => item.id === event.target.value);
                      if (storm) selectStorm(storm);
                    }}
                  >
                    {availableStorms.map((storm) => (
                      <option key={storm.id} value={storm.id}>
                        {storm.status === "active" ? "현재 · " : ""}
                        {storm.number} {displayStormName(storm)} ({storm.name})
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
          {selectedStorm && <StormSummary storm={selectedStorm} />}
          <div className="rail-foot">
            <ArchiveLinks />
            <p>
              데이터: 일본 기상청 방재정보 · JMA RSMC Tokyo · NOAA NHC{" "}
              <a href="/privacy">개인정보처리방침</a>
            </p>
          </div>
        </aside>
        {selectedStorm && (
          <div className={`legend ${legendOpen ? "is-open" : ""}`}>
            <button
              type="button"
              className="legend-head"
              aria-expanded={legendOpen}
              onClick={() => setLegendOpen((open) => !open)}
            >
              <span>ⓘ 범례</span>
              <b aria-hidden="true" />
            </button>
            <div className="legend-body">
              <ul className="legend-lines">
                <li>
                  <span className="line-swatch" />
                  관측·분석 경로 (색은 강도)
                </li>
                {selectedStorm.status === "active" && (
                  <li>
                    <span className="forecast-swatch" />
                    예보 경로
                  </li>
                )}
                {selectedStorm.status === "active" && (
                  <li>
                    <span className="wind-range-swatch" />
                    강풍 경계
                  </li>
                )}
                {selectedStorm.status === "active" && (
                  <li>
                    <span className="probability-range-swatch" />
                    70% 확률 원
                  </li>
                )}
                <li>
                  <span className="dot-swatch" />
                  선택 시점
                </li>
                <li>
                  <svg
                    className="end-swatch"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    aria-hidden="true"
                  >
                    <line x1="2" y1="2" x2="12" y2="12" />
                    <line x1="2" y1="12" x2="12" y2="2" />
                  </svg>
                  소멸 지점
                </li>
              </ul>
              <h3>태풍 강도 (10분 평균 풍속)</h3>
              <ul className="legend-intensity">
                {intensityScale.map((item) => (
                  <li key={item.cls}>
                    <span className={`chip ${item.cls}`}>{item.label}</span>
                    <small>{item.range}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function defaultPoint(storm: Storm) {
  const firstForecast = storm.track.findIndex((point) => point.kind === "forecast");
  return firstForecast > 0 ? firstForecast - 1 : storm.track.length - 1;
}

function orderStorms(storms: Storm[]) {
  return [...storms].sort(
    (a, b) => Number(b.number.replace(/\D/g, "")) - Number(a.number.replace(/\D/g, "")),
  );
}
