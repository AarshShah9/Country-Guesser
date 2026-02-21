import { COUNTRY_ENTRIES } from "./countries-data";

/**
 * Canonical list: ISO code -> display name.
 * Single source of truth for validation and display.
 */
export const COUNTRIES_BY_ISO: Record<string, string> = Object.fromEntries(
  COUNTRY_ENTRIES
) as Record<string, string>;

/**
 * Normalize user input for matching: trim, lowercase, collapse spaces,
 * optionally remove common punctuation (e.g. "U.S.A." -> "usa").
 */
export function normalizeCountryName(input: string): string {
  if (typeof input !== "string") return "";
  let s = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  // Remove common punctuation that might appear in country names or abbreviations
  s = s.replace(/[.,;:'\-()]/g, "").replace(/\s+/g, " ").trim();
  return s;
}

/**
 * Alias map: normalized alias -> ISO code.
 * Small set for MVP; expand as needed.
 */
const ALIAS_TO_ISO: Record<string, string> = {
  usa: "US",
  "u.s.a.": "US",
  "u.s.a": "US",
  us: "US",
  "united states": "US",
  "united states of america": "US",
  america: "US",
  uk: "GB",
  "u.k.": "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  england: "GB",
  uae: "AE",
  "united arab emirates": "AE",
  "south korea": "KR",
  "korea (south)": "KR",
  "korea (republic of)": "KR",
  "north korea": "KP",
  "korea (north)": "KP",
  "dprk": "KP",
  russia: "RU",
  "russian federation": "RU",
  czechia: "CZ",
  "czech republic": "CZ",
  "czech": "CZ",
  "tanzania": "TZ",
  "tanzania (united republic of)": "TZ",
  "vietnam": "VN",
  "viet nam": "VN",
  "ivory coast": "CI",
  "cote divoire": "CI",
  "cote d ivoire": "CI",
  "bolivia": "BO",
  "bolivia (plurinational state of)": "BO",
  "venezuela": "VE",
  "venezuela (bolivarian republic of)": "VE",
  "iran": "IR",
  "iran (islamic republic of)": "IR",
  "syria": "SY",
  "syrian arab republic": "SY",
  "laos": "LA",
  "lao people's democratic republic": "LA",
  "lao pdr": "LA",
  "brunei": "BN",
  "brunei darussalam": "BN",
  "democratic republic of the congo": "CD",
  "drc": "CD",
  "dr congo": "CD",
  "republic of the congo": "CG",
  "congobrazzaville": "CG",
  "timor-leste": "TL",
  "east timor": "TL",
  "palestine": "PS",
  "state of palestine": "PS",
  "vatican city": "VA",
  "holy see": "VA",
  "north macedonia": "MK",
  "macedonia": "MK",
  "eswatini": "SZ",
  "swaziland": "SZ",
  "turkey": "TR",
  "türkiye": "TR",
  "turkiye": "TR",
};

// Build normalized display name -> ISO for exact match after alias miss
let _normalizedNameToIso: Record<string, string> | null = null;

function getNormalizedNameToIso(): Record<string, string> {
  if (_normalizedNameToIso) return _normalizedNameToIso;
  const map: Record<string, string> = {};
  for (const [iso, name] of COUNTRY_ENTRIES) {
    const key = normalizeCountryName(name);
    if (key && !map[key]) map[key] = iso;
  }
  _normalizedNameToIso = map;
  return map;
}

export type ResolvedCountry = { isoCode: string; displayName: string };

/**
 * Resolve user input to a canonical country.
 * 1. Normalize input
 * 2. Check alias map
 * 3. Check normalized display names
 * Returns { isoCode, displayName } or null if not found.
 */
export function resolveCountry(input: string): ResolvedCountry | null {
  const normalized = normalizeCountryName(input);
  if (!normalized) return null;

  const aliasIso = ALIAS_TO_ISO[normalized];
  if (aliasIso) {
    const displayName = COUNTRIES_BY_ISO[aliasIso];
    if (displayName) return { isoCode: aliasIso, displayName };
  }

  const nameToIso = getNormalizedNameToIso();
  const iso = nameToIso[normalized];
  if (iso) {
    const displayName = COUNTRIES_BY_ISO[iso];
    if (displayName) return { isoCode: iso, displayName };
  }

  return null;
}

/**
 * Get all valid ISO codes (for map/key iteration).
 */
export function getCountryIsoCodes(): string[] {
  return COUNTRY_ENTRIES.map(([iso]) => iso);
}
