"use client";

import { FileDown, CloudRain, Cloud, Sun, ChevronDown, Calendar, MapPin, Users, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Report {
  id: string;
  projectName: string;
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
    alert('PDF download would start here');
  };

  return (
    <div 
      className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
      role="article"
      aria-label={`Daily report for ${report.projectName}`}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF6633]"
        aria-expanded={isExpanded}
        aria-controls={`report-details-${report.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
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
          </div>

          {/* Expand Icon & Download */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={downloadPDF}
              className="p-2 hover:bg-[#FFEBEE] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F44336]"
              aria-label="Download PDF report"
              title="Download PDF"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <FileDown className="w-4 h-4 text-[#F44336]" />
              </div>
            </button>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>

      {/* Expanded PDF Preview */}
      {isExpanded && (
        <div 
          id={`report-details-${report.id}`}
          className="border-t border-gray-100 bg-gray-50 animate-slideDown"
        >
          {/* PDF-Style Summary */}
          <div className="p-6 bg-white m-4 rounded-lg border border-gray-200 shadow-sm">
            {/* PDF Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#FF6633] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">UV</span>
                  </div>
                  <span className="font-semibold text-gray-900">Utility Vision</span>
                </div>
                <h2 className="text-xl font-bold text-black mb-1">Daily Field Report</h2>
                <p className="text-sm text-gray-600">{report.projectName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{report.date}</p>
                <p className="text-xs text-gray-500 mt-1">Report #{report.id}</p>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 gap-4 py-4 border-b border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-[#FF6633]" />
                </div>
                <p className="text-2xl font-bold text-black">{detailedReport.workers}</p>
                <p className="text-xs text-gray-500 mt-1">Workers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-[#FF6633]" />
                </div>
                <p className="text-2xl font-bold text-black">{detailedReport.hoursWorked}</p>
                <p className="text-xs text-gray-500 mt-1">Hours</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <MapPin className="w-4 h-4 text-[#FF6633]" />
                </div>
                <p className="text-2xl font-bold text-black">{detailedReport.acresCompleted}</p>
                <p className="text-xs text-gray-500 mt-1">Acres</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-[#4CAF50]" />
                </div>
                <p className="text-2xl font-bold text-black">{detailedReport.safetyIncidents}</p>
                <p className="text-xs text-gray-500 mt-1">Incidents</p>
              </div>
            </div>

            {/* Weather Details */}
            <div className="py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Weather Conditions</h3>
              <div className="flex items-center gap-2">
                <WeatherIcon className="w-5 h-5 text-[#2196F3]" />
                <span className="text-sm text-gray-700 capitalize">{report.weather.condition}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-700">
                  High: {report.weather.high}°F, Low: {report.weather.low}°F
                </span>
              </div>
            </div>

            {/* Work Completed */}
            <div className="py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Work Completed</h3>
              <ul className="space-y-2">
                {detailedReport.completed.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#4CAF50] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment */}
            <div className="py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Equipment Used</h3>
              <div className="flex flex-wrap gap-2">
                {detailedReport.equipmentUsed.map((equipment, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {equipment}
                  </span>
                ))}
              </div>
            </div>

            {/* Delays */}
            {detailedReport.delays.length > 0 && (
              <div className="py-4 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Delays & Issues</h3>
                <ul className="space-y-2">
                  {detailedReport.delays.map((delay, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle className="w-4 h-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                      <span>{delay}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            <div className="py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Supervisor Notes</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{detailedReport.notes}</p>
            </div>

            {/* Photos */}
            {report.photos.length > 0 && (
              <div className="py-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Site Photos</h3>
                <div className="grid grid-cols-4 gap-3">
                  {report.photos.map((photo, index) => (
                    <button
                      key={index}
                      className="aspect-square relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#FF6633] transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6633] focus:ring-offset-2"
                      aria-label={`View photo ${index + 1} of ${report.photos.length}`}
                    >
                      <Image
                        src={photo}
                        alt={`Report photo ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Footer */}
            <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-500">Powered by Utility Vision</p>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[#F44336] text-white rounded hover:bg-[#E53935] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F44336] focus:ring-offset-2"
              >
                <FileDown className="w-4 h-4" />
                Download Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
