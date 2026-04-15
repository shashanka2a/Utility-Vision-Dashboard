"use client";

import { FileDown, CloudRain, Cloud, Sun, ChevronDown, Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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

export function ReportCard({ report }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const WeatherIcon = report.weather.condition === 'rainy' ? CloudRain : 
                      report.weather.condition === 'sunny' ? Sun : Cloud;

  const dailyReportQuery = () => {
    const params = new URLSearchParams();
    params.set('date', report.date || new Date().toISOString().split('T')[0]);
    const name = (report.projectName || '').trim();
    // Prefer lookup by display name when it is a real project title — `projectId` from the list
    // can be a stale/wrong UUID from activities while the title matches `projects.name`.
    if (name && !isUuidLike(name) && !/^Project [0-9a-f]{8}/i.test(name)) {
      params.set('project', name);
      return params.toString();
    }
    const id = report.projectId || (isUuidLike(name) ? name : null);
    if (id) params.set('project_id', id.trim());
    else if (name) params.set('project', name);
    return params.toString();
  };

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
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633]"
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
                  <span>{report.weather.high}°/{report.weather.low}°F</span>
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
        <div className="flex items-center gap-1 pr-4 flex-shrink-0">
          <button
            onClick={downloadPDF}
            className="p-2 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            aria-label="Download PDF report"
            title="Download PDF"
          >
            <FileDown className="w-4 h-4 text-[#F44336]" />
          </button>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 pointer-events-none ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
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
