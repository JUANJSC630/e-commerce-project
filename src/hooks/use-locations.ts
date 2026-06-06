"use client"

import { useEffect, useRef, useState } from "react"
import type { ComboboxOption } from "@/components/ui/combobox"

/**
 * Client hooks over the /api/locations/* endpoints. Module-level caches keep
 * countries and per-country states in memory, so navigating between checkout
 * steps (which remounts the form) never refetches. Cities are searched on the
 * server with a debounce.
 */

interface CountryDTO {
  code: string
  name: string
}
interface StateDTO {
  code: string
  name: string
}

let countriesCache: ComboboxOption[] | null = null
const statesCache = new Map<string, ComboboxOption[]>()
let detectedCountryCache: string | null | undefined

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json() as Promise<T>
}

export function useCountries() {
  const [options, setOptions] = useState<ComboboxOption[]>(countriesCache ?? [])
  const [loading, setLoading] = useState(!countriesCache)

  useEffect(() => {
    if (countriesCache) return
    const controller = new AbortController()
    fetchJson<CountryDTO[]>("/api/locations/countries", controller.signal)
      .then((data) => {
        countriesCache = data.map((c) => ({ value: c.code, label: c.name }))
        setOptions(countriesCache)
        setLoading(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  return { options, loading }
}

export function useStates(countryCode: string | undefined) {
  const [options, setOptions] = useState<ComboboxOption[]>(() =>
    countryCode ? (statesCache.get(countryCode) ?? []) : [],
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!countryCode) {
      setOptions([])
      return
    }
    const cached = statesCache.get(countryCode)
    if (cached) {
      setOptions(cached)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetchJson<StateDTO[]>(`/api/locations/states?country=${countryCode}`, controller.signal)
      .then((data) => {
        const opts = data.map((s) => ({ value: s.code, label: s.name }))
        statesCache.set(countryCode, opts)
        setOptions(opts)
        setLoading(false)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOptions([])
          setLoading(false)
        }
      })
    return () => controller.abort()
  }, [countryCode])

  return { options, loading }
}

export function useCities(countryCode: string | undefined, stateCode: string | undefined) {
  const [options, setOptions] = useState<ComboboxOption[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!countryCode) {
      setOptions([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const params = new URLSearchParams({ country: countryCode })
      if (stateCode) params.set("state", stateCode)
      if (query) params.set("q", query)
      fetchJson<string[]>(`/api/locations/cities?${params.toString()}`, controller.signal)
        .then((names) => {
          setOptions(names.map((name) => ({ value: name, label: name })))
          setLoading(false)
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setOptions([])
            setLoading(false)
          }
        })
    }, 200)
    return () => {
      controller.abort()
      clearTimeout(timer.current)
    }
  }, [countryCode, stateCode, query])

  return { options, loading, setQuery }
}

/** One-shot country detection (ISO alpha-2), cached for the session. */
export function useDetectedCountry() {
  const [country, setCountry] = useState<string | null>(detectedCountryCache ?? null)
  const [resolved, setResolved] = useState(detectedCountryCache !== undefined)

  useEffect(() => {
    if (detectedCountryCache !== undefined) return
    const controller = new AbortController()
    fetchJson<{ country: string | null }>("/api/geo", controller.signal)
      .then((data) => {
        detectedCountryCache = data.country
        setCountry(data.country)
        setResolved(true)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          detectedCountryCache = null
          setResolved(true)
        }
      })
    return () => controller.abort()
  }, [])

  return { country, resolved }
}
