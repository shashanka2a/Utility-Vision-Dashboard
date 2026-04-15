"use client";

import { FileDown, CloudRain, Cloud, Sun, ChevronDown, Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
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

export function ReportCard({ report }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liveWeather, setLiveWeather] = useState<{
    high: number;
    low: number;
    condition: 'sunny' | 'rainy' | 'cloudy';
  } | null>(null);
  /** True after fetch when API had no numeric hi/lo (or request failed). */
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);

  useEffect(() => {
    const params = buildDailyReportParams(report);
    setLiveWeather(null);
    setWeatherUnavailable(false);

    let cancelled = false;
    fetch(`/api/weather/day?${params.toString()}`)
      .then((r) => r.json())
      .then((data: { high?: number | null; low?: number | null; condition?: string }) => {
        if (cancelled) return;
        if (typeof data.high === 'number' && typeof data.low === 'number' && data.condition) {
          const c = data.condition;
          if (c === 'sunny' || c === 'rainy' || c === 'cloudy') {
            setLiveWeather({ high: data.high, low: data.low, condition: c });
            setWeatherUnavailable(false);
            return;
          }
        }
        setWeatherUnavailable(true);
      })
      .catch(() => {
        if (!cancelled) setWeatherUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, [report.date, report.projectId, report.projectName]);

  const displayWeather = liveWeather ?? report.weather;
  const WeatherIcon =
    weatherUnavailable && !liveWeather
      ? Cloud
      : displayWeather.condition === 'rainy'
        ? CloudRain
        : displayWeather.condition === 'sunny'
          ? Sun
          : Cloud;

  const dailyReportQuery = () => buildDailyReportParams(report).toString();

  // Mock detailed data for PDF preview
  const detailedReport = {
    workers: 12,
    hoursWorked: 96,
    equipmentUsed: ['Excavator', 'Dump Truck', 'Kubota Tractor'],
    acresCompleted: 8.5,
    safetyIncidents: 0,
    notes: 'Completed section A of the wicking bed installation. Weather conditions were favorable. Team productivity was high.',
    delays: report.delays > 0 ? ['Heavy equipment delivery delayed by 2 hours'] : [],
    completed: ['Installed 250ft of drainage pipe', 'Completed soil preparation for zone 3', 'Equipment maintenance completed']
  };

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

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded">
                  <WeatherIcon className="w-4 h-4 text-[#2196F3]" />
                  <span>
                    {weatherUnavailable ? '—/—°F' : `${displayWeather.high}°/${displayWeather.low}°F`}
                  </span>
                </div>

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
