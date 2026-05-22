'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  Users, 
  IndianRupee, 
  Plus, 
  Trash2,
  Calendar,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface IWorkerItem {
  _id: string;
  firstName: string; // First name only
  phone: string;
  post: string;
  salary: number;
  joinedDate: string;
}

interface IPaymentItem {
  _id: string;
  workerId: {
    _id: string;
    firstName: string;
    post: string;
  } | null;
  amount: number;
  date: string;
  description: string;
}

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'payments'>('employees');
  const [workers, setWorkers] = useState<IWorkerItem[]>([]);
  const [payments, setPayments] = useState<IPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Worker Form States
  const [wName, setWName] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wPost, setWPost] = useState('');
  const [wSalary, setWSalary] = useState('');
  const [addingWorker, setAddingWorker] = useState(false);

  // Add Payment Form States
  const [payWorkerId, setPayWorkerId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState('');
  const [payDescription, setPayDescription] = useState('Monthly Salary');
  const [addingPayment, setAddingPayment] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const workersRes = await api.get('/workers');
      setWorkers(workersRes.data.data.workers);

      const paymentsRes = await api.get('/payments');
      setPayments(paymentsRes.data.data.payments);
    } catch (err) {
      console.error('Failed to load portal operations ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName || !wPhone || !wPost || !wSalary || addingWorker) return;

    setAddingWorker(true);
    try {
      await api.post('/workers', {
        firstName: wName,
        phone: wPhone,
        post: wPost,
        salary: Number(wSalary),
      });

      // Clear Form
      setWName('');
      setWPhone('');
      setWPost('');
      setWSalary('');

      // Reload
      await loadData();
    } catch (err) {
      console.error('Failed to register employee', err);
    } finally {
      setAddingWorker(false);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (!window.confirm('Are you sure you want to remove this employee from registry?')) return;
    try {
      await api.delete(`/workers/${workerId}`);
      await loadData();
    } catch (err) {
      console.error('Failed to remove worker', err);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payWorkerId || !payAmount || addingPayment) return;

    setAddingPayment(true);
    try {
      await api.post('/payments', {
        workerId: payWorkerId,
        amount: Number(payAmount),
        date: payDate ? new Date(payDate) : new Date(),
        description: payDescription,
      });

      // Clear Form
      setPayWorkerId('');
      setPayAmount('');
      setPayDate('');
      setPayDescription('Monthly Salary');

      // Reload
      await loadData();
    } catch (err) {
      console.error('Failed to log payment transaction', err);
    } finally {
      setAddingPayment(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Employees & Payments</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage employee registrations, their posts, and track payments given to whom in the ledger.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-900 gap-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-5 py-3 text-sm font-semibold tracking-tight transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Employees Directory
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-3 text-sm font-semibold tracking-tight transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          Payments Ledger
        </button>
      </div>

      {activeTab === 'employees' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employees Directory List */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Active Personnel Directory
              </h2>
              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                {workers.length} {workers.length === 1 ? 'Worker' : 'Workers'} Registered
              </span>
            </div>

            {loading ? (
              <span className="text-zinc-600 text-xs italic block py-12 text-center">Loading employee records...</span>
            ) : workers.length === 0 ? (
              <span className="text-zinc-600 text-xs italic block py-12 text-center">No employees registered yet.</span>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-extrabold">
                      <th className="pb-3 pt-1 pl-2">Name</th>
                      <th className="pb-3 pt-1">Post / Designation</th>
                      <th className="pb-3 pt-1">Phone Number</th>
                      <th className="pb-3 pt-1">Base Salary</th>
                      <th className="pb-3 pt-1 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {workers.map((worker) => (
                      <tr key={worker._id} className="hover:bg-zinc-900/20 group transition-colors">
                        <td className="py-4 font-bold text-white pl-2">
                          {worker.firstName}
                        </td>
                        <td className="py-4 text-zinc-300">
                          <span className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-zinc-400 font-semibold tracking-wide text-[10px]">
                            {worker.post}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-zinc-400">{worker.phone}</td>
                        <td className="py-4 text-emerald-400 font-bold font-mono">
                          ₹{worker.salary.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => handleDeleteWorker(worker._id)}
                            className="text-zinc-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                            title="Remove Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Employee Form */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
            <div>
              <h3 className="text-base font-bold font-outfit text-white">Register New Employee</h3>
              <p className="text-zinc-500 text-xs mt-1">Enroll a new staff member into the portal registry.</p>
            </div>

            <form onSubmit={handleAddWorker} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  placeholder="e.g. Rajesh"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={wPhone}
                  onChange={(e) => setWPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Post / Designation</label>
                <input
                  type="text"
                  required
                  value={wPost}
                  onChange={(e) => setWPost(e.target.value)}
                  placeholder="e.g. Heavy Driver, Accountant"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Monthly Base Salary (₹)</label>
                <input
                  type="number"
                  required
                  value={wSalary}
                  onChange={(e) => setWSalary(e.target.value)}
                  placeholder="e.g. 35000"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={addingWorker}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4.5 h-4.5" />
                {addingWorker ? 'Registering...' : 'Add Employee'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payments Ledger List */}
          <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Payments Given Ledger
              </h2>
              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
                {payments.length} Transactions Recorded
              </span>
            </div>

            {loading ? (
              <span className="text-zinc-600 text-xs italic block py-12 text-center">Loading payments ledger...</span>
            ) : payments.length === 0 ? (
              <span className="text-zinc-600 text-xs italic block py-12 text-center">No payment transactions found.</span>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider font-extrabold">
                      <th className="pb-3 pt-1 pl-2">Paid To</th>
                      <th className="pb-3 pt-1">Post / Role</th>
                      <th className="pb-3 pt-1">Date</th>
                      <th className="pb-3 pt-1">Description / Notes</th>
                      <th className="pb-3 pt-1 text-right pr-2">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {payments.map((pay) => (
                      <tr key={pay._id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-4 font-bold text-white pl-2">
                          {pay.workerId 
                            ? pay.workerId.firstName 
                            : <span className="text-zinc-600 italic">Former Employee</span>
                          }
                        </td>
                        <td className="py-4">
                          {pay.workerId ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-850 font-semibold tracking-wide text-[9px] uppercase">
                              {pay.workerId.post}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-4 text-zinc-400 font-mono">
                          {new Date(pay.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 text-zinc-400 italic text-[11px]">{pay.description}</td>
                        <td className="py-4 text-right pr-2 font-bold font-mono text-emerald-400">
                          ₹{pay.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Record Payment Form */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
            <div>
              <h3 className="text-base font-bold font-outfit text-white">Record Payment</h3>
              <p className="text-zinc-500 text-xs mt-1">Log a cash or bank salary/advance payment given to a worker.</p>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Select Employee</label>
                <select
                  required
                  value={payWorkerId}
                  onChange={(e) => setPayWorkerId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.firstName} ({w.post})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 28000"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Payment Date (Optional)</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Payment Type / Description</label>
                <input
                  type="text"
                  required
                  value={payDescription}
                  onChange={(e) => setPayDescription(e.target.value)}
                  placeholder="e.g. May 2026 Salary, Advance"
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-2 text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={addingPayment || !payWorkerId}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-4.5 h-4.5" />
                {addingPayment ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
