"use client";

import { X, ChevronLeft, ChevronRight, Sun, Cloud, CloudRain, Wind, Droplets, Loader2, CloudLightning, CloudSnow } from "lucide-react";
import { format, addDays, subDays, startOfDay, endOfDay } from "date-fns";
import { 
  CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState, useMemo } from "react";

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectAddress?: string;
  zipCode?: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface WeatherData {
  temp: number;
  high: number;
  low: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  sunrise: string;
  sunset: string;
  hourly: { time: string; temp: number; condition: string }[];
}

export function WeatherModal({ 
  isOpen, 
  onClose, 
  projectName, 
  projectAddress,
  zipCode,
  selectedDate, 
  onDateChange 
}: WeatherModalProps) {
  
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const getWeatherCondition = (code: number) => {
    if (code === 0) return "Clear";
    if (code <= 3) return "Partially Cloudy";
    if (code <= 48) return "Cloudy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    if (code <= 82) return "Rain Showers";
    return "Stormy";
  };

  const WeatherIcon = ({ condition, className }: { condition: string, className?: string }) => {
    switch (condition) {
      case "Clear": return <Sun className={className || "w-6 h-6 text-yellow-400"} />;
      case "Partially Cloudy": return <Cloud className={className || "w-6 h-6 text-gray-300"} />;
      case "Cloudy": return <Cloud className={className || "w-6 h-6 text-gray-400"} />;
      case "Rainy": 
      case "Rain Showers": return <CloudRain className={className || "w-6 h-6 text-blue-400"} />;
      case "Snowy": return <CloudSnow className={className || "w-6 h-6 text-white"} />;
      case "Stormy": return <CloudLightning className={className || "w-6 h-6 text-purple-400"} />;
      default: return <Sun className={className || "w-6 h-6 text-yellow-400"} />;
    }
  };

  useEffect(() => {
    if (!isOpen || !zipCode) return;

    async function fetchWeather() {
      if (!zipCode) return;
      setLoading(true);
      try {
        // 1. Geocode Zipcode
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zipCode)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results?.length) throw new Error("Location not found");
        const { latitude, longitude } = geoData.results[0];

        // 2. Fetch Weather
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const isHistorical = new Date(dateStr) < startOfDay(new Date());
        
        const endpoint = isHistorical 
          ? `https://archive-api.open-meteo.com/v1/archive`
          : `https://api.open-meteo.com/v1/forecast`;

        const weatherParams = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          start_date: dateStr,
          end_date: dateStr,
          hourly: "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
          daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
          timezone: "auto",
          temperature_unit: "fahrenheit",
          wind_speed_unit: "mph"
        });

        const weatherRes = await fetch(`${endpoint}?${weatherParams.toString()}`);
        const data = await weatherRes.json();

        if (data.hourly && data.daily) {
          const h = data.hourly;
          const d = data.daily;
          
          // Map hourly data (take every 3 hours for the chart display in modal)
          const hourlyMapped = h.time.map((t: string, i: number) => ({
            time: format(new Date(t), "h a"),
            temp: Math.round(h.temperature_2m[i]),
            condition: getWeatherCondition(h.weather_code[i]),
            wind: Math.round(h.wind_speed_10m[i])
          })).filter((_: any, i: number) => i % 3 === 0).slice(0, 8);

          setWeather({
            temp: Math.round(h.temperature_2m[12]), // Noon temp
            high: Math.round(d.temperature_2m_max[0]),
            low: Math.round(d.temperature_2m_min[0]),
            condition: getWeatherCondition(h.weather_code[12]),
            humidity: Math.round(h.relative_humidity_2m[12]),
            windSpeed: Math.round(h.wind_speed_10m[12]),
            precipitation: h.precipitation[12],
            sunrise: d.sunrise[0] ? format(new Date(d.sunrise[0]), "h:mm a") : "—",
            sunset: d.sunset[0] ? format(new Date(d.sunset[0]), "h:mm a") : "—",
            hourly: hourlyMapped
          });
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [isOpen, zipCode, selectedDate]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] w-[95vw] p-0 overflow-hidden bg-[#1A365D] border-none shadow-2xl">
        <DialogHeader className="p-6 bg-white flex flex-row items-center justify-between border-b border-gray-100">
          <div className="flex flex-col">
            <DialogTitle className="text-xl font-bold text-gray-900">Project weather conditions</DialogTitle>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
              {projectName} | <span className="font-medium text-gray-400 normal-case">{projectAddress || zipCode}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </DialogHeader>

        <div className="p-8 pb-12 text-white min-h-[500px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
              <p className="text-lg font-medium text-blue-100">Fetching real-time data for {zipCode}...</p>
            </div>
          ) : !weather ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
               <Sun className="w-16 h-16 text-gray-500 mb-4 opacity-20" />
               <h3 className="text-xl font-bold mb-2">Weather data unavailable</h3>
               <p className="text-gray-400 max-w-sm">We couldn't retrieve weather data for this location. Please check the project's zip code setting.</p>
            </div>
          ) : (
            <>
              {/* Top Panel */}
              <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => onDateChange(subDays(selectedDate, 1))} className="p-1 hover:bg-white/10 rounded transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded flex items-center justify-center">
                        <WeatherIcon condition={weather.condition} className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{format(selectedDate, "EEEE, MMM d, yyyy")}</span>
                    </div>
                    <button onClick={() => onDateChange(addDays(selectedDate, 1))} className="p-1 hover:bg-white/10 rounded transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-300 text-base mb-2">Conditions were <span className="text-white font-bold">{weather.condition}</span></p>
                    <div className="flex items-center gap-6">
                      <span className="text-[100px] font-thin leading-[0.8] tracking-tight">{weather.temp}°</span>
                      <div className="relative">
                        <WeatherIcon condition={weather.condition} className="w-32 h-32" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[420px]">
                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                    <MetricRow label="Sunrise/Sunset" value={`${weather.sunrise}/${weather.sunset}`} />
                    <MetricRow label="Hi/Lo" value={`${weather.high}°/${weather.low}°`} isDark />
                    <MetricRow label="Wind" value={`${weather.windSpeed} MPH`} />
                    <MetricRow label="Humidity" value={`${weather.humidity}%`} isDark />
                    <MetricRow label="Precipitation" value={`${weather.precipitation}"`} />
                  </div>
                </div>
              </div>

              {/* Hourly Chart */}
              <div className="mt-12 bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-2 mb-10">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hourly Comparison</span>
                </div>
                
                <div className="h-[220px] relative px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weather.hourly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                      <Area type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex items-end justify-between pointer-events-none px-4 pb-2">
                    {weather.hourly.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <p className="text-[14px] font-bold mb-3">{item.temp}°</p>
                        <WeatherIcon condition={item.condition} className="w-6 h-6 mb-2" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.condition}</p>
                        <p className="text-[11px] font-bold text-gray-200 mt-4">{item.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricRow({ label, value, isDark }: { label: string, value: string, isDark?: boolean }) {
  return (
    <div className={`grid grid-cols-[1fr_auto] items-center px-4 py-3 border-b border-white/5 ${isDark ? 'bg-white/[0.02]' : ''} last:border-0`}>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
