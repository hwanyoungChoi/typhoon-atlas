"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Storm } from "../data/storms";
import { displayStormName } from "../data/typhoon-names-ko";

type Props = { storm: Storm; activePoint: number };
const mapAssetOrigin = "https://tiles.openfreemap.org/";
const useMapProxy = process.env.NODE_ENV === "production";
const mapStyle = useMapProxy ? "/map-assets/styles/fiord" : `${mapAssetOrigin}styles/fiord`;

// Vinext does not automatically copy MapLibre's sibling worker module into
// Cloudflare's static asset bundle. Importing its URL makes Vite emit it.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

export function CycloneMap({ storm, activePoint }: Props) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const segmentNodes = useRef<(SVGLineElement | null)[]>([]);
  const forecastLine = useRef<SVGPolylineElement>(null);
  const pointNodes = useRef<(SVGCircleElement | null)[]>([]);
  const rangeNodes = useRef<(SVGPolygonElement | null)[]>([]);
  const activeNode = useRef<SVGGElement>(null);
  const activePointRef = useRef(activePoint);
  activePointRef.current = activePoint;
  const [isReady, setIsReady] = useState(false);
  const firstForecastIndex = storm.track.findIndex((point) => point.kind === "forecast");
  const observedCount = firstForecastIndex < 0 ? storm.track.length : firstForecastIndex;

  useEffect(() => {
    if (!node.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: node.current,
      style: mapStyle,
      center: [128, 20],
      zoom: 1.8,
      attributionControl: true,
      renderWorldCopies: false,
      transformRequest: useMapProxy
        ? (url) => ({
            url: url.startsWith(mapAssetOrigin)
              ? `/map-assets/${url.slice(mapAssetOrigin.length)}`
              : url,
          })
        : undefined,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => {
      map.setProjection({ type: "globe" });
      setIsReady(true);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) return;
    const coordinates = storm.track.map(({ lng, lat }) => [lng, lat] as [number, number]);
    const bounds = storm.track.reduce((result, item) => result.extend([item.lng, item.lat]), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
    const draw = () => {
      const pixels = coordinates.map((coordinate) => map.project(coordinate));
      for (let index = 0; index < observedCount - 1; index += 1) {
        const segment = segmentNodes.current[index];
        if (!segment) continue;
        segment.setAttribute("x1", String(pixels[index].x));
        segment.setAttribute("y1", String(pixels[index].y));
        segment.setAttribute("x2", String(pixels[index + 1].x));
        segment.setAttribute("y2", String(pixels[index + 1].y));
      }
      forecastLine.current?.setAttribute("points", firstForecastIndex < 0 ? "" : pixels.slice(Math.max(0, firstForecastIndex - 1)).map((point) => `${point.x},${point.y}`).join(" "));
      pixels.forEach((point, index) => {
        pointNodes.current[index]?.setAttribute("cx", String(point.x));
        pointNodes.current[index]?.setAttribute("cy", String(point.y));
      });
      storm.track.forEach((point, index) => {
        if (!point.radiusKm) return;
        const center = point.radiusCenter ?? [point.lat, point.lng];
        const ring = circleCoordinates(center[0], center[1], point.radiusKm).map((coordinate) => map.project(coordinate));
        rangeNodes.current[index]?.setAttribute("points", ring.map((pixel) => `${pixel.x},${pixel.y}`).join(" "));
      });
      const active = pixels[activePointRef.current];
      if (active) {
        activeNode.current?.setAttribute("transform", `translate(${active.x} ${active.y})`);
      }
    };
    if (storm.status === "active") {
      const currentIndex = firstForecastIndex > 0 ? firstForecastIndex - 1 : storm.track.length - 1;
      const current = storm.track[currentIndex];
      map.jumpTo({ center: [current.lng, current.lat], zoom: 5.5 });
    } else {
      map.fitBounds(bounds, { padding: 90, duration: 0, maxZoom: 5 });
    }
    map.once("idle", draw);
    map.on("render", draw);
    return () => { map.off("render", draw); };
  }, [storm, isReady]);

  useEffect(() => {
    const map = mapRef.current;
    const point = storm.track[activePoint];
    if (!map || !point) return;
    const pixel = map.project([point.lng, point.lat]);
    activeNode.current?.setAttribute("transform", `translate(${pixel.x} ${pixel.y})`);
  }, [storm, activePoint]);

  return <div className="map-shell" aria-label={`${displayStormName(storm)} 경로 지도`}>
    <div ref={node} className="map" />
    <svg className="track-overlay" aria-hidden="true">
      {storm.track.map((point, index) => point.radiusKm ? <polygon key={`range-${index}`} ref={(element) => { rangeNodes.current[index] = element; }} className={`storm-range ${point.radiusType}`} /> : null)}
      {Array.from({ length: Math.max(0, observedCount - 1) }, (_, index) => (
        <line key={`segment-${index}`} ref={(element) => { segmentNodes.current[index] = element; }} className={`track-segment ${windIntensity(storm.track[index + 1].wind)}`} />
      ))}
      <polyline ref={forecastLine} className="forecast-track" />
      {storm.track.map((point, index) => <circle key={`${point.lng}-${point.lat}-${index}`} ref={(element) => { pointNodes.current[index] = element; }} className={`${point.kind === "forecast" ? "forecast-point" : "observed-point"} ${windIntensity(point.wind)}`} r={point.kind === "forecast" ? 3 : 3.5} />)}
      {storm.status === "archived" && activePoint === storm.track.length - 1
        ? <g ref={activeNode} className="active-marker is-end"><line x1="-6" y1="-6" x2="6" y2="6" /><line x1="-6" y1="6" x2="6" y2="-6" /></g>
        : <g ref={activeNode} className={`active-marker ${windIntensity(storm.track[activePoint]?.wind ?? null)}`}><circle className="marker-dot" r="7" /></g>}
    </svg>
  </div>;
}

function windIntensity(wind: number | null) {
  if (wind === null) return "intensity-unknown";
  if (wind < 34) return "intensity-depression";
  if (wind < 48) return "intensity-storm";
  if (wind < 64) return "intensity-severe";
  if (wind < 85) return "intensity-typhoon";
  if (wind < 105) return "intensity-very-strong";
  return "intensity-violent";
}

function circleCoordinates(latitude: number, longitude: number, radiusKm: number): [number, number][] {
  const angularDistance = radiusKm / 6371;
  const lat1 = latitude * Math.PI / 180;
  const lng1 = longitude * Math.PI / 180;
  return Array.from({ length: 49 }, (_, index) => {
    const bearing = index / 48 * Math.PI * 2;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing));
    const lng2 = lng1 + Math.atan2(Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1), Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));
    return [lng2 * 180 / Math.PI, lat2 * 180 / Math.PI];
  });
}
