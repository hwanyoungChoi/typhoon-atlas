"use client";

import { useEffect, useRef } from "react";

import { baseMapOptions, maplibregl } from "./mapSetup";
import { intensityColor } from "../data/intensity";

/** A track as [lng, lat, wind kt][] in time order. */
export type TrackLine = { id: string; points: [number, number, number | null][] };
/** A single position, coloured by the wind given. */
export type TrackMark = { id: string; lng: number; lat: number; wind: number | null };

type Props = {
  lines?: TrackLine[];
  marks?: TrackMark[];
  /** What the map shows, for screen readers and as the caption. */
  caption: string;
};

/**
 * A still map for the archive pages: the same base map as the explorer, with
 * tracks coloured segment by segment by intensity. It does not take gestures,
 * so scrolling the document never turns into panning the map.
 */
export function TrackMap({ lines = [], marks = [], caption }: Props) {
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!node.current) return;
    const coordinates = [
      ...lines.flatMap((line) => line.points.map(([lng, lat]) => [lng, lat] as [number, number])),
      ...marks.map((mark) => [mark.lng, mark.lat] as [number, number]),
    ];
    if (!coordinates.length) return;
    const bounds = coordinates.reduce(
      (result, coordinate) => result.extend(coordinate),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );
    const map = new maplibregl.Map({
      ...baseMapOptions,
      container: node.current,
      bounds,
      fitBoundsOptions: { padding: 36, maxZoom: 6 },
      interactive: false,
      // Tracks keep counting past 180°E instead of jumping to -180°, so the
      // map must be allowed to draw east of the antimeridian.
      renderWorldCopies: true,
      attributionControl: { compact: true },
    });
    map.on("load", () => {
      // The compact credit starts expanded; fold it so it does not cover the tracks.
      node.current
        ?.querySelector(".maplibregl-ctrl-attrib")
        ?.classList.remove("maplibregl-compact-show");
      map.addSource("tracks", { type: "geojson", data: segments(lines) });
      map.addLayer({
        id: "tracks",
        type: "line",
        source: "tracks",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "color"], "line-width": lines.length > 1 ? 2.2 : 3.5 },
      });
      map.addSource("marks", { type: "geojson", data: points(marks) });
      map.addLayer({
        id: "marks",
        type: "circle",
        source: "marks",
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#0e2733",
          "circle-stroke-width": 1.5,
        },
      });
    });
    return () => map.remove();
  }, [lines, marks]);

  return (
    <figure className="track-map" data-ui>
      <div ref={node} className="track-map-canvas" role="img" aria-label={caption} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function segments(lines: TrackLine[]): GeoJSON.FeatureCollection<GeoJSON.LineString> {
  return {
    type: "FeatureCollection",
    features: lines.flatMap((line) =>
      line.points.slice(1).map(([lng, lat, wind], index) => {
        const [fromLng, fromLat] = line.points[index];
        return {
          type: "Feature" as const,
          properties: { color: intensityColor(wind) },
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [fromLng, fromLat],
              [lng, lat],
            ],
          },
        };
      }),
    ),
  };
}

function points(marks: TrackMark[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: marks.map((mark) => ({
      type: "Feature" as const,
      properties: { color: intensityColor(mark.wind) },
      geometry: { type: "Point" as const, coordinates: [mark.lng, mark.lat] },
    })),
  };
}
