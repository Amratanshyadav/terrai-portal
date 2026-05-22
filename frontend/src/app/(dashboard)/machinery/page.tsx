'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { 
  Cpu, 
  Wrench, 
  Activity, 
  Thermometer, 
  Sparkles, 
  RefreshCw,
  PlusSquare
} from 'lucide-react';

interface IMachineItem {
  _id: string;
  name: string;
  serialNumber: string;
  type: string;
  status: string;
  hoursRun: number;
  fuelLevel: number;
  fuelCapacity: number;
  telemetry: {
    temperature: number;
    vibration: number;
    pressure: number;
    oilLevel: number;
  };
}

export default function MachineryPage() {
  const [machines, setMachines] = useState<IMachineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<IMachineItem | null>(null);
  
  // Dynamic input fields for telemetry simulation
  const [temp, setTemp] = useState(70);
  const [vib, setVib] = useState(2.1);
  const [pres, setPres] = useState(3.5);
  const [oil, setOil] = useState(90);
  
  const [evaluating, setEvaluating] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const loadMachines = async () => {
    try {
      const { data } = await api.get('/machines');
      setMachines(data.data.machines);
      if (data.data.machines.length > 0 && !selectedMachine) {
        setSelectedMachine(data.data.machines[0]);
      }
    } catch (err) {
      console.error('Failed to load machinery registry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    if (selectedMachine) {
      setTemp(selectedMachine.telemetry.temperature);
      setVib(selectedMachine.telemetry.vibration);
      setPres(selectedMachine.telemetry.pressure);
      setOil(selectedMachine.telemetry.oilLevel);
      setPredictionResult(null);
    }
  }, [selectedMachine]);

  const handleTelemetrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine || evaluating) return;

    setEvaluating(true);
    try {
      const { data } = await api.post(`/machines/${selectedMachine._id}/telemetry`, {
        temperature: Number(temp),
        vibration: Number(vib),
        pressure: Number(pres),
        oilLevel: Number(oil),
      });

      // Update selected machine and prediction results
      setSelectedMachine(data.data.machine);
      setPredictionResult(data.data.aiPrediction);
      
      // Reload list
      await loadMachines();
    } catch (err) {
      console.error('Failed to update telemetry', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white">Heavy Machinery & AI Maintenance</h1>
        <p className="text-zinc-500 text-sm mt-1">Assess active hours run, update sensor telemetries, and trigger AI failure warning assessments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Machinery Register */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h2 className="text-base font-bold font-outfit text-white mb-4">Equipment Register</h2>

            {loading ? (
              <span className="text-zinc-600 text-xs italic block py-8 text-center">Loading heavy loaders registry...</span>
            ) : machines.length === 0 ? (
              <span className="text-zinc-600 text-xs italic block py-8 text-center">No hardware units registered yet. Contact admin to seed.</span>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {machines.map((mach) => (
                  <div 
                    key={mach._id}
                    onClick={() => setSelectedMachine(mach)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 relative ${
                      selectedMachine?._id === mach._id 
                        ? 'border-emerald-500/30 bg-zinc-900/50' 
                        : 'border-zinc-900 bg-zinc-900/10 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-xs text-white block">{mach.name}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">SN: {mach.serialNumber}</span>
                      </div>
                      
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        mach.status === 'Operational' 
                          ? 'bg-emerald-950 text-emerald-400' 
                          : mach.status === 'Maintenance' 
                            ? 'bg-amber-950 text-accent-amber' 
                            : 'bg-rose-950/40 text-accent-rose'
                      }`}>
                        {mach.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900/50 pt-2.5 mt-2">
                      <span>Type: {mach.type}</span>
                      <span>Hours: {mach.hoursRun} h</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Telemetry Simulation & AI prediction response */}
        <div className="space-y-6">
          {selectedMachine ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-6">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Equipment Details</span>
                <span className="font-bold text-lg text-white font-outfit block">{selectedMachine.name}</span>
                <span className="text-zinc-400 text-xs block mt-1">Serial Number: {selectedMachine.serialNumber}</span>
              </div>

              {/* Telemetry Simulator Form */}
              <form onSubmit={handleTelemetrySubmit} className="space-y-4 pt-4 border-t border-zinc-900">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Telemetry Simulator</span>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-zinc-500 block mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Vibration (mm/s)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vib}
                      onChange={(e) => setVib(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Pressure (bar)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={pres}
                      onChange={(e) => setPres(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Oil Level (%)</label>
                    <input
                      type="number"
                      value={oil}
                      onChange={(e) => setOil(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={evaluating}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-xs py-2.5 rounded transition-all flex items-center justify-center gap-1.5"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Evaluating ML Risk...
                    </>
                  ) : (
                    'Dispatch Sensor Telemetry'
                  )}
                </button>
              </form>

              {/* ML model results */}
              {predictionResult && (
                <div className="bg-zinc-900/40 border border-emerald-500/10 p-5 rounded-xl space-y-3.5 pt-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4.5 h-4.5" /> AI Predictive Diagnostic
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Breakdown Risk:</span>
                      <span className={`font-bold ${
                        predictionResult.riskLevel === 'High' ? 'text-accent-rose' : 'text-emerald-400'
                      }`}>{predictionResult.breakdownProbability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Useful RUL Remaining:</span>
                      <span className="font-bold text-white">{predictionResult.remainingUsefulLifeHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ML Assessment:</span>
                      <span className="font-bold text-white">{predictionResult.riskLevel} Risk</span>
                    </div>
                    <div className="text-zinc-400 block mt-2 border-t border-zinc-900 pt-2 leading-relaxed">
                      {predictionResult.recommendation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-zinc-600 text-xs italic block py-12 text-center">Select an active machine to view telemetry options.</span>
          )}
        </div>

      </div>

    </div>
  );
}
