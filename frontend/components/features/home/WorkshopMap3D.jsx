"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Map as MapIcon, Minus, Plus, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Workshop location as [lng, lat] (see SITE.geo). */
const CENTER = [SITE.geo.lng, SITE.geo.lat];
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;
const ARCGIS_KEY = process.env.NEXT_PUBLIC_ARCGIS_KEY;
/**
 * Satellite mode (needs a MapTiler key for labels/roads). The photo itself is
 * Esri World Imagery when an ArcGIS key is set — far sharper over Dhaka than
 * MapTiler's own imagery, which is only clear up to about zoom 16.
 */
const SATELLITE = Boolean(MAPTILER_KEY);
const ESRI_IMAGERY = SATELLITE && Boolean(ARCGIS_KEY);
const VIEW_3D = { center: CENTER, zoom: ESRI_IMAGERY ? 17.4 : 16.3, pitch: 62, bearing: -25 };
const VIEW_2D = { pitch: 0, bearing: 0 };
/** Without a MapTiler key: free colourful OpenStreetMap style (openfreemap.org) with 3D buildings. */
const STYLE_URL = SATELLITE
  ? `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`
  : "https://tiles.openfreemap.org/styles/liberty";
const MAPTILER_LOGO = "https://api.maptiler.com/resources/logo.svg";
const BUILDING_COLORS = [
  "interpolate",
  ["linear"],
  ["coalesce", ["get", "render_height"], 6],
  0,
  "#f3e6d4",
  10,
  "#f5c99b",
  25,
  "#f0987a",
  50,
  "#e0403e",
  90,
  "#a2221f",
];
const WORKER_URL = "/vendor/maplibre-gl-worker.js";
/** Credits required by the tile/data licences. */
const ATTRIBUTION = SATELLITE
  ? [
      ...(ESRI_IMAGERY
        ? [{ href: "https://www.esri.com/", label: "Powered by Esri · Esri, Maxar, Earthstar Geographics" }]
        : []),
      { href: "https://www.maptiler.com/copyright/", label: "© MapTiler" },
      { href: "https://www.openstreetmap.org/copyright", label: "© OpenStreetMap contributors" },
    ]
  : [
      { href: "https://openfreemap.org", label: "OpenFreeMap" },
      { href: "https://www.openmaptiles.org/", label: "© OpenMapTiles" },
      { href: "https://www.openstreetmap.org/copyright", label: "© OpenStreetMap contributors" },
    ];

/**
 * Satellite mode: grade the photo to sit in the dark brand theme — a little
 * darker, richer contrast, less muddy green — and give roads clean, crisp lines.
 */
function styleSatellite(map) {
  const set = (layer, property, value) => map.getLayer(layer) && map.setPaintProperty(layer, property, value);
  // Gentle grading: strong contrast boosts make soft imagery look even blurrier.
  set("Satellite", "raster-saturation", -0.12);
  set("Satellite", "raster-contrast", 0.08);
  set("Satellite", "raster-brightness-max", 0.88);
  set("Satellite", "raster-resampling", "linear");
  set("Road", "line-color", [
    "match",
    ["get", "class"],
    ["motorway", "trunk", "primary", "secondary"],
    "rgba(255, 214, 170, 0.85)",
    "rgba(255, 255, 255, 0.45)",
  ]);
  for (const layer of ["Path", "Path minor"]) set(layer, "line-opacity", 0.3);
  for (const layer of ["Road labels", "Place labels"]) {
    set(layer, "text-color", "#ffffff");
    set(layer, "text-halo-color", "rgba(14, 14, 16, 0.85)");
    set(layer, "text-halo-width", 1.4);
  }
}

/** Glowing red pin with a label; plain DOM because MapLibre positions it. */
function createPin() {
  const el = document.createElement("div");
  el.className = "pointer-events-none flex flex-col items-center";
  el.innerHTML = `
    <span class="mb-2 rounded-full border border-white/15 bg-ink-950/90 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-lg shadow-black/50 backdrop-blur">
      Jayma Motors <span class="text-brand-500">· Workshop</span>
    </span>
    <span class="relative flex size-12 items-center justify-center">
      <span class="absolute inset-0 animate-ping rounded-full bg-brand-600/50 [animation-duration:1.8s]"></span>
      <span class="absolute inset-1 rounded-full bg-brand-600/30"></span>
      <span class="relative flex size-7 items-center justify-center rounded-full bg-brand-600 ring-4 ring-white/90 shadow-[0_0_24px_rgb(224_64_62/0.9)]">
        <span class="size-2 rounded-full bg-white"></span>
      </span>
    </span>`;
  return el;
}

/**
 * Home contact band: tilted 3D map of the workshop (MapLibre) with a glowing
 * pin — colour-graded satellite photo via MapTiler when NEXT_PUBLIC_MAPTILER_KEY
 * is set, else OpenFreeMap with 3D buildings. Slowly orbits the pin until the
 * visitor touches it; two-finger / ctrl+scroll gestures so it never traps
 * page scrolling. Loads only near the viewport. Falls back to the Google
 * embed if WebGL or the tiles are unavailable.
 */
export function WorkshopMap3D({ fallbackSrc, className }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let map;
    let frame = 0;
    let orbiting = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;

    const stopOrbit = () => {
      orbiting = false;
      cancelAnimationFrame(frame);
    };

    const init = async () => {
      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled) return;
        maplibre.setWorkerUrl(WORKER_URL);
        map = new maplibre.Map({
          container,
          ...VIEW_3D,
          maxPitch: 70,
          cooperativeGestures: true,
          // Required credits are rendered by this component in the dark theme (see ATTRIBUTION).
          attributionControl: false,
        });
        mapRef.current = map;
        // Drop the style's highway-shield layers: unused in Dhaka, and their filters log warnings.
        map.setStyle(STYLE_URL, {
          transformStyle: (_previous, next) => ({
            ...next,
            sources: ESRI_IMAGERY
              ? {
                  ...next.sources,
                  // Swap MapTiler's photo for sharper Esri World Imagery (256px tiles, real detail to z19).
                  satellite: {
                    type: "raster",
                    tiles: [
                      `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${ARCGIS_KEY}`,
                    ],
                    tileSize: 256,
                    maxzoom: 19,
                  },
                }
              : next.sources,
            layers: next.layers.filter((layer) => !layer.id.includes("shield")),
          }),
        });
        map.on("error", (event) => {
          // A broken style/tile host means a blank map; show the Google embed instead.
          if (!map.isStyleLoaded() && event?.error?.status) setFailed(true);
        });

        // The tile style references a few pattern icons it doesn't ship; use a blank pixel.
        map.setMissingStyleImageResolver((id) => {
          if (!map.hasImage(id)) map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
        });

        map.on("load", () => {
          if (SATELLITE) styleSatellite(map);
          // Colour the style's 3D buildings by height: warm cream → peach → coral → brand red.
          else if (map.getLayer("building-3d")) {
            map.setPaintProperty("building-3d", "fill-extrusion-color", BUILDING_COLORS);
            map.setPaintProperty("building-3d", "fill-extrusion-opacity", 0.9);
          }
          // subpixelPositioning: without it the pin snaps to whole pixels each frame and shakes while orbiting.
          new maplibre.Marker({ element: createPin(), anchor: "bottom", subpixelPositioning: true })
            .setLngLat(CENTER)
            .addTo(map);
          setReady(true);

          const orbit = () => {
            if (!orbiting) return;
            map.setBearing(map.getBearing() + 0.04);
            frame = requestAnimationFrame(orbit);
          };
          if (orbiting) frame = requestAnimationFrame(orbit);
        });

        // Any real interaction stops the slow orbit.
        for (const type of ["mousedown", "touchstart", "wheel"]) map.on(type, stopOrbit);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    // Load the map library only when the section gets close.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        init();
      },
      { rootMargin: "400px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  const zoom = (delta) => mapRef.current?.easeTo({ zoom: mapRef.current.getZoom() + delta });
  const reset = () => {
    mapRef.current?.flyTo({ ...VIEW_3D, duration: 1600 });
    setIs3D(true);
  };
  const toggle3D = () => {
    const next = !is3D;
    mapRef.current?.easeTo(next ? { pitch: VIEW_3D.pitch, bearing: VIEW_3D.bearing } : VIEW_2D);
    setIs3D(next);
  };

  if (failed) {
    return (
      <iframe
        title="Jayma Motors on Google Maps"
        src={fallbackSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={cn("border-0", className)}
      />
    );
  }

  const controlClass =
    "flex size-10 items-center justify-center text-white transition-colors hover:bg-brand-600 disabled:opacity-40";

  return (
    <div className={cn("relative bg-ink-900", className)}>
      {/* size-full: MapLibre sets position:relative on this element, so inset-0 alone gives it no height. */}
      <div
        ref={containerRef}
        className="absolute inset-0 size-full"
        aria-label="3D map of the Jayma Motors workshop"
        role="region"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
          <span
            className="size-6 animate-spin rounded-full border-2 border-white/15 border-t-brand-500"
            aria-hidden="true"
          />
          <span className="sr-only">Loading map</span>
        </div>
      )}

      <p className="absolute top-0 left-0 z-10 rounded-br-control bg-ink-950/75 px-2 py-1 text-[10px] text-zinc-500 backdrop-blur">
        {ATTRIBUTION.map((item, index) => (
          <span key={item.href}>
            {index > 0 && " · "}
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">
              {item.label}
            </a>
          </span>
        ))}
      </p>

      {SATELLITE && (
        // Vignette into the dark panel + soft red glow behind the pin (map centre).
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgb(224_64_62/0.22),transparent_22%),radial-gradient(ellipse_75%_70%_at_50%_50%,transparent_45%,rgb(14_14_16/0.75))]"
        />
      )}
      {SATELLITE && (
        // MapTiler's free plan requires its logo on the map.
        <a
          href="https://www.maptiler.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-3 bottom-3 z-10"
          aria-label="MapTiler"
        >
          <Image src={MAPTILER_LOGO} alt="" width={67} height={20} unoptimized />
        </a>
      )}

      <div className="absolute top-4 right-4 flex flex-col overflow-hidden rounded-control border border-white/15 bg-ink-950/85 shadow-lg backdrop-blur">
        <button type="button" onClick={() => zoom(1)} aria-label="Zoom in" className={controlClass} disabled={!ready}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoom(-1)}
          aria-label="Zoom out"
          className={cn(controlClass, "border-t border-white/10")}
          disabled={!ready}
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggle3D}
          aria-label={is3D ? "Switch to flat map" : "Switch to 3D map"}
          className={cn(controlClass, "border-t border-white/10")}
          disabled={!ready}
        >
          {is3D ? <MapIcon className="size-4" aria-hidden="true" /> : <Box className="size-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset view"
          className={cn(controlClass, "border-t border-white/10")}
          disabled={!ready}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
