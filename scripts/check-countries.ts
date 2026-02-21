/**
 * dev script: run with `npx tsx scripts/check-countries.ts`
 * Verifies resolveCountry and normalizeCountryName behave as expected.
 */
import {
  resolveCountry,
  normalizeCountryName,
  COUNTRIES_BY_ISO,
  getCountryIsoCodes,
} from "../lib/countries";

const checks: [string, () => boolean][] = [
  ["normalize: trim, lowercase, collapse spaces", () => normalizeCountryName("  USA  ") === "usa"],
  ["normalize: remove punctuation", () => normalizeCountryName("U.S.A.") === "usa"],
  ["resolve USA -> US", () => resolveCountry("USA")?.isoCode === "US" && resolveCountry("USA")?.displayName === "United States of America"],
  ["resolve usa (lowercase)", () => resolveCountry("usa")?.isoCode === "US"],
  ["resolve United States (alias)", () => resolveCountry("United States")?.isoCode === "US"],
  ["resolve UK -> GB", () => resolveCountry("UK")?.isoCode === "GB"],
  ["resolve Czech Republic -> CZ", () => resolveCountry("Czech Republic")?.isoCode === "CZ" && resolveCountry("Czech Republic")?.displayName === "Czechia"],
  ["resolve South Korea -> KR", () => resolveCountry("South Korea")?.isoCode === "KR"],
  ["resolve empty -> null", () => resolveCountry("") === null],
  ["resolve garbage -> null", () => resolveCountry("Not a country") === null],
  ["COUNTRIES_BY_ISO has US", () => COUNTRIES_BY_ISO["US"] === "United States of America"],
  ["getCountryIsoCodes returns array", () => Array.isArray(getCountryIsoCodes()) && getCountryIsoCodes().length > 150],
];

let failed = 0;
for (const [name, fn] of checks) {
  try {
    if (!fn()) {
      console.error("FAIL:", name);
      failed++;
    } else {
      console.log("OK:", name);
    }
  } catch (e) {
    console.error("ERROR:", name, e);
    failed++;
  }
}
process.exit(failed > 0 ? 1 : 0);
