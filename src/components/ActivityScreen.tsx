import { Calendar, SlidersHorizontal, Search, LayoutGrid } from 'lucide-react';
import { ActivityCard } from './ActivityCard';

const mockActivities = [
  {
    id: '1',
    employeeName: 'Ricky Smith',
    action: 'submitted a material log in',
    project: 'Storey Bend Wicking Project',
    timestamp: 'Today at 5:32 AM',
    metrics: [
      { label: 'GREEN SPACE COMPLETED', value: '29.8', unit: 'Acres', highlight: true, id: 'ACRES-002' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1699625809637-31c6f327ac96?w=200&h=200&fit=crop'
    ]
  },
  {
    id: '2',
    employeeName: 'Ricky Smith',
    action: 'submitted a general note in',
    project: 'Storey Bend Wicking Project',
    timestamp: 'Today at 5:32 AM',
    metrics: [
      { label: 'Kubota hours', value: '4.5', unit: 'hrs' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1666136788646-60ab596ef775?w=200&h=200&fit=crop'
    ]
  },
  {
    id: '3',
    employeeName: 'Ricky Smith',
    action: 'submitted a general note in',
    project: 'Storey Bend Wicking Project',
    timestamp: 'Today at 5:31 AM',
    metrics: [
      { label: 'Tractor hours', value: '6.2', unit: 'hrs' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1699625809637-31c6f327ac96?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=200&h=200&fit=crop'
    ]
  },
  {
    id: '4',
    employeeName: 'Sarah Johnson',
    action: 'completed daily inspection for',
    project: 'Redlands Wicking Project',
    timestamp: 'Today at 8:15 AM',
    metrics: [
      { label: 'AREA COMPLETED', value: '15.2', unit: 'Acres', highlight: true, id: 'ACRES-003' }
    ],
    photos: []
  },
  {
    id: '5',
    employeeName: 'Mike Torres',
    action: 'submitted equipment maintenance log in',
    project: 'Oakwood Infrastructure',
    timestamp: 'Yesterday at 7:45 PM',
    metrics: [
      { label: 'Equipment hours', value: '4.5', unit: 'hrs' }
    ],
    photos: [
      'https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop'
    ]
  }
];

export function ActivityScreen() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Activity</h1>
            <p className="text-sm text-gray-500 mt-0.5">Recent activity across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">436 records</span>
            <span className="w-2 h-2 bg-[#4CAF50] rounded-full" aria-label="Live updates active" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search activities..."
              aria-label="Search activities"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <button 
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            aria-label="Change view layout"
          >
            <LayoutGrid className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-3">
          {mockActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
