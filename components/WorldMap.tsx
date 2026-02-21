"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  useMapContext,
} from "react-simple-maps";
import { getGeographies, type GeographyWithIso } from "@/lib/mapData";
import type { GuessedCountry } from "@/lib/types";

const ROTATE_SENSITIVITY = 0.4;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 8;

type Difficulty = "easy" | "medium" | "hard";

type WorldMapProps = {
  guessedCountries: Record<string, GuessedCountry>;
  difficulty: Difficulty;
};

/** Blacked-out fill for unguessed land (spec: map fully blacked out until revealed) */
const DEFAULT_FILL = "#1e293b"; // Slate 800, matches dark theme
const DEFAULT_STROKE_MEDIUM = "#94a3b8"; // Slate 400
const DEFAULT_STROKE_EASY = "#475569"; // Slate 600 for visible borders in easy
const GUESSED_FILL = "#10b981"; // Emerald 500
const GUESSED_STROKE = "#059669"; // Emerald 600
const LABEL_FILL = "#0f172a"; // Slate 900 (Dark text on light land)

function MapContent({
  geographies,
  guessedCountries,
  difficulty,
}: {
  geographies: GeographyWithIso[];
  guessedCountries: Record<string, GuessedCountry>;
  difficulty: Difficulty;
}) {
  const { path } = useMapContext();
  const showBordersFromStart = difficulty === "easy";

  return (
    <>
      {geographies.map((geo) => {
        const isoCode = geo.properties?.isoCode ?? "";
        const displayName = geo.properties?.displayName ?? "";
        const isGuessed = Boolean(isoCode && guessedCountries[isoCode]);

        const fill = isGuessed ? GUESSED_FILL : DEFAULT_FILL;
        const stroke = isGuessed
          ? GUESSED_STROKE
          : showBordersFromStart
            ? DEFAULT_STROKE_EASY
            : DEFAULT_STROKE_MEDIUM;

        let centroid: [number, number] | null = null;
        try {
          const c = path.centroid(
            geo as Parameters<typeof path.centroid>[0]
          );
          centroid = [c[0], c[1]];
        } catch {
          centroid = null;
        }

        return (
          <g key={geo.rsmKey}>
            <Geography
              geography={geo}
              fill={fill}
              stroke={stroke}
              strokeWidth={isGuessed ? 0.5 : showBordersFromStart ? 0.25 : 0}
              style={{
                default: { outline: "none" },
                hover: { outline: "none" },
                pressed: { outline: "none" },
              }}
              tabIndex={-1}
            />
            {isGuessed && displayName && centroid && (
              <text
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                fill={LABEL_FILL}
                fontSize={10}
                fontWeight={500}
                style={{ pointerEvents: "none" }}
              >
                {displayName}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

function useViewportSize() {
  const [size, setSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

export default function WorldMap({ guessedCountries, difficulty }: WorldMapProps) {
  const [geographies, setGeographies] = useState<GeographyWithIso[] | null>(null);
  const { width, height } = useViewportSize();
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, startRot: [0, 0, 0] as [number, number, number] });

  useEffect(() => {
    getGeographies().then(setGeographies);
  }, []);

  const geographyData = geographies
    ? { type: "FeatureCollection" as const, features: geographies }
    : null;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startRot: [...rotation],
      };
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [rotation]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const { isDragging, startX, startY, startRot } = dragRef.current;
    if (!isDragging) return;
    const dx = (e.clientX - startX) * ROTATE_SENSITIVITY;
    const dy = (e.clientY - startY) * ROTATE_SENSITIVITY;
    const newLon = startRot[0] + dx;
    const newLat = Math.max(-90, Math.min(90, startRot[1] - dy));
    setRotation([newLon, newLat, 0]);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z + delta)));
  }, []);

  if (!geographyData || !geographyData.features.length) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#020617] text-[var(--muted)] text-sm">
        Loading map…
      </div>
    );
  }

  const size = Math.min(width, height);
  const orthoScale = (size / 2) * 0.92 * zoom;

  return (
    <div
      className="h-full w-full overflow-hidden bg-[#020617] cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: "none" }}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{
          scale: orthoScale,
          rotate: [rotation[0], rotation[1], rotation[2]],
        }}
        width={width}
        height={height}
        style={{ width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none" }}
      >
        <Sphere id={""} fill="#1e3a8a" stroke="#1e40af" strokeWidth={0.5} />
        <Geographies geography={geographyData}>
          {({ geographies }) => (
            <MapContent
              geographies={geographies as GeographyWithIso[]}
              guessedCountries={guessedCountries}
              difficulty={difficulty}
            />
          )}
        </Geographies>
      </ComposableMap>
    </div>
  );
}
