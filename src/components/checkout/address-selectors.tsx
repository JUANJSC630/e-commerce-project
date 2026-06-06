"use client"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { useCities, useCountries, useDetectedCountry, useStates } from "@/hooks/use-locations"
import { useSettings } from "@/components/providers/settings-provider"

export interface AddressValue {
  country: string
  state: string
  city: string
}

interface AddressSelectorsProps {
  value: AddressValue
  onChange: (patch: Partial<AddressValue>) => void
  errors?: Partial<Record<keyof AddressValue, string>>
  /** Optional ZIP field rendered as the third column next to state/city. */
  zipField?: React.ReactNode
}

// Geo detection should only seed the very first selection of the session; after
// that the user's choice (reflected in `value`) wins, even across remounts.
let geoSeeded = false

/**
 * Chained country → state → city selectors. Country is auto-detected (geo-IP)
 * but editable; states/cities are scoped to the selection and searched as you
 * type. Stores human-readable names in `value` while tracking ISO codes
 * internally for chaining.
 */
export function AddressSelectors({ value, onChange, errors, zipField }: AddressSelectorsProps) {
  const { locale } = useSettings()
  const [countryCode, setCountryCode] = useState<string | undefined>()
  const [stateCode, setStateCode] = useState<string | undefined>()

  const { options: countries } = useCountries()
  const { options: states, loading: statesLoading } = useStates(countryCode)
  const {
    options: cities,
    loading: citiesLoading,
    setQuery: setCityQuery,
  } = useCities(countryCode, stateCode)
  const { country: detected, resolved: geoResolved } = useDetectedCountry()

  const labelOf = (options: { value: string; label: string }[], code?: string) =>
    options.find((o) => o.value === code)?.label

  // Seed the country immediately from the saved name or the config default —
  // without waiting on geo, so the field is never blank on load.
  const seededDefault = useRef(false)
  useEffect(() => {
    if (seededDefault.current || countryCode || countries.length === 0) return
    seededDefault.current = true

    const code =
      (value.country && countries.find((c) => c.label === value.country)?.value) ??
      countries.find((c) => c.label === locale.defaultCountry)?.value
    if (code) {
      setCountryCode(code)
      const name = labelOf(countries, code)
      if (name && name !== value.country) onChange({ country: name })
    }
  }, [countries, countryCode, value.country, onChange, locale.defaultCountry])

  // Once (per session), upgrade to the geo-detected country if it differs and
  // the user hasn't picked one yet. Runs after the immediate seed above.
  const geoChecked = useRef(false)
  useEffect(() => {
    if (geoChecked.current || geoSeeded || !geoResolved || countries.length === 0) return
    geoChecked.current = true
    geoSeeded = true

    if (detected && detected !== countryCode && countries.some((c) => c.value === detected)) {
      setCountryCode(detected)
      setStateCode(undefined)
      onChange({ country: labelOf(countries, detected) ?? "", state: "", city: "" })
    }
  }, [geoResolved, detected, countryCode, countries, onChange])

  // Restore the state code from its saved name once the state list is available.
  useEffect(() => {
    if (stateCode || !value.state || states.length === 0) return
    const match = states.find((s) => s.label === value.state)
    if (match) setStateCode(match.value)
  }, [states, stateCode, value.state])

  const handleCountry = (code: string) => {
    geoSeeded = true // an explicit choice must not be overridden by geo
    setCountryCode(code)
    setStateCode(undefined)
    setCityQuery("") // drop any leftover city search from the previous country
    onChange({ country: labelOf(countries, code) ?? "", state: "", city: "" })
  }

  const handleState = (code: string) => {
    setStateCode(code)
    setCityQuery("") // drop any leftover city search from the previous department
    onChange({ state: labelOf(states, code) ?? "", city: "" })
  }

  return (
    <>
      <div>
        <Label htmlFor="country">País *</Label>
        <Combobox
          id="country"
          options={countries}
          value={countryCode}
          onChange={handleCountry}
          placeholder="Selecciona tu país"
          searchPlaceholder="Buscar país…"
          emptyText="País no encontrado."
          aria-invalid={!!errors?.country}
        />
        {errors?.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="state">Departamento *</Label>
          <Combobox
            id="state"
            options={states}
            value={stateCode}
            onChange={handleState}
            loading={statesLoading}
            disabled={!countryCode}
            placeholder="Selecciona…"
            searchPlaceholder="Buscar departamento…"
            emptyText={countryCode ? "Sin departamentos." : "Elige un país primero."}
            aria-invalid={!!errors?.state}
          />
          {errors?.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
        </div>

        <div>
          <Label htmlFor="city">Ciudad *</Label>
          <Combobox
            id="city"
            options={cities}
            value={value.city}
            onChange={(name) => onChange({ city: name })}
            // State-scoped: the full (bounded) list is loaded → filter locally
            // (instant). Country-wide: search on the server.
            onSearchChange={stateCode ? undefined : setCityQuery}
            loading={citiesLoading}
            disabled={!countryCode}
            placeholder="Selecciona…"
            searchPlaceholder="Buscar ciudad…"
            emptyText={countryCode ? "Sin coincidencias." : "Elige un país primero."}
            aria-invalid={!!errors?.city}
          />
          {errors?.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
        </div>

        {zipField}
      </div>
    </>
  )
}
