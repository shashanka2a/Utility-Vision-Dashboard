"use client";

import { FileDown, ChevronDown, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { isUuidLike } from "@/lib/is-uuid";

const WEATHER_HEADER_ORANGE = "#FF6B35";

function formatPrecipInches(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const s = n.toFixed(2).replace(/\.?0+$/, "");
  return s || "0";
}

interface Report {
  id: string;
  projectName: string;
  /** When set, daily report API resolves by UUID (avoids name mismatch) */
  projectId?: string | null;
  date: string;
  timestamp: string;
  weather: {
    high: number;
    low: number;
    condition: 'sunny' | 'rainy' | 'cloudy';
  };
  photos: string[];
  delays: number;
}

interface ReportCardProps {
  report: Report;
}

/** Same project/date resolution as `/api/reports/daily` (iframe + PDF). */
function buildDailyReportParams(report: Report): URLSearchParams {
  const params = new URLSearchParams();
  params.set('date', report.date || new Date().toISOString().split('T')[0]);
  const name = (report.projectName || '').trim();
  if (name && !isUuidLike(name) && !/^Project [0-9a-f]{8}/i.test(name)) {
    params.set('project', name);
    return params;
  }
  const id = report.projectId || (isUuidLike(name) ? name : null);
  if (id) params.set('project_id', id.trim());
  else if (name) params.set('project', name);
  return params;
}

type LiveWeatherDetail = {
  high: number;
  low: number;
  condition: "sunny" | "rainy" | "cloudy";
  label: string;
  precipInches: number | null;
  windMph: number | null;
};

export function ReportCard({ report }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherDetail | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [attributionLocation, setAttributionLocation] = useState<string | null>(null);

  useEffect(() => {
    const params = buildDailyReportParams(report);
    setLiveWeather(null);
    setWeatherLoading(true);
    setAttributionLocation(null);

    let cancelled = false;
    fetch(`/api/weather/day?${params.toString()}`)
      .then((r) => r.json())
      .then(
        (data: {
          high?: number | null;
          low?: number | null;
          condition?: string;
          label?: string | null;
          precipInches?: number | null;
          windMph?: number | null;
          locationLabel?: string | null;
        }) => {
          if (cancelled) return;
          if (typeof data.locationLabel === "string" && data.locationLabel.trim()) {
            setAttributionLocation(data.locationLabel.trim());
          }
          if (
            typeof data.high === "number" &&
            typeof data.low === "number" &&
            data.condition &&
            typeof data.label === "string"
          ) {
            const c = data.condition;
            if (c === "sunny" || c === "rainy" || c === "cloudy") {
              setLiveWeather({
                high: data.high,
                low: data.low,
                condition: c,
                label: data.label,
                precipInches:
                  typeof data.precipInches === "number" && Number.isFinite(data.precipInches)
                    ? data.precipInches
                    : null,
                windMph:
                  typeof data.windMph === "number" && Number.isFinite(data.windMph)
                    ? data.windMph
                    : null,
              });
              setWeatherLoading(false);
              return;
            }
          }
          setWeatherLoading(false);
        }
      )
      .catch(() => {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [report.date, report.projectId, report.projectName]);

  const dailyReportQuery = () => buildDailyReportParams(report).toString();

  const downloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/api/reports/daily?${dailyReportQuery()}`, '_blank');
  };

  return (
    <div 
      className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
      role="article"
      aria-label={`Daily report for ${report.projectName}`}
    >
      {/* Card header — flex row with expand area + download button side by side */}
      <div className="flex items-stretch">
        {/* Expand area (takes up most of the row) */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-200"
          aria-expanded={isExpanded}
          aria-controls={`report-details-${report.id}`}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#E3F2FD] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-[#2196F3]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-black text-base mb-1">
                Daily Report for {report.projectName}
              </h3>
              <p className="text-xs text-gray-500">{report.timestamp}</p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {report.delays > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#FFF8E1] text-[#FFC107] border border-[#FFC107]/20">
                    <AlertCircle className="w-3 h-3" />
                    {report.delays} Delay
                  </span>
                )}

                {report.photos.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {report.photos.length} {report.photos.length === 1 ? 'photo' : 'photos'}
                  </span>
                )}
              </div>

              <div
                className="mt-3 border border-gray-200 rounded overflow-hidden bg-white text-left"
                aria-busy={weatherLoading}
              >
                <div
                  className="px-3 py-2 text-white text-sm font-bold tracking-wide uppercase text-left"
                  style={{ backgroundColor: WEATHER_HEADER_ORANGE }}
                >
                  Weather
                </div>
                <div className="grid grid-cols-3 divide-x divide-gray-200">
                  <div className="py-4 px-2 flex flex-col items-center text-center min-h-[148px]">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">High</span>
                    {weatherLoading ? (
                      <div className="mt-3 h-10 w-14 bg-gray-200 rounded animate-pulse" aria-hidden />
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-black mt-2 tabular-nums leading-none">
                          {liveWeather ? `${liveWeather.high}°` : '—'}
                        </span>
                        <span className="text-sm text-gray-600 mt-0.5">°F</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 mt-auto pt-3">Daytime high</span>
                  </div>
                  <div className="py-4 px-2 flex flex-col items-center text-center min-h-[148px]">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Low</span>
                    {weatherLoading ? (
                      <div className="mt-3 h-10 w-14 bg-gray-200 rounded animate-pulse" aria-hidden />
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-black mt-2 tabular-nums leading-none">
                          {liveWeather ? `${liveWeather.low}°` : '—'}
                        </span>
                        <span className="text-sm text-gray-600 mt-0.5">°F</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500 mt-auto pt-3">Daily low</span>
                  </div>
                  <div className="py-4 px-2 flex flex-col items-center text-center min-h-[148px]">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sky</span>
                    {weatherLoading ? (
                      <div className="mt-3 h-20 w-full max-w-[130px] bg-gray-200 rounded animate-pulse mx-auto" aria-hidden />
                    ) : (
                      <>
                        <span className="text-lg font-bold text-black mt-2 leading-tight px-1">
                          {liveWeather ? liveWeather.label : '—'}
                        </span>
                        <span className="text-sm font-bold text-black mt-1">Conditions</span>
                        <p className="text-xs text-gray-500 mt-2 leading-snug px-1">
                          Precip {liveWeather ? formatPrecipInches(liveWeather.precipInches) : '—'} in · Wind max{' '}
                          {liveWeather?.windMph != null ? `${liveWeather.windMph}` : '—'} mph
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 px-3 py-2 border-t border-gray-100 text-left">
                  Open-Meteo
                  {attributionLocation ? ` · ${attributionLocation}` : ''}
                </p>
              </div>
            </div>
          </div>
        </button>

        {/* Right-side actions — sibling, NOT nested inside the expand button */}
        <div className="flex items-center gap-0.5 pr-3 flex-shrink-0 self-stretch">
          <button
            type="button"
            onClick={downloadPDF}
            className="p-2 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44336]/40"
            aria-label="Download PDF report"
            title="Download PDF"
          >
            <FileDown className="w-4 h-4 text-[#F44336]" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
            aria-expanded={isExpanded}
            aria-controls={`report-details-${report.id}`}
            aria-label={isExpanded ? 'Collapse report' : 'Expand report'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Expanded API HTML iframe preview */}
      {isExpanded && (
        <div 
          id={`report-details-${report.id}`}
          className="border-t border-gray-100 bg-gray-50 animate-slideDown p-4"
        >
          <iframe 
             src={`/api/reports/daily?${dailyReportQuery()}`}
             className="w-full h-[600px] bg-white rounded-lg shadow-inner"
             style={{ border: 'none' }}
             title="Daily Report Preview"
          />
          <div className="pt-4 flex justify-end">
            <button
               onClick={downloadPDF}
               className="flex items-center gap-2 px-4 py-2 bg-[#F44336] text-white rounded hover:bg-[#E53935] transition-colors text-sm font-medium focus:outline-none flex-shrink-0"
            >
               <FileDown className="w-4 h-4" />
               View Full Report (Printable)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
