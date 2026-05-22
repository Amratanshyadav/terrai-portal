'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../services/api';
import { 
  Users, 
  ArrowLeftRight, 
  Fuel, 
  IndianRupee,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass
} from 'lucide-react';

interface IWorkerItem {
  _id: string;
  firstName: string;
  post: string;
  salary: number;
}

interface IVehicleLogItem {
  _id: string;
  vehicleNumber: string;
  driverName: string;
  checkInTime: string;
  status: 'In' | 'Out';
}

interface IFuelLogItem {
  _id: string;
  vehicleNumber: string;
  amount: number;
  cost: number;
  date: string;
}

export default function DashboardPage() {
  const [workersCount, setWorkersCount] = useState(0);
  const [activeVehiclesCount, setActiveVehiclesCount] = useState(0);
  const [totalLiters, setTotalLiters] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  const [recentVehicles, setRecentVehicles] = useState<IVehicleLogItem[]>([]);
  const [recentFuel, setRecentFuel] = useState<IFuelLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Workers
      const workersRes = await api.get('/workers');
      setWorkersCount(workersRes.data.data.workers.length);

      // 2. Fetch Vehicle Logs
      const vehiclesRes = await api.get('/vehicles');
      const vehicleLogs: IVehicleLogItem[] = vehiclesRes.data.data.logs;
      const activeIn = vehicleLogs.filter(v => v.status === 'In');
      setActiveVehiclesCount(activeIn.length);
      setRecentVehicles(vehicleLogs.slice(0, 4));

      // 3. Fetch Diesel Logs
      const dieselRes = await api.get('/diesel');
      const dieselLogs: IFuelLogItem[] = dieselRes.data.data.logs;
      const sumLiters = dieselLogs.reduce((sum, item) => sum + item.amount, 0);
      const sumCost = dieselLogs.reduce((sum, item) => sum + item.cost, 0);
      setTotalLiters(sumLiters);
      setTotalCost(sumCost);
      setRecentFuel(dieselLogs.slice(0, 4));

    } catch (err) {
      console.error('Failed to load operational control summary stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Control Center</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time operational summary of workforce registry, vehicle logs, and diesel fuel tracking.</p>
        </div>
        <button
          onClick={fetchStats}
          className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto font-semibold"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          Refresh Stats
        </button>
      </div>

      {/* --- STATISTICS PANELS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Workers Stats */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Total Employees</span>
            <span className="text-2xl font-bold font-mono mt-1.5 block text-white">
              {loading ? '...' : workersCount}
            </span>
            <Link href="/workers" className="text-emerald-400 hover:text-emerald-350 text-[11px] font-semibold mt-2 flex items-center gap-1 transition-colors">
              Go to workforce <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Active Vehicles Stats */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Vehicles On Site</span>
            <span className="text-2xl font-bold font-mono mt-1.5 block text-white">
              {loading ? '...' : activeVehiclesCount}
            </span>
            <Link href="/vehicles" className="text-emerald-400 hover:text-emerald-350 text-[11px] font-semibold mt-2 flex items-center gap-1 transition-colors">
              Manage movements <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/20 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Total Diesel Distributed */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Diesel Liters Issued</span>
            <span className="text-2xl font-bold font-mono mt-1.5 block text-white">
              {loading ? '...' : `${totalLiters.toLocaleString('en-IN')} L`}
            </span>
            <Link href="/diesel" className="text-emerald-400 hover:text-emerald-350 text-[11px] font-semibold mt-2 flex items-center gap-1 transition-colors">
              View fuel logs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/20 flex items-center justify-center">
            <Fuel className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Total Diesel Cost spend */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-between">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-extrabold tracking-wider block">Total Fuel Cost</span>
            <span className="text-2xl font-bold font-mono mt-1.5 block text-emerald-400">
              {loading ? '...' : `₹${totalCost.toLocaleString('en-IN')}`}
            </span>
            <span className="text-zinc-500 text-[10px] block mt-2">Aggregate site spending</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-900/20 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* --- RECENT DATA BLOCKS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Vehicles Log */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
            <h2 className="text-sm font-bold font-outfit text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Vehicle Movements
            </h2>
            <Link href="/vehicles" className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold tracking-wider">
              View All
            </Link>
          </div>

          {loading ? (
            <span className="text-zinc-650 text-xs italic block py-4 text-center">Loading recent logs...</span>
          ) : recentVehicles.length === 0 ? (
            <span className="text-zinc-655 text-xs italic block py-4 text-center">No vehicle entries logged today.</span>
          ) : (
            <div className="divide-y divide-zinc-900">
              {recentVehicles.map((item) => (
                <div key={item._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block font-mono tracking-wider">{item.vehicleNumber}</span>
                    <span className="text-zinc-500 text-[10px] block mt-0.5">Driver: {item.driverName}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-fit ml-auto ${
                      item.status === 'In'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                        : 'bg-zinc-900 text-zinc-550 border border-zinc-800'
                    }`}>
                      {item.status === 'In' ? 'Inside' : 'Left'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                      {new Date(item.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Diesel Logs */}
        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
            <h2 className="text-sm font-bold font-outfit text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Recent Diesel Logs
            </h2>
            <Link href="/diesel" className="text-[10px] text-zinc-400 hover:text-white uppercase font-bold tracking-wider">
              View All
            </Link>
          </div>

          {loading ? (
            <span className="text-zinc-650 text-xs italic block py-4 text-center">Loading fuel logs...</span>
          ) : recentFuel.length === 0 ? (
            <span className="text-zinc-655 text-xs italic block py-4 text-center">No diesel transactions logged today.</span>
          ) : (
            <div className="divide-y divide-zinc-900">
              {recentFuel.map((item) => (
                <div key={item._id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white block font-mono tracking-wider">{item.vehicleNumber}</span>
                    <span className="text-zinc-500 text-[10px] block mt-0.5">
                      Issued: {item.amount} L
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 font-mono block">
                      ₹{item.cost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                      {new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
