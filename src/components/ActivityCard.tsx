"use client";

import { ChevronDown, Calendar } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Activity } from "./ActivityScreen";
import { ImageViewer } from "./ImageViewer";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean; index: number }>({
    isOpen: false,
    index: 0
  });

  const noteContent = activity.metrics?.find((m: any) => {
    const l = (m.label || m.name || '').toLowerCase();
    return (
      l === 'description' || l === 'note' || l === 'content' || 
      l === 'details' || l === 'comment' || l === 'message' || 
      l === 'general note' || l === 'text' ||
      l.includes('note') || l.includes('desc')
    );
  })?.value;

  const otherMetrics = activity.metrics.filter(m => 
    !m.highlight && 
    !m.label.toLowerCase().includes('note') && 
    !m.label.toLowerCase().includes('desc')
  );

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200"
      role="article"
      aria-label={`Activity by ${activity.employeeName}`}
    >
      {/* Main Card Content */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0 flex flex-col pt-0.5">
              {/* Header Info */}
              <p className="text-[15px] text-gray-800 leading-snug">
                <span className="font-semibold text-gray-900">{activity.employeeName}</span>
                {' '}{activity.action.replace(' in', '')} in{' '}
                <span className="text-gray-800">{activity.project}</span>
              </p>

              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <span>{activity.timestamp}</span>
              </div>

              {/* Note/Description - Always Visible */}
              {noteContent && (
                <div className="mt-4 p-3.5 bg-blue-50/50 border border-blue-100/50 rounded-xl">
                  <p className="text-[14px] text-gray-700 italic leading-relaxed">
                    "{noteContent}"
                  </p>
                </div>
              )}

              {/* Photo Previews - Always Visible */}
              {activity.photos.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {activity.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerState({ isOpen: true, index });
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0 relative group overflow-hidden rounded-xl border border-gray-100 hover:border-[#FF6633] transition-all focus:outline-none shadow-sm hover:shadow-md bg-gray-50"
                      aria-label={`View photo ${index + 1}`}
                    >
                      <Image 
                        src={photo} 
                        alt={`Activity photo ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* Highlighted Metrics */}
              {activity.metrics.filter(m => m.highlight).map((metric, index) => (
                <div key={index} className="mt-5 flex items-baseline gap-1.5 pb-1">
                  <span className="text-[15px] text-gray-700 uppercase tracking-tight font-medium">{metric.label} |</span>
                  <span className="text-[15px] font-bold text-[#2196F3]">{metric.value}</span>
                  {metric.unit && <span className="text-[13px] text-gray-500">{metric.unit}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Side Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
             >
                View details
             </button>
             {otherMetrics.length > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
             )}
          </div>
        </div>

        {/* Collapsible Secondary Metrics */}
        {isExpanded && otherMetrics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            {otherMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0 pb-1">
                <span className="text-sm text-gray-500">{metric.label}</span>
                <div className="flex items-baseline gap-1">
                   <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                   {metric.unit && <span className="text-xs text-gray-400">{metric.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted Form Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Activity Details</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{activity.activityType} • {activity.project}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronDown className="w-6 h-6 text-gray-400 rotate-90" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8 py-6 bg-gray-50 rounded-2xl px-6 border border-gray-100">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</p>
                  <p className="text-sm font-bold text-gray-900">{activity.employeeName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</p>
                  <p className="text-sm font-bold text-gray-900">{activity.timestamp}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Action Outcome</p>
                  <p className="text-sm font-bold text-gray-900">{activity.action.replace(' in', '')}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Submission Data</h3>
                <div className="space-y-3">
                  {activity.metrics.map((metric, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-[15px] text-gray-600">{metric.label}</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[15px] font-bold text-gray-900">{metric.value}</span>
                        {metric.unit && <span className="text-xs text-gray-500">{metric.unit}</span>}
                      </div>
                    </div>
                  ))}
                  {activity.metrics.length === 0 && <p className="text-sm text-gray-400 italic">No field data recorded.</p>}
                </div>
              </div>

              {activity.photos.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Attachments ({activity.photos.length})</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {activity.photos.map((photo, index) => (
                      <div key={index} className="aspect-square relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner">
                        <Image src={photo} alt={`Detail ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rich Image Viewer */}
      <ImageViewer 
        isOpen={viewerState.isOpen}
        photos={activity.photos}
        initialIndex={viewerState.index}
        onClose={() => setViewerState({ ...viewerState, isOpen: false })}
        metadata={{
          fileName: activity.photos[viewerState.index]?.split('/').pop(),
          uploadedBy: activity.employeeName,
          date: activity.timestamp,
          description: noteContent,
          project: activity.project,
        }}
      />
    </div>
  );
}
