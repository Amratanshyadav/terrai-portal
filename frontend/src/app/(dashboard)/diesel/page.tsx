'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  Fuel, 
  Plus, 
  IndianRupee, 
  Droplet, 
  ClipboardList,
  User
} from 'lucide-react';

interface IFuelLogItem {
  _id: string;
  vehicleNumber: string;
  amount: number;
  cost: number;
  loggedBy: string;
  date: string;
}

export default function DieselPage() {
  const [logs, setLogs] = useState<IFuelLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [vehicleNum, setVehicleNum] = useState('');
  const [amountLit, setAmountLit] = useState('');
  const [costRs, setCostRs] = useState('');
  const [loggedName, setLoggedName] = useState('');
  const [logDate, setLogDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFuelLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/diesel');
      setLogs(data.data.logs);
    } catch (err) {
      console.error('Failed to load diesel distribution logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuelLogs();
  }, []);

  const handleAddFuelLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNum.trim() || !amountLit || !costRs || !loggedName.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.post('/diesel', {
        vehicleNumber: vehicleNum,
        amount: Number(amountLit),
        cost: Number(costRs),
        loggedBy: loggedName,
        date: logDate ? new Date(logDate) : new Date(),
      });

      // Clear Form
      setVehicleNum('');
      setAmountLit('');
      setCostRs('');
      setLoggedName('');
      setLogDate('');

      // Reload
      await loadFuelLogs();
    } catch (err) {
      console.error('Failed to record diesel distribution log', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const totalLiters = logs.reduce((sum, item) => sum + item.amount, 0);
  const totalCost = logs.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Diesel Logs</h1>
        <p className="text-zinc-500 text-sm mt-1">Track diesel distribution to site machinery and transport vehicles.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Total Liters Given</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">
              {loading ? '...' : `${totalLiters.toLocaleString('en-IN')} L`}
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Total Diesel Cost</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
              {loading ? '...' : `₹${totalCost.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Total Entries</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">
              {loading ? '...' : `${logs.length} Logs`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Diesel Distribution Logs List */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
          <h2 className="text-lg font-bold font-outfit text-white mb-6 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-emerald-400" />
            Diesel Distribution Records
          </h2>

          {loading ? (
            <span className="text-zinc-600 text-xs italic block py-12 text-center">Loading fuel distribution records...</span>
          ) : logs.length === 0 ? (
            <span className="text-zinc-600 text-xs italic block py-12 text-center">No diesel distribution records found.</span>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-extrabold">
                    <th className="pb-3 pt-1 pl-2">Vehicle / Machine</th>
                    <th className="pb-3 pt-1">Date</th>
                    <th className="pb-3 pt-1">Liters Given</th>
                    <th className="pb-3 pt-1">Logged By</th>
                    <th className="pb-3 pt-1 text-right pr-2">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="py-4 font-bold text-white pl-2 font-mono tracking-wider">
                        {log.vehicleNumber}
                      </td>
                      <td className="py-4 text-zinc-400 font-mono">
                        {new Date(log.date).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 font-semibold text-zinc-300 font-mono">
                        {log.amount} Liters
                      </td>
                      <td className="py-4 text-zinc-400 font-medium">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                          {log.loggedBy}
                        </div>
                      </td>
                      <td className="py-4 text-right pr-2 font-bold font-mono text-emerald-400">
                        ₹{log.cost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Log Diesel Form */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
          <div>
            <h3 className="text-base font-bold font-outfit text-white">Log Diesel Distribution</h3>
            <p className="text-zinc-500 text-xs mt-1">Record diesel issued to an excavator, dumper, or truck.</p>
          </div>

          <form onSubmit={handleAddFuelLog} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Vehicle / Machine Name</label>
              <input
                type="text"
                required
                value={vehicleNum}
                onChange={(e) => setVehicleNum(e.target.value)}
                placeholder="e.g. DL-03-CB-9876 or EXCAVATOR-1"
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none uppercase font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Amount (Liters)</label>
                <input
                  type="number"
                  required
                  value={amountLit}
                  onChange={(e) => setAmountLit(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Total Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={costRs}
                  onChange={(e) => setCostRs(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Logged By (Staff Name)</label>
              <input
                type="text"
                required
                value={loggedName}
                onChange={(e) => setLoggedName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1">Distribution Date (Optional)</label>
              <input
                type="datetime-local"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4.5 h-4.5" />
              {submitting ? 'Logging...' : 'Record Diesel Log'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
