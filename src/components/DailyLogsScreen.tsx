"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const mockChartData = [
  { date: 'Feb 1', storeyBend: 12, redlands: 8, oakwood: 6 },
  { date: 'Feb 2', storeyBend: 15, redlands: 10, oakwood: 7 },
  { date: 'Feb 3', storeyBend: 14, redlands: 12, oakwood: 8 },
  { date: 'Feb 4', storeyBend: 18, redlands: 11, oakwood: 9 },
  { date: 'Feb 5', storeyBend: 16, redlands: 13, oakwood: 10 },
  { date: 'Feb 6', storeyBend: 20, redlands: 15, oakwood: 11 },
];

const stats = [
  { label: 'Man Days', value: '247' },
  { label: 'Hours', value: '1,976' },
  { label: 'Safety Incidents', value: '0' },
  { label: 'Delays', value: '3' },
  { label: 'Missed Dailies', value: '1' },
  { label: 'Compliance %', value: '98.5%' },
  { label: 'Open Tasks', value: '12' },
];

export function DailyLogsScreen() {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl">Daily Logs</h1>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Workers by Project Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-medium text-gray-900 mb-6">Workers by Project</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
              />
              <Line
                type="monotone"
                dataKey="storeyBend"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Storey Bend"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="redlands"
                stroke="#10b981"
                strokeWidth={2}
                name="Redlands"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="oakwood"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Oakwood"
                dot={{ fill: '#f59e0b', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}