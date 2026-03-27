"use client";

import { useState, useEffect } from 'react';
import { Calendar, SlidersHorizontal, FileDown, Loader2 } from 'lucide-react';
import { ReportCard } from './ReportCard';

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

export function ReportsScreen({ initialReports }: { initialReports?: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports || []);
  const [loading, setLoading] = useState(!initialReports);

  useEffect(() => {
    // If we have initial reports, we don't NEED to fetch immediately
    if (initialReports && initialReports.length > 0) return;
    
    async function fetchReports() {

      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        setReports(data || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Daily signed project logs</p>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Last 30 Days</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-48">
             <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex justify-center items-center h-48 text-gray-500">
             No reports generated recently.
          </div>
        ) : (
          reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </div>
    </div>
  );
}