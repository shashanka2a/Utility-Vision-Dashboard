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
  const initial = initialReports ?? [];
  const [reports, setReports] = useState<Report[]>(initial);
  // Show spinner when SSR returned no rows so we still run the client fetch and don't flash "No reports".
  const [loading, setLoading] = useState(initial.length === 0);

  useEffect(() => {
    if (initial.length > 0) return;

    async function fetchReports() {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        if (!res.ok) {
          console.error('Reports API error:', data?.error || res.status);
          setReports([]);
          return;
        }
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [initial.length]);

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