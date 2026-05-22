'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  Map, 
  Wind, 
  Thermometer, 
  Flame, 
  Radio,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface IMineItem {
  _id: string;
  name: string;
  location: string;
  status: string;
  zones: string[];
  productionTarget: number;
  environmentalData: {
    aqi: number;
    temperature: number;
    humidity: number;
    methane: number;
    carbonMonoxide: number;
    noiseLevel: number;
  };
}

export default function SitesPage() {
  const [mines, setMines] = useState<IMineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMine, setSelectedMine] = useState<IMineItem | null>(null);
  
  // Forecast states
  const [forecasting, setForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);

  const loadMines = async () => {
    try {
      const { data } = await api.get('/mines');
      setMines(data.data.mines);
      if (data.data.mines.length > 0 && !selectedMine) {
        setSelectedMine(data.data.mines[0]);
      }
    } catch (err) {
      console.error('Failed to load mine locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMines();
  }, []);

  const handleFetchForecast = async () => {
    if (!selectedMine || forecasting) return;

    setForecasting(true);
    setForecastResult(null);
    try {
      const { data } = await api.get(`/ai/forecast?mineId=${selectedMine._id}`);
      setForecastResult(data.data.forecast);
    } catch (err) {
      console.error('Failed to calculate production forecast', err);
    } finally {
      setForecasting(false);
    }
  };

  useEffect(() => {
    setForecastResult(null);
  }, [selectedMine]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white">Mining Sites & Zones</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage active excavation shafts, environmental sensors, and linear production forecasting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Mine Sites Register */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h2 className="text-base font-bold font-outfit text-white mb-4">Location Registers</h2>

            {loading ? (
              <span className="text-zinc-600 text-xs italic block py-8 text-center">Loading site locations...</span>
            ) : mines.length === 0 ? (
              <span className="text-zinc-600 text-xs italic block py-8 text-center">No locations registered yet. Contact admin to seed.</span>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mines.map((mine) => (
                  <div 
                    key={mine._id}
                    onClick={() => setSelectedMine(mine)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 relative ${
                      selectedMine?._id === mine._id 
                        ? 'border-emerald-500/30 bg-zinc-900/50' 
                        : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-xs text-white block">{mine.name}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">Coordinates: {mine.location}</span>
                      </div>
                      
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        mine.status === 'Active' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-900 text-zinc-400'
                      }`}>
                        {mine.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {mine.zones.map((zone, i) => (
                        <span key={i} className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Forecasting & Environmental Sensor panels */}
        <div className="space-y-6">
          {selectedMine ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Mine Particulars</span>
                <span className="font-bold text-lg text-white font-outfit block">{selectedMine.name}</span>
                <span className="text-zinc-400 text-xs block mt-1">Status: {selectedMine.status}</span>
              </div>

              {/* Environmental Detector Panel */}
              <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl space-y-3 text-xs">
                <span className="font-bold text-white block flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400" /> Active Shaft Sensors
                </span>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex gap-2 items-center">
                    <Wind className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Air Quality</span>
                      <span className="font-bold text-white">{selectedMine.environmentalData.aqi} AQI</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Thermometer className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Heat / Humidity</span>
                      <span className="font-bold text-white">{selectedMine.environmentalData.temperature}°C</span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center col-span-2">
                    <Flame className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="text-[9px] text-zinc-500 block">Atmospheric Methane</span>
                      <span className="font-bold text-white">{selectedMine.environmentalData.methane}% volume</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Forecasting Trigger */}
              <div className="space-y-4 pt-4 border-t border-zinc-900">
                <button
                  onClick={handleFetchForecast}
                  disabled={forecasting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Sparkles className="w-4 h-4" /> Calculate AI Yield Forecast
                </button>

                {forecastResult && (
                  <div className="bg-zinc-900/40 border border-emerald-500/10 p-5 rounded-xl space-y-3.5 pt-4">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <TrendingUp className="w-4.5 h-4.5" /> Output Forecasting Model
                    </span>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Upcoming Month:</span>
                        <span className="font-bold text-white">{forecastResult.forecastTonnages[0]} Tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Month + 2:</span>
                        <span className="font-bold text-white">{forecastResult.forecastTonnages[1]} Tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Confidence Metric:</span>
                        <span className="font-bold text-emerald-400">{forecastResult.confidenceScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Predicted Trend:</span>
                        <span className="font-bold text-white">{forecastResult.trend}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-zinc-600 text-xs italic block py-12 text-center">Select an active mine location to view forecasting modules.</span>
          )}
        </div>

      </div>

    </div>
  );
}
