import * as maplibregl from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

const mapAssetOrigin = "https://tiles.openfreemap.org/";
const useMapProxy = process.env.NODE_ENV === "production";

// Vinext does not automatically copy MapLibre's sibling worker module into
// Cloudflare's static asset bundle. Importing its URL makes Vite emit it.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

/** Style and request rewriting shared by every map on the site. */
export const baseMapOptions: Pick<maplibregl.MapOptions, "style" | "transformRequest"> = {
  style: useMapProxy ? "/map-assets/styles/fiord" : `${mapAssetOrigin}styles/fiord`,
  transformRequest: useMapProxy
    ? (url) => ({
        url: url.startsWith(mapAssetOrigin)
          ? `/map-assets/${url.slice(mapAssetOrigin.length)}`
          : url,
      })
    : undefined,
};

export { maplibregl };
