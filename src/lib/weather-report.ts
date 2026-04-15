import type { ProjectRow } from '@/lib/resolve-project';

export type DayWeatherReport = {
  highF: number;
  lowF: number;
  conditionLabel: string;
  wmoCode: number;
  precipInches: number | null;
  windMph: number | null;
};

/** Map WMO code to ReportCard icon bucket (sunny / rainy / cloudy). */
export function wmoToCardCondition(code: number): 'sunny' | 'rainy' | 'cloudy' {
  if (code === 0) return 'sunny';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) return 'rainy';
  return 'cloudy';
}

function wmoToLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Cloudy / fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain showers';
  return 'Storms / heavy precip';
}

/** Match sidebar: historical days use archive API, today/future use forecast. */
function isHistoricalDate(dateYmd: string): boolean {
  const d = new Date(`${dateYmd}T12:00:00`);
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  return d < startToday;
}

/**
 * Daily summary for the report date at the project location (Open-Meteo, same source as dashboard weather).
 */
export async function fetchDayWeatherForReport(
  project: Pick<ProjectRow, 'zip_code' | 'city' | 'state'>,
  dateYmd: string
): Promise<DayWeatherReport | null> {
  const zip = project.zip_code?.trim();
  const cityState = [project.city?.trim(), project.state?.trim()].filter(Boolean).join(', ');
  const geoQuery = zip || cityState || '';
  if (!geoQuery) return null;

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(geoQuery)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) return null;
    const geoData = (await geoRes.json()) as { results?: { latitude: number; longitude: number }[] };
    const hit = geoData.results?.[0];
    if (!hit) return null;

    const { latitude, longitude } = hit;
    const endpoint = isHistoricalDate(dateYmd)
      ? 'https://archive-api.open-meteo.com/v1/archive'
      : 'https://api.open-meteo.com/v1/forecast';

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      start_date: dateYmd,
      end_date: dateYmd,
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max',
      timezone: 'auto',
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      precipitation_unit: 'inch',
    });

    const wRes = await fetch(`${endpoint}?${params.toString()}`);
    if (!wRes.ok) return null;
    const wData = (await wRes.json()) as {
      daily?: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
        precipitation_sum?: (number | null)[];
        wind_speed_10m_max?: (number | null)[];
      };
    };

    const d = wData.daily;
    if (!d?.temperature_2m_max?.length || !d.temperature_2m_min?.length || !d.weather_code?.length) return null;

    const i = 0;
    const highF = Math.round(d.temperature_2m_max[i]!);
    const lowF = Math.round(d.temperature_2m_min[i]!);
    const wmoCode = d.weather_code[i] ?? 0;
    const precip = d.precipitation_sum?.[i];
    const wind = d.wind_speed_10m_max?.[i];

    return {
      highF,
      lowF,
      conditionLabel: wmoToLabel(wmoCode),
      wmoCode,
      precipInches: typeof precip === 'number' && Number.isFinite(precip) ? precip : null,
      windMph: typeof wind === 'number' && Number.isFinite(wind) ? Math.round(wind) : null,
    };
  } catch {
    return null;
  }
}
