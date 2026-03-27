"use client";

import { ChevronDown, Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Activity } from "./ActivityScreen";

interface ActivityCardProps {
  activity: Activity;
}


export function ActivityCard({ activity }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      role="article"
      aria-label={`Activity by ${activity.employeeName}`}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none"
        aria-expanded={isExpanded}
        aria-controls={`activity-details-${activity.id}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0 flex flex-col pt-0.5">
              {/* Main Info */}
              <p className="text-[15px] text-gray-800 leading-snug">
                <span className="font-semibold text-gray-900">{activity.employeeName}</span>
                {' '}{activity.action.replace(' in', '')} in{' '}
                <span className="text-gray-800">{activity.project}</span>
              </p>

              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <span>{activity.timestamp}</span>
              </div>

              {/* Highlighted Metrics Preview */}
              {activity.metrics.filter(m => m.highlight).map((metric, index) => (
                <div key={index} className="mt-5 flex items-baseline gap-1.5 pb-1">
                  <span className="text-[15px] text-gray-700 uppercase">{metric.label} |</span>
                  <span className="text-[15px] font-medium text-[#2196F3]">{metric.value}</span>
                  <span className="text-[15px] text-gray-700">{metric.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expand Icon & Badges */}
          <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
            {activity.photos.length > 0 && (
              <span className="text-xs font-medium text-gray-500 px-2.5 py-1 bg-gray-100 rounded flex items-center gap-1.5">
                {activity.photos.length} {activity.photos.length === 1 ? 'photo' : 'photos'}
              </span>
            )}
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            >
              View details
            </button>
          </div>
        </div>
      )}

      {/* Submitted Form Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Submitted Form Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">{activity.activityType} • {activity.project}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="sr-only">Close</span>
                <ChevronDown className="w-5 h-5 text-gray-500 rotate-90" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Submitted By</p>
                  <p className="font-medium text-gray-900">{activity.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Timestamp</p>
                  <p className="font-medium text-gray-900">{activity.timestamp}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Action</p>
                  <p className="font-medium text-gray-900">{activity.action.replace(' in', '')}</p>
                </div>
              </div>

              {/* Form Data / Metrics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Form Data</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                  {activity.metrics.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No additional field data provided.</p>
                  ) : (
                    activity.metrics.map((metric, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-gray-200/60 last:border-0 last:pb-0">
                        <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                        <div className="mt-1 sm:mt-0 flex gap-1.5 items-baseline">
                          <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                          <span className="text-xs text-gray-500">{metric.unit}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Photos */}
              {activity.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Attachments ({activity.photos.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activity.photos.map((photo, index) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                        <Image src={photo} alt={`Attachment ${index + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
