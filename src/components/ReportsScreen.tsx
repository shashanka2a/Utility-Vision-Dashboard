import { Calendar, SlidersHorizontal, FileDown } from 'lucide-react';
import { ReportCard } from './ReportCard';

const mockReports = [
  {
    id: '1',
    projectName: 'Storey Bend Wicking Project',
    date: '2026-02-05',
    timestamp: '1:43 AM | 2026-02-06 for 2026-02-05',
    weather: {
      high: 45,
      low: 58,
      condition: 'rainy' as const
    },
    photos: [
      'https://images.unsplash.com/photo-1699625809637-31c6f327ac96?w=200&h=200&fit=crop'
    ],
    delays: 0
  },
  {
    id: '2',
    projectName: 'Redlands Wicking Project',
    date: '2026-02-05',
    timestamp: '11:00 PM | 2026-02-05 for 2026-02-05',
    weather: {
      high: 47,
      low: 76,
      condition: 'rainy' as const
    },
    photos: [
      'https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1666136788646-60ab596ef775?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1699625809637-31c6f327ac96?w=200&h=200&fit=crop'
    ],
    delays: 1
  },
  {
    id: '3',
    projectName: 'Redlands Wicking Project',
    date: '2026-02-04',
    timestamp: '4:07 AM | 2026-02-05 for 2026-02-04',
    weather: {
      high: 48,
      low: 72,
      condition: 'sunny' as const
    },
    photos: [
      'https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=200&h=200&fit=crop'
    ],
    delays: 0
  }
];

export function ReportsScreen() {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl">Reports</h1>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
            <Calendar className="w-4 h-4 text-gray-700" />
            <span>Last 30 Days</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-700" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="p-6 space-y-4">
        {mockReports.map(report => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}