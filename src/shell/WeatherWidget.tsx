import { useCallback, useEffect, useRef, useState, type SVGProps } from 'react'

interface WeatherWidgetProps {
  className?: string
}

interface WeatherLocation {
  label: string
  latitude: number
  longitude: number
}

interface OpenMeteoForecastResponse {
  current: {
    apparent_temperature: number
    is_day: number
    temperature_2m: number
    time: string
    weather_code: number
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
  hourly: {
    temperature_2m: number[]
    time: string[]
  }
}

interface WeatherSnapshot {
  apparentTemperature: number
  conditionLabel: string
  currentTemperature: number
  highTemperature: number
  hourly: WeatherHourlyPoint[]
  isDay: boolean
  locationLabel: string
  lowTemperature: number
  weatherCode: number
}

interface WeatherHourlyPoint {
  label: string
  temperature: number
}

type WeatherLoadState = 'loading' | 'ready' | 'error'

type WeatherGlyphKind =
  | 'clear'
  | 'cloud'
  | 'fog'
  | 'mixed'
  | 'rain'
  | 'snow'
  | 'storm'

const mariborWeatherLocation: WeatherLocation = {
  label: 'Maribor',
  latitude: 46.5547,
  longitude: 15.6459,
}

const reverseGeocodeFallbackLabel = 'Current location'
const hourlyPreviewCount = 5

function clampHourlyStartIndex(currentTime: string, hourlyTimes: string[]) {
  const currentIndex = hourlyTimes.findIndex((hourlyTime) => hourlyTime === currentTime)

  if (currentIndex >= 0) {
    return currentIndex
  }

  const nextIndex = hourlyTimes.findIndex((hourlyTime) => hourlyTime > currentTime)
  return nextIndex >= 0 ? nextIndex : 0
}

function formatHourLabel(time: string, isFirstPoint: boolean) {
  if (isFirstPoint) {
    return 'Now'
  }

  const timePart = time.split('T')[1] ?? '00:00'
  const [hoursText = '0', minutesText = '0'] = timePart.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return timePart
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
  }).format(new Date(2000, 0, 1, hours, minutes))
}

function getWeatherConditionLabel(weatherCode: number, isDay: boolean) {
  if (weatherCode === 0) {
    return isDay ? 'Sunny' : 'Clear'
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return 'Partly cloudy'
  }

  if (weatherCode === 3) {
    return 'Cloudy'
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return 'Fog'
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return 'Drizzle'
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return 'Rain'
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return 'Snow'
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return 'Thunderstorm'
  }

  return 'Variable'
}

function getWeatherGlyphKind(weatherCode: number): WeatherGlyphKind {
  if (weatherCode === 0) {
    return 'clear'
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return 'mixed'
  }

  if (weatherCode === 3) {
    return 'cloud'
  }

  if (weatherCode === 45 || weatherCode === 48) {
    return 'fog'
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return 'rain'
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return 'snow'
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return 'storm'
  }

  return 'cloud'
}

async function fetchWeatherForecast(
  location: WeatherLocation,
  signal: AbortSignal,
): Promise<OpenMeteoForecastResponse> {
  const searchParams = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: 'temperature_2m,apparent_temperature,weather_code,is_day',
    hourly: 'temperature_2m',
    daily: 'temperature_2m_max,temperature_2m_min',
    forecast_days: '1',
    timezone: 'auto',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}.`)
  }

  return (await response.json()) as OpenMeteoForecastResponse
}

async function reverseGeocodeLocationLabel(
  latitude: number,
  longitude: number,
  signal: AbortSignal,
): Promise<string> {
  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    lat: latitude.toString(),
    lon: longitude.toString(),
    zoom: '10',
  })
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`,
    {
      headers: {
        Accept: 'application/json',
      },
      signal,
    },
  )

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as {
    address?: {
      city?: string
      municipality?: string
      town?: string
      village?: string
    }
    name?: string
  }

  return (
    payload.address?.city ??
    payload.address?.town ??
    payload.address?.municipality ??
    payload.address?.village ??
    payload.name ??
    reverseGeocodeFallbackLabel
  )
}

function buildWeatherSnapshot(
  locationLabel: string,
  forecast: OpenMeteoForecastResponse,
): WeatherSnapshot {
  const currentTemperature = forecast.current.temperature_2m
  const apparentTemperature = forecast.current.apparent_temperature
  const highTemperature = forecast.daily.temperature_2m_max[0] ?? currentTemperature
  const lowTemperature = forecast.daily.temperature_2m_min[0] ?? currentTemperature
  const startIndex = clampHourlyStartIndex(forecast.current.time, forecast.hourly.time)
  const hourly = forecast.hourly.time
    .slice(startIndex, startIndex + hourlyPreviewCount)
    .map((time, index) => ({
      label: formatHourLabel(time, index === 0),
      temperature: forecast.hourly.temperature_2m[startIndex + index] ?? currentTemperature,
    }))

  return {
    apparentTemperature,
    conditionLabel: getWeatherConditionLabel(
      forecast.current.weather_code,
      forecast.current.is_day === 1,
    ),
    currentTemperature,
    highTemperature,
    hourly,
    isDay: forecast.current.is_day === 1,
    locationLabel,
    lowTemperature,
    weatherCode: forecast.current.weather_code,
  }
}

function formatRoundedTemperature(temperature: number | null) {
  if (temperature === null) {
    return '--'
  }

  return Math.round(temperature).toString()
}

function getGeolocationErrorMessage(error: unknown) {
  const errorCode =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number'
      ? error.code
      : null

  if (errorCode === 1) {
    return 'Location access denied'
  }

  if (errorCode === 2) {
    return 'Location unavailable'
  }

  if (errorCode === 3) {
    return 'Location request timed out'
  }

  return 'Unable to refresh location'
}

function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12.85 6.2A4.95 4.95 0 0 0 3.5 4.65"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.45 2.75v2.15H5.6"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.15 9.8a4.95 4.95 0 0 0 9.35 1.55"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.55 13.25v-2.15H10.4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WeatherGlyph({
  isDay,
  weatherCode,
}: {
  isDay: boolean
  weatherCode: number
}) {
  const glyphKind = getWeatherGlyphKind(weatherCode)

  if (glyphKind === 'clear') {
    return isDay ? (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="3.35" fill="currentColor" />
        <path
          d="M10 1.9V4.1M10 15.9V18.1M18.1 10H15.9M4.1 10H1.9M15.6 4.4L14.05 5.95M5.95 14.05L4.4 15.6M15.6 15.6L14.05 14.05M5.95 5.95L4.4 4.4"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    ) : (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M13.8 3.3c-1.15.28-2.2.95-2.95 1.9a5.7 5.7 0 0 0-1.1 3.42c0 3.1 2.5 5.61 5.6 5.61.55 0 1.1-.08 1.61-.24a6.6 6.6 0 0 1-4.74 2.01 6.67 6.67 0 1 1 1.58-13.7Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (glyphKind === 'mixed') {
    return (
      <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <circle cx="8" cy="7" r="2.7" fill="currentColor" opacity={isDay ? '0.86' : '0.58'} />
        <path
          d="M8 2.4v1.45M8 10.15v1.45M12.6 7H11.15M4.85 7H3.4M10.95 4.05l-.98.98M6.03 8.97l-.98.98"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={isDay ? '0.86' : '0.58'}
        />
        <path
          d="M7.7 16.1h8.05a2.85 2.85 0 0 0 .36-5.68A4.25 4.25 0 0 0 8 11.15a2.55 2.55 0 0 0-.3 4.95Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (glyphKind === 'fog') {
    return (
      <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <path
          d="M6.6 12.65h8.8a2.9 2.9 0 0 0 .34-5.77 4.33 4.33 0 0 0-8.16.82A2.55 2.55 0 0 0 6.6 12.65Z"
          fill="currentColor"
        />
        <path
          d="M5 15.35h12M6.4 17.55h9.2"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.72"
        />
      </svg>
    )
  }

  if (glyphKind === 'rain') {
    return (
      <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <path
          d="M6.6 11.7h8.8a2.9 2.9 0 0 0 .34-5.77 4.33 4.33 0 0 0-8.16.82A2.55 2.55 0 0 0 6.6 11.7Z"
          fill="currentColor"
        />
        <path
          d="M8.15 13.75l-1.1 2.2M12 13.75l-1.1 2.2M15.85 13.75l-1.1 2.2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.82"
        />
      </svg>
    )
  }

  if (glyphKind === 'snow') {
    return (
      <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <path
          d="M6.6 11.7h8.8a2.9 2.9 0 0 0 .34-5.77 4.33 4.33 0 0 0-8.16.82A2.55 2.55 0 0 0 6.6 11.7Z"
          fill="currentColor"
        />
        <path
          d="M8.4 14.1v2.3M7.25 15.25h2.3M12 14.1v2.3M10.85 15.25h2.3M15.6 14.1v2.3M14.45 15.25h2.3"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.84"
        />
      </svg>
    )
  }

  if (glyphKind === 'storm') {
    return (
      <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
        <path
          d="M6.6 11.4h8.8a2.9 2.9 0 0 0 .34-5.77 4.33 4.33 0 0 0-8.16.82A2.55 2.55 0 0 0 6.6 11.4Z"
          fill="currentColor"
        />
        <path
          d="M11.4 11.95 9.4 15.1h1.85l-1 2.3 3-4.05H11.6l1.1-1.4Z"
          fill="currentColor"
          opacity="0.94"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 22 20" fill="none" aria-hidden="true">
      <path
        d="M6.6 12.2h8.8a2.9 2.9 0 0 0 .34-5.77 4.33 4.33 0 0 0-8.16.82A2.55 2.55 0 0 0 6.6 12.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null)
  const [loadState, setLoadState] = useState<WeatherLoadState>('loading')
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false)
  const [refreshStatusMessage, setRefreshStatusMessage] = useState<string | null>(null)
  const requestCounterRef = useRef(0)
  const activeAbortControllerRef = useRef<AbortController | null>(null)
  const snapshotRef = useRef<WeatherSnapshot | null>(null)

  useEffect(() => {
    return () => {
      activeAbortControllerRef.current?.abort()
    }
  }, [])

  const commitSnapshot = useCallback(
    async (location: WeatherLocation, resolveLocationLabel: boolean) => {
      const requestId = requestCounterRef.current + 1
      requestCounterRef.current = requestId
      activeAbortControllerRef.current?.abort()
      const abortController = new AbortController()
      activeAbortControllerRef.current = abortController

      try {
        const forecast = await fetchWeatherForecast(location, abortController.signal)
        let resolvedLabel = location.label

        if (resolveLocationLabel) {
          try {
            resolvedLabel = await reverseGeocodeLocationLabel(
              location.latitude,
              location.longitude,
              abortController.signal,
            )
          } catch {
            resolvedLabel = reverseGeocodeFallbackLabel
          }
        }

        if (requestCounterRef.current !== requestId || abortController.signal.aborted) {
          return
        }

        const nextSnapshot = buildWeatherSnapshot(resolvedLabel, forecast)
        snapshotRef.current = nextSnapshot
        setSnapshot(nextSnapshot)
        setLoadState('ready')
      } catch (error) {
        if (
          requestCounterRef.current === requestId &&
          !abortController.signal.aborted &&
          snapshotRef.current === null
        ) {
          setLoadState('error')
        }

        throw error
      }
    },
    [],
  )

  useEffect(() => {
    setRefreshStatusMessage(null)
    setLoadState('loading')
    void commitSnapshot(mariborWeatherLocation, false).catch((error: unknown) => {
      if (
        error instanceof Error &&
        error.name === 'AbortError'
      ) {
        return
      }
    })
  }, [commitSnapshot])

  const refreshUsingCurrentLocation = async () => {
    if (isRefreshingLocation || typeof navigator === 'undefined') {
      return
    }

    if (!navigator.geolocation) {
      setRefreshStatusMessage('Location unavailable in this browser')
      return
    }

    setIsRefreshingLocation(true)
    setRefreshStatusMessage(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          maximumAge: 300000,
          timeout: 8000,
        })
      })

      await commitSnapshot(
        {
          label: reverseGeocodeFallbackLabel,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        true,
      )
    } catch (error: unknown) {
      const hasGeolocationCode =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'number'

      setRefreshStatusMessage(
        hasGeolocationCode ? getGeolocationErrorMessage(error) : 'Unable to refresh weather',
      )
    } finally {
      setIsRefreshingLocation(false)
    }
  }

  const displayLocationLabel = snapshot?.locationLabel ?? mariborWeatherLocation.label
  const displayTemperature = snapshot?.currentTemperature ?? null
  const displayConditionLabel =
    snapshot?.conditionLabel ?? (loadState === 'error' ? 'Unavailable' : 'Loading weather')
  const displayHighTemperature = snapshot?.highTemperature ?? null
  const displayLowTemperature = snapshot?.lowTemperature ?? null
  const displayHourly = snapshot?.hourly ?? []

  return (
    <section
      className={['weather-widget', className].filter(Boolean).join(' ')}
      aria-label={`Weather in ${displayLocationLabel}`}
    >
      <div className="weather-widget__surface">
        <header className="weather-widget__header">
          <div className="weather-widget__location-block">
            <p className="weather-widget__eyebrow">Weather</p>
            <h2 className="weather-widget__location">{displayLocationLabel}</h2>
          </div>
        </header>

        <div className="weather-widget__body">
          <div className="weather-widget__main">
            <div className="weather-widget__temperature-block">
              <p className="weather-widget__temperature">
                {formatRoundedTemperature(displayTemperature)}
                <span className="weather-widget__temperature-unit">°</span>
              </p>
              <p className="weather-widget__feels-like">
                Feels like {formatRoundedTemperature(snapshot?.apparentTemperature ?? null)}°
              </p>
            </div>

            <div className="weather-widget__condition">
              <span className="weather-widget__condition-glyph" aria-hidden="true">
                <WeatherGlyph isDay={snapshot?.isDay ?? true} weatherCode={snapshot?.weatherCode ?? 3} />
              </span>
              <div className="weather-widget__condition-copy">
                <p className="weather-widget__condition-label">{displayConditionLabel}</p>
                <p className="weather-widget__range">
                  H {formatRoundedTemperature(displayHighTemperature)}° · L{' '}
                  {formatRoundedTemperature(displayLowTemperature)}°
                </p>
              </div>
            </div>
          </div>

          <footer className="weather-widget__footer">
            <div className="weather-widget__hourly">
              {displayHourly.length > 0 ? (
                <ol className="weather-widget__hourly-list" aria-label="Hourly preview">
                  {displayHourly.map((hourlyPoint) => (
                    <li key={hourlyPoint.label} className="weather-widget__hourly-point">
                      <span className="weather-widget__hourly-label">{hourlyPoint.label}</span>
                      <span className="weather-widget__hourly-temp">
                        {formatRoundedTemperature(hourlyPoint.temperature)}°
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <span className="weather-widget__hourly-placeholder">
                  {loadState === 'error' ? 'Forecast unavailable' : 'Loading forecast'}
                </span>
              )}
            </div>

            <button
              type="button"
              className="weather-widget__refresh"
              data-weather-widget-interactive="true"
              aria-label={
                refreshStatusMessage
                  ? `${refreshStatusMessage}. Refresh weather using current location`
                  : 'Refresh weather using current location'
              }
              onClick={() => {
                void refreshUsingCurrentLocation()
              }}
              onPointerDown={(event) => {
                event.stopPropagation()
              }}
              title={refreshStatusMessage ?? 'Refresh weather using current location'}
              disabled={isRefreshingLocation}
            >
              <RefreshIcon
                className={
                  isRefreshingLocation || (loadState === 'loading' && snapshot === null)
                    ? 'weather-widget__refresh-icon is-spinning'
                    : 'weather-widget__refresh-icon'
                }
              />
            </button>
          </footer>
        </div>
      </div>
    </section>
  )
}
