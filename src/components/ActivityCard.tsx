"use client";

import { ChevronDown, Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ActivityMetric {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  id?: string;
}

interface Activity {
  id: string;
  employeeName: string;
  action: string;
  project: string;
  timestamp: string;
  metrics: ActivityMetric[];
  photos: string[];
}

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      role="article"
      aria-label={`Activity by ${activity.employeeName}`}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none"
        aria-expanded={isExpanded}
        aria-controls={`activity-details-${activity.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Main Info */}
            <div className="flex items-start gap-3 mb-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#FF6633] to-[#E55A2B] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {activity.employeeName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-normal">
                  <span className="font-semibold">{activity.employeeName}</span>
                  {' '}{activity.action}{' '}
                  <span className="font-medium">{activity.project}</span>
                </p>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Highlighted Metrics Preview */}
            {activity.metrics.filter(m => m.highlight).map((metric, index) => (
              <div key={index} className="mt-3 pl-12">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-500 uppercase font-medium">{metric.label}</span>
                  <span className="text-2xl font-bold text-[#FF6633]">{metric.value}</span>
                  <span className="text-sm text-gray-700">{metric.unit}</span>
                  {metric.id && (
                    <span className="text-xs text-gray-400 ml-auto">{metric.id}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Expand Icon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {activity.photos.length > 0 && (
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                {activity.photos.length} {activity.photos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div 
          id={`activity-details-${activity.id}`}
          className="px-4 pb-4 border-t border-gray-100 bg-gray-50 animate-slideDown"
        >
          {/* Additional Metrics */}
          {activity.metrics.filter(m => !m.highlight).length > 0 && (
            <div className="pt-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Additional Details
              </h4>
              {activity.metrics.filter(m => !m.highlight).map((metric, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span>{metric.label}</span>
                  {metric.value && (
                    <>
                      <span className="font-semibold text-gray-900">{metric.value}</span>
                      <span>{metric.unit}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Photos Grid */}
          {activity.photos.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Attached Photos
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {activity.photos.map((photo, index) => (
                  <button
                    key={index}
                    className="aspect-square relative group overflow-hidden rounded-lg border border-gray-200 hover:border-gray-400 transition-all focus:outline-none"
                    aria-label={`View photo ${index + 1} of ${activity.photos.length}`}
                  >
                    <Image
                      src={photo}
                      alt={`Activity photo ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-200">
            <button className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded transition-colors">
              View full details
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 hover:bg-white rounded transition-colors">
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
