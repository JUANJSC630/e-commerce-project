import "server-only"

import { Country, State, City } from "country-state-city"

/**
 * Geographic reference data (countries → states → cities) sourced from the local
 * `country-state-city` dataset. Kept server-side so the multi-MB dataset never
 * ships to the client; the storefront reaches it through /api/locations/*.
 */

export interface LocationOption {
  code: string
  name: string
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

export function getCountries(): (LocationOption & { flag: string })[] {
  return Country.getAllCountries()
    .map((c) => ({ code: c.isoCode, name: c.name, flag: c.flag }))
    .sort(byName)
}

export function getStates(countryCode: string): LocationOption[] {
  return State.getStatesOfCountry(countryCode)
    .map((s) => ({ code: s.isoCode, name: s.name }))
    .sort(byName)
}

/**
 * Searches cities within a country, optionally narrowed to a state. When a state
 * is given the full (bounded) list is returned - a department/state has at most
 * a few hundred cities, so it's both complete and fast. Only the country-wide
 * search (no state) is capped, to avoid dumping the thousands of cities a large
 * country can have; typing then narrows it.
 */
export function searchCities(
  countryCode: string,
  stateCode: string | undefined,
  query: string,
  limit = 50,
): string[] {
  const source = stateCode
    ? City.getCitiesOfState(countryCode, stateCode)
    : City.getCitiesOfCountry(countryCode)

  if (!source) return []

  const q = query.trim().toLowerCase()
  const cap = stateCode ? Infinity : limit
  const seen = new Set<string>()
  const results: string[] = []

  for (const city of source) {
    if (q && !city.name.toLowerCase().includes(q)) continue
    if (seen.has(city.name)) continue
    seen.add(city.name)
    results.push(city.name)
    if (results.length >= cap) break
  }

  return results.sort((a, b) => a.localeCompare(b))
}
