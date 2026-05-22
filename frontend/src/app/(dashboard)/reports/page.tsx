'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { 
  FileText, 
  Calendar, 
  Sparkles, 
  Download, 
  Loader2, 
  PlusSquare,
  ChevronRight
} from 'lucide-react';

interface IReportItem {
  _id: string;
  title: string;
  type: string;
  url: string;
  aiSummary: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<IReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IReportItem | null>(null);
  
  // Selection fields for compilation
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('Production');

  const loadReports = async () => {
    try {
      const { data } = await api.get('/reports');
      setReports(data.data.reports);
      if (data.data.reports.length > 0) {
        setSelectedReport(data.data.reports[0]);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || compiling) return;

    setCompiling(true);
    try {
      const { data } = await api.post('/reports', {
        title: reportTitle,
        type: reportType,
      });

      // Clear input and reload
      setReportTitle('');
      await loadReports();
      setSelectedReport(data.data.report);
    } catch (err) {
      console.error('Failed to compile report', err);
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-outfit text-white">Operations Analytical Reports</h1>
        <p className="text-zinc-500 text-sm mt-1">Generate ISO-compliant production logs, safety reports, and structural audits with AI summarizations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Compilation & List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Compile New Report Card */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
            <h2 className="text-base font-bold font-outfit text-white mb-4 flex items-center gap-2">
              <PlusSquare className="w-5 h-5 text-emerald-400" /> Compile Operations Report
            </h2>

            <form onSubmit={handleCompile} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Report Document Title</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g., Weekly Ventilation & Methane Audit"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Operational Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Production">Production Yields</option>
                  <option value="Safety">Safety & Incidents</option>
                  <option value="Environmental">Environmental Telemetries</option>
                  <option value="Maintenance">Machinery downtime</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={compiling || !reportTitle.trim()}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  {compiling ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> Compiling Data & Requesting AI Summaries...
                    </>
                  ) : (
                    'Compile Operational Data'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List of Reports */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <h2 className="text-base font-bold font-outfit text-white mb-4">Operations Report Database</h2>

            {loading ? (
              <span className="text-zinc-600 text-xs italic block py-8 text-center">Loading operational database...</span>
            ) : reports.length === 0 ? (
              <span className="text-zinc-600 text-xs italic block py-8 text-center">No reports compiled yet. Use the compile pane above to build.</span>
            ) : (
              <div className="divide-y divide-zinc-900">
                {reports.map((rep) => (
                  <div 
                    key={rep._id}
                    onClick={() => setSelectedReport(rep)}
                    className={`flex items-center justify-between py-3.5 px-2 hover:bg-zinc-900/40 rounded-xl cursor-pointer transition-colors ${
                      selectedReport?._id === rep._id ? 'bg-zinc-900/60 border border-zinc-800' : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{rep.title}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{rep.type} Report</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-zinc-500 text-[10px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Summary Slider Panel */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">SELECTED ANALYTICS</span>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
              Compiled
            </span>
          </div>

          {selectedReport ? (
            <div className="space-y-6">
              <div>
                <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-1">Document Particulars</span>
                <span className="font-bold text-lg text-white font-outfit leading-tight block">{selectedReport.title}</span>
                <span className="text-zinc-400 text-xs block mt-1.5">{selectedReport.type} Report</span>
              </div>

              {/* RAG generative AI summary box */}
              <div className="bg-zinc-900/40 border border-emerald-500/10 p-5 rounded-xl space-y-3.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4.5 h-4.5" /> Generative AI Summary
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line">
                  {selectedReport.aiSummary || 'Summary generating... Please refresh the database.'}
                </p>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <a 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium border border-zinc-800 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download ISO PDF report
                </a>
              </div>
            </div>
          ) : (
            <span className="text-zinc-600 text-xs italic block py-12 text-center">Compile and select a report to view generated RAG summaries.</span>
          )}
        </div>

      </div>

    </div>
  );
}
