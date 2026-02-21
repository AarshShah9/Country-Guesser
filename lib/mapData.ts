import { feature } from "topojson-client";
import { NUMERIC_TO_ALPHA2 } from "./iso-numeric-to-alpha2";
import { COUNTRIES_BY_ISO } from "./countries";

// TopoJSON from world-atlas uses numeric id (ISO 3166-1 numeric) per feature.
// We convert to GeoJSON and attach isoCode (alpha-2) for lookup against our countries dataset.

const COUNTRIES_110M_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface GeographyWithIso {
  type: "Feature";
  id: string;
  rsmKey: string;
  properties: { name?: string; isoCode?: string; displayName?: string };
  geometry: { type: string; coordinates: unknown };
}

let cachedFeatures: GeographyWithIso[] | null = null;

/**
 * Load TopoJSON from world-atlas, convert to GeoJSON, enrich with isoCode (alpha-2)
 * and displayName from our countries dataset. Cached after first call.
 */
export async function getGeographies(): Promise<GeographyWithIso[]> {
  if (cachedFeatures) return cachedFeatures;

  const res = await fetch(COUNTRIES_110M_URL);
  const topology = (await res.json()) as {
    objects: { countries: { type: "GeometryCollection"; geometries: unknown[] } };
  };

  const fc = feature(topology, topology.objects.countries) as {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      id?: number | string;
      properties?: Record<string, unknown>;
      geometry: { type: string; coordinates: unknown };
    }>;
  };

  const features: GeographyWithIso[] = fc.features.map((f, i) => {
    const id = f.id != null ? String(f.id) : "";
    const isoCode = NUMERIC_TO_ALPHA2[id] ?? "";
    const displayName = isoCode
      ? COUNTRIES_BY_ISO[isoCode]
      : (f.properties?.name as string) ?? "";
    return {
      ...f,
      id,
      rsmKey: f.id != null ? String(f.id) : `geo-${i}`,
      properties: {
        ...(f.properties || {}),
        name: f.properties?.name as string,
        isoCode,
        displayName,
      },
    } as GeographyWithIso;
  });

  cachedFeatures = features;
  return features;
}

/**
 * Synchronous: returns null until geographies have been loaded via getGeographies().
 */
export function getGeographiesSync(): GeographyWithIso[] | null {
  return cachedFeatures;
}
