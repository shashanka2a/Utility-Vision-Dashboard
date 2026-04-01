"use client";

import { X, ChevronLeft, ChevronRight, Sun, Cloud, CloudRain, Wind, Droplets, ArrowRight, ArrowLeft } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectAddress?: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function WeatherModal({ 
  isOpen, 
  onClose, 
  projectName, 
  projectAddress = "Tech City Circle, Alachua, FL, 32615, US",
  selectedDate, 
  onDateChange 
}: WeatherModalProps) {
  
  // Mock hourly data — in a real app, this would be fetched from a weather API
  const hourlyData = [
    { time: '12 PM', temp: 82, condition: 'Clear' },
    { time: '1 PM', temp: 85, condition: 'Clear' },
    { time: '2 PM', temp: 88, condition: 'Clear' },
    { time: '3 PM', temp: 89, condition: 'Clear' },
    { time: '4 PM', temp: 89, condition: 'Clear' },
    { time: '5 PM', temp: 89, condition: 'Clear' },
    { time: '6 PM', temp: 87, condition: 'Partially Cloudy' },
    { time: '7 PM', temp: 84, condition: 'Cloudy' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[1000px] p-0 overflow-hidden bg-[#1A365D] border-none shadow-2xl">
        <DialogHeader className="p-6 bg-white flex flex-row items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <DialogTitle className="text-xl font-bold text-gray-900">Project weather conditions</DialogTitle>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
              {projectName} | <span className="font-medium text-gray-400 normal-case">{projectAddress}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogHeader>

        {/* Main Content Area - Dark Blue Theme */}
        <div className="p-8 pb-12 text-white">
          {/* Top Panel: Date Selector & Main Stats */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Box: Main Temp */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => onDateChange(subDays(selectedDate, 1))} className="p-1 hover:bg-white/10 rounded transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm">{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
                </div>
                <button onClick={() => onDateChange(addDays(selectedDate, 1))} className="p-1 hover:bg-white/10 rounded transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-300 text-base mb-2">Conditions were <span className="text-white font-bold">Clear</span></p>
                <div className="flex items-center gap-6">
                  <span className="text-[100px] font-thin leading-[0.8] tracking-tight">89°</span>
                  <div className="relative">
                    <Sun className="w-32 h-32 text-yellow-400" strokeWidth={1} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Detail Table */}
            <div className="w-full lg:w-[480px]">
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="grid grid-cols-[1fr_auto] items-center px-4 py-3 border-b border-white/5">
                  <span className="text-xs text-gray-400 font-medium">Sunrise/Sunset</span>
                  <span className="text-sm font-semibold">7:45 AM/7:34 PM</span>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <span className="text-xs text-gray-400 font-medium">Hi/Lo</span>
                  <span className="text-sm font-semibold">89°<span className="text-gray-400 font-normal">/</span>58°</span>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center px-4 py-3 border-b border-white/5">
                  <span className="text-xs text-gray-400 font-medium">Wind</span>
                  <span className="text-sm font-semibold">11 MPH W</span>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <span className="text-xs text-gray-400 font-medium">Humidity</span>
                  <span className="text-sm font-semibold">68%</span>
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center px-4 py-3">
                  <span className="text-xs text-gray-400 font-medium">Precipitation</span>
                  <span className="text-sm font-semibold">0"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Hourly Chart */}
          <div className="mt-12 bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-8">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hourly</span>
            </div>
            
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: '#2C5282', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Data Overlay */}
              <div className="absolute inset-0 flex items-end justify-between pointer-events-none px-4 pb-2">
                {hourlyData.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    <div className="text-center">
                      <p className="text-[14px] font-bold mb-0.5">{item.temp}°</p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8">
                       {item.condition === 'Clear' ? <Sun className="w-6 h-6 text-yellow-400" /> : <Cloud className="w-6 h-6 text-gray-300" />}
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{item.condition}</p>
                      <div className="flex items-center justify-center gap-1 mt-1 opacity-60">
                        <Wind className="w-3 h-3" />
                        <span className="text-[9px] font-bold">11 MPH WSW</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-gray-200 mt-2">{item.time}</p>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows for chart (decorative for now) */}
              <button className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="absolute -right-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
