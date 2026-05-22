'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  ArrowLeftRight,
  Plus, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight,
  Navigation
} from 'lucide-react';

interface IVehicleLogItem {
  _id: string;
  vehicleNumber: string;
  driverName: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'In' | 'Out';
}

export default function VehiclesPage() {
  const [logs, setLogs] = useState<IVehicleLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'history'>('active');

  // Form States
  const [vNumber, setVNumber] = useState('');
  const [dName, setDName] = useState('');
  const [cInTime, setCInTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicles');
      setLogs(data.data.logs);
    } catch (err) {
      console.error('Failed to load vehicle movement logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vNumber.trim() || !dName.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post('/vehicles/check-in', {
        vehicleNumber: vNumber,
        driverName: dName,
        checkInTime: cInTime ? new Date(cInTime) : new Date(),
      });

      // Clear Form
      setVNumber('');
      setDName('');
      setCInTime('');

      // Reload
      await loadLogs();
    } catch (err) {
      console.error('Failed to check-in vehicle', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (logId: string) => {
    try {
      await api.post('/vehicles/check-out', {
        logId,
        checkOutTime: new Date(),
      });
      await loadLogs();
    } catch (err) {
      console.error('Failed to check-out vehicle', err);
    }
  };

  const activeVehicles = logs.filter(log => log.status === 'In');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Vehicle Movement Logs</h1>
        <p className="text-zinc-500 text-sm mt-1">Record and view check-in (coming) and check-out (going) dates and times for site vehicles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Movement Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            
            {/* List Header and Sub-tabs */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="flex border-b border-zinc-900/60 p-0.5 bg-zinc-900/40 rounded-lg w-fit">
                <button
                  onClick={() => setActiveSubTab('active')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-colors ${
                    activeSubTab === 'active'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Inside Site ({activeVehicles.length})
                </button>
                <button
                  onClick={() => setActiveSubTab('history')}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-colors ${
                    activeSubTab === 'history'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  All History ({logs.length})
                </button>
              </div>

              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded border border-zinc-800 self-start sm:self-auto">
                Live Traffic Tracker
              </span>
            </div>

            {loading ? (
              <span className="text-zinc-600 text-xs italic block py-12 text-center">Loading vehicle movement logs...</span>
            ) : (activeSubTab === 'active' ? activeVehicles : logs).length === 0 ? (
              <span className="text-zinc-600 text-xs italic block py-12 text-center">
                {activeSubTab === 'active' ? 'No vehicles currently checked-in on site.' : 'No vehicle logs found.'}
              </span>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-extrabold">
                      <th className="pb-3 pt-1 pl-2">Vehicle Number</th>
                      <th className="pb-3 pt-1">Driver Name</th>
                      <th className="pb-3 pt-1">Check-In (Coming)</th>
                      <th className="pb-3 pt-1">Check-Out (Going)</th>
                      <th className="pb-3 pt-1 text-center">Status</th>
                      <th className="pb-3 pt-1 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {(activeSubTab === 'active' ? activeVehicles : logs).map((log) => (
                      <tr key={log._id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 font-bold text-white pl-2 font-mono tracking-wider">
                          {log.vehicleNumber}
                        </td>
                        <td className="py-4 text-zinc-300 font-semibold">{log.driverName}</td>
                        <td className="py-4 text-zinc-400 font-mono">
                          <div className="flex items-center gap-1 text-[11px]">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {new Date(log.checkInTime).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-4 text-zinc-450 font-mono">
                          {log.checkOutTime ? (
                            <div className="flex items-center gap-1 text-[11px]">
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              {new Date(log.checkOutTime).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          ) : (
                            <span className="text-zinc-600 italic text-[10px]">Still On Site</span>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            log.status === 'In'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                              : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          }`}>
                            {log.status === 'In' ? 'Inside' : 'Left'}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2">
                          {log.status === 'In' && (
                            <button
                              onClick={() => handleCheckOut(log._id)}
                              className="bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 text-rose-300 text-[10px] font-bold px-3 py-1 rounded transition-colors"
                            >
                              Check-Out
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Check-In Form */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
          <div>
            <h3 className="text-base font-bold font-outfit text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Record Check-In (Entry)
            </h3>
            <p className="text-zinc-500 text-xs mt-1">Log a vehicle arriving at the construction site.</p>
          </div>

          <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Vehicle Number</label>
              <input
                type="text"
                required
                value={vNumber}
                onChange={(e) => setVNumber(e.target.value)}
                placeholder="e.g. HR-55-A-1234"
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none uppercase font-mono tracking-widest"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Driver Name</label>
              <input
                type="text"
                required
                value={dName}
                onChange={(e) => setDName(e.target.value)}
                placeholder="e.g. Ramesh Singh"
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Check-in Time (Optional)</label>
              <input
                type="datetime-local"
                value={cInTime}
                onChange={(e) => setCInTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4.5 h-4.5" />
              {submitting ? 'Checking In...' : 'Record Coming Vehicle'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
