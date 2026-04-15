"use client";

import { FileDown, ChevronDown, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { isUuidLike } from "@/lib/is-uuid";

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

function skyDetailLine(precipInches: number | null, windMph: number | null): string {
  const bits: string[] = [];
  if (precipInches != null && Number.isFinite(precipInches)) {
    bits.push(`Precip ${precipInches.toFixed(2)} in`);
  }
  if (windMph != null && Number.isFinite(windMph)) {
    bits.push(`Wind max ${windMph} mph`);
  }
  return bits.length ? bits.join(' · ') : 'Daily summary';
}

type WeatherFetchState =
  | { status: 'loading' }
  | {
      status: 'ok';
      high: number;
      low: number;
      label: string;
      precipInches: number | null;
      windMph: number | null;
      hasProjectLocation: boolean;
    }
  | { status: 'error'; hasProjectLocation: boolean };

export function ReportCard({ report }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [weatherState, setWeatherState] = useState<WeatherFetchState>({ status: 'loading' });

  const dateYmd =
    report.date && /^\d{4}-\d{2}-\d{2}/.test(report.date)
      ? report.date.slice(0, 10)
      : new Date().toISOString().split('T')[0];

  useEffect(() => {
    const params = buildDailyReportParams(report);
    setWeatherState({ status: 'loading' });

    let cancelled = false;
    fetch(`/api/weather/day?${params.toString()}`)
      .then((r) => r.json())
      .then(
        (data: {
          high?: number | null;
          low?: number | null;
          label?: string | null;
          precipInches?: number | null;
          windMph?: number | null;
          hasProjectLocation?: boolean;
        }) => {
          if (cancelled) return;
          if (
            typeof data.high === 'number' &&
            typeof data.low === 'number' &&
            typeof data.label === 'string' &&
            data.label.length > 0
          ) {
            setWeatherState({
              status: 'ok',
              high: data.high,
              low: data.low,
              label: data.label,
              precipInches: data.precipInches ?? null,
              windMph: data.windMph ?? null,
              hasProjectLocation: Boolean(data.hasProjectLocation),
            });
            return;
          }
          setWeatherState({
            status: 'error',
            hasProjectLocation: Boolean(data.hasProjectLocation),
          });
        }
      )
      .catch(() => {
        if (!cancelled) setWeatherState({ status: 'error', hasProjectLocation: false });
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

  const errorHint = weatherState.status === 'error'
    ? weatherState.hasProjectLocation
      ? 'Weather could not be loaded for this date or location (Open-Meteo).'
      : 'Add a zip code or city/state on the project to show weather.'
    : '';

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

              {/* Matches daily report HTML: Weather — date + HIGH / LOW / SKY grid */}
              <div className="mt-3 border border-[#ddd] rounded overflow-hidden bg-white text-left">
                <div className="bg-[#FF6633] text-white text-[13px] font-bold uppercase tracking-wide px-4 py-2">
                  Weather — {dateYmd}
                </div>
                {weatherState.status === 'error' ? (
                  <div className="px-5 py-3 text-[13px] text-gray-600 border-t border-[#ddd]">
                    {errorHint}
                  </div>
                ) : (
                  <div className="flex border-t border-[#ddd]">
                    <div className="flex-1 text-center px-2 py-4 border-r border-[#ddd] min-w-0">
                      <div className="text-[11px] font-bold uppercase text-gray-600 mb-1">High</div>
                      <div className="text-[28px] font-bold text-[#222] my-2 tabular-nums">
                        {weatherState.status === 'ok' ? `${weatherState.high}°` : '—'}
                      </div>
                      <div className="text-[13px] font-bold text-[#222] mb-2">°F</div>
                      <div className="text-[10px] text-[#666] leading-snug">Daytime high</div>
                    </div>
                    <div className="flex-1 text-center px-2 py-4 border-r border-[#ddd] min-w-0">
                      <div className="text-[11px] font-bold uppercase text-gray-600 mb-1">Low</div>
                      <div className="text-[28px] font-bold text-[#222] my-2 tabular-nums">
                        {weatherState.status === 'ok' ? `${weatherState.low}°` : '—'}
                      </div>
                      <div className="text-[13px] font-bold text-[#222] mb-2">°F</div>
                      <div className="text-[10px] text-[#666] leading-snug">Daily low</div>
                    </div>
                    <div className="flex-1 text-center px-2 py-4 min-w-0">
                      <div className="text-[11px] font-bold uppercase text-gray-600 mb-1">Sky</div>
                      <div
                        className="text-[20px] font-bold text-[#222] my-2 leading-tight px-1"
                        title={weatherState.status === 'ok' ? weatherState.label : undefined}
                      >
                        {weatherState.status === 'ok' ? weatherState.label : '—'}
                      </div>
                      <div className="text-[13px] font-bold text-[#222] mb-2">Conditions</div>
                      <div className="text-[10px] text-[#666] leading-snug min-h-[15px]">
                        {weatherState.status === 'ok'
                          ? skyDetailLine(weatherState.precipInches, weatherState.windMph)
                          : ''}
                      </div>
                    </div>
                  </div>
                )}
                {weatherState.status === 'ok' && (
                  <p className="text-[10px] text-[#999] px-4 py-2 border-t border-[#eee] m-0">
                    Open-Meteo · Project area (
                    {weatherState.hasProjectLocation ? 'zip or city from project record' : 'location unknown'})
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
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
