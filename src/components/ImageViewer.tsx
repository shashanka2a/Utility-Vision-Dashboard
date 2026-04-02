"use client";

import { 
  X, ChevronLeft, ChevronRight, Download, 
  Trash2, Pencil, MessageSquare, Maximize2, Share2 
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ImageViewerProps {
  photos: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  metadata?: {
    fileName?: string;
    uploadedBy?: string;
    date?: string;
    description?: string;
    project?: string;
    company?: string;
  };
}

export function ImageViewer({ photos, initialIndex, isOpen, onClose, metadata }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!isOpen) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % photos.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex animate-in fade-in duration-200">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-gray-50 border-r border-gray-100">
        {/* Top Control Bar */}
        <div className="h-14 px-4 flex items-center justify-between bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={prev} 
                disabled={photos.length <= 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <span className="text-sm font-medium text-gray-600">
                {currentIndex + 1} / {photos.length}
              </span>
              <button 
                onClick={next} 
                disabled={photos.length <= 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden group">
          <div className="relative w-full h-full max-w-4xl max-h-full">
            <Image
              src={photos[currentIndex]}
              alt="Viewing photo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Context overlay on image bottom */}
          <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white max-w-[300px]">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Project</p>
            <p className="text-sm font-semibold truncate mb-2">{metadata?.project || 'General'}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Company</p>
            <p className="text-sm font-semibold truncate mb-2">{metadata?.company || 'Wick\'d Environmental'}</p>
            <p className="text-[11px] text-gray-300">Taken: {metadata?.date?.split(' at ')[0] || 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Info Sidebar */}
      <div className="w-[350px] flex flex-col bg-white shrink-0">
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* File Name */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">File name</h3>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <Pencil className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <p className="text-[13px] text-gray-900 font-medium break-all leading-relaxed">
              {metadata?.fileName || 'image_upload_' + currentIndex + '.jpg'}
            </p>
          </section>

          {/* Uploaded By */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Uploaded by</h3>
            <p className="text-[13px] text-gray-900 font-medium">
              {metadata?.uploadedBy || 'Artifact Employee'}
            </p>
          </section>

          {/* Date */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Date</h3>
            <p className="text-[13px] text-gray-900 font-medium">
              {metadata?.date || 'Unknown'}
            </p>
          </section>

          {/* Description */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
            <p className="text-[13px] text-gray-400 leading-relaxed italic">
              {metadata?.description || 'No description provided.'}
            </p>
          </section>
        </div>

        {/* Bottom Actions/Chat icon */}
        <div className="p-6 flex justify-end">
          <div className="relative">
            <button className="w-12 h-12 bg-[#FF6633] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all">
              <MessageSquare className="w-6 h-6 fill-current" />
            </button>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
