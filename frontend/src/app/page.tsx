'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Users, 
  Wrench, 
  Database, 
  Terminal, 
  Zap, 
  ArrowRight,
  TrendingUp,
  MessageSquareCode
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <span className="font-bold text-lg tracking-tight font-outfit text-emerald-400">
            TERRAI
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#ai" className="hover:text-emerald-400 transition-colors">AI Core</a>
          <a href="#analytics" className="hover:text-emerald-400 transition-colors">Analytics</a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
        </nav>
        <Link 
          href="/login" 
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          Access Operations <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 pt-24 pb-20 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs px-3 py-1.5 rounded-full mb-8 font-medium">
          <Terminal className="w-3.5 h-3.5" /> Platform v1.0.0 Now Fully Operational
        </div>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight font-outfit text-white leading-[1.1] max-w-5xl mx-auto mb-6">
          The Autonomous Intelligence <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            Mining Control Center
          </span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 font-normal leading-relaxed">
          Unlock standard ML operations and real-time hazard mitigation. Drive yields with scikit-learn predictive maintenance, neural production forecasts, and Gemini chatbot safety workflows.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link 
            href="/login" 
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            Launch Core Console <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-medium border border-zinc-800 px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            Explore Capabilities
          </a>
        </div>

        {/* Dynamic System Dashboard Mockup Preview */}
        <div className="relative border border-zinc-800 bg-zinc-950/70 p-4 rounded-2xl max-w-5xl mx-auto shadow-2xl backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>LIVE TELEMETRY SHAFT FEED - ACTIVE</span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">Zone B</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">CH4: 0.05%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Production Forecast</span>
              <span className="text-2xl font-bold font-outfit text-white">1,684.5 Tons</span>
              <span className="text-emerald-400 text-xs block mt-1">▲ 4.2% predicted growth rate</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Machinery Health</span>
              <span className="text-2xl font-bold font-outfit text-emerald-400">OPERATIONAL</span>
              <span className="text-zinc-400 text-xs block mt-1">Design limits index: 96% optimal</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-zinc-500 text-xs font-bold uppercase block mb-1">Active Personnel</span>
              <span className="text-2xl font-bold font-outfit text-white">42 Active</span>
              <span className="text-emerald-400 text-xs block mt-1">100% safety gear checklist verified</span>
            </div>
          </div>

          {/* Static Systems Architecture Summary */}
          <div className="mt-6 border-t border-zinc-900 pt-6">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-2">
              <span>SYSTEM VECTOR PATH & STATIC SENSOR CONFIGURATION</span>
              <span className="text-zinc-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                TELEMETRY SCAN: STATIC
              </span>
            </div>
            <div className="bg-zinc-900/10 rounded-xl p-4 text-left border border-zinc-900 font-mono text-[11px] text-zinc-400 space-y-1">
              <div>[SYSTEM STATUS] - Terrai Portal</div>
              <div>[SHAFT-01] - NORMAL - 22.4°C - 45% Humidity</div>
              <div>[DRILL-02] - ACTIVE - 84.0°C - 3.5 bar Pressure</div>
              <div>[KOMATSU-03] - MAINTENANCE - Assigned Operator check active</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PLATFORM FEATURES --- */}
      <section id="features" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest mb-3">Enterprise Suite</h2>
          <p className="text-3xl md:text-5xl font-bold font-outfit text-white">Complete Industrial Operational Control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6">
              <ShieldAlert className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white mb-2">Automated Safety Alerts</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              If toxic methane, carbon monoxide, or structural pressure scales cross warning indicators, the platform automatically halts shafts and alarms teams instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6">
              <Wrench className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white mb-2">Predictive Maintenance ML</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Use custom Scikit-Learn Random Forest modules to process mechanical telemetry streams, predicting failure probabilities and scheduling servicing.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl group">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6">
              <Cpu className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold font-outfit text-white mb-2">Gemini Operations Assistant</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              An active conversational assistant equipped with professional safety documentation, ventilation guidance rules, and immediate RAG report summaries.
            </p>
          </div>
        </div>
      </section>

      {/* --- AI CAPABILITIES SHOWCASE --- */}
      <section id="ai" className="py-24 px-6 bg-zinc-950/40 relative z-10 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest mb-3">Model Core</h2>
            <h3 className="text-3xl md:text-5xl font-bold font-outfit text-white mb-6">
              AI Analytics Engine Configured for Heavy Industry
            </h3>
            <p className="text-zinc-400 leading-relaxed mb-8">
              We leverage an advanced Python microservice. By integrating mathematical models directly, supervisors can assess production forecasts and machine failure alerts securely.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-emerald-950 flex items-center justify-center text-emerald-400 mt-1">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Production Regression Models</span>
                  <span className="text-sm text-zinc-400">Fits multi-period tonnages against operational limits to calculate targets.</span>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-emerald-950 flex items-center justify-center text-emerald-400 mt-1">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Gemini 1.5 Safety Assistant</span>
                  <span className="text-sm text-zinc-400">Translates complex environmental sensor indexes into clear checklists.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-xs font-semibold text-zinc-400">MODEL LOGGING BUFFER</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Operational</span>
            </div>
            
            <div className="space-y-2 text-xs font-mono text-zinc-500">
              <p className="text-zinc-400">&gt; Fitting Random Forest classifier on 500 telemetry sets...</p>
              <p className="text-zinc-400">&gt; Accuracy: 98.42% | F1-Score: 98.11%</p>
              <p className="text-zinc-400">&gt; Registering Remaining Useful Life (RUL) regression...</p>
              <p className="text-emerald-400">&gt; Model loaded successfully. Ready for REST telemetry posts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 px-6 relative z-10 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest mb-3">Simple Tiers</h2>
          <p className="text-3xl md:text-5xl font-bold font-outfit text-white">Predictable Operations Scaling</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tier 1 */}
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl relative">
            <h3 className="text-lg font-bold font-outfit text-zinc-300 mb-2">Regional Mine Portal</h3>
            <span className="text-4xl font-extrabold text-white font-outfit">₹3,50,000</span>
            <span className="text-zinc-500 text-sm"> / month</span>
            <p className="text-zinc-400 text-sm mt-4 mb-6">Excellent for a single location monitoring workers, machines, and live gases.</p>
            <ul className="text-zinc-300 text-sm space-y-3 border-t border-zinc-900 pt-6">
              <li>✓ Up to 100 Workers Roster</li>
              <li>✓ 20 Active Machinery Streamers</li>
              <li>✓ WebSockets Real-time Sensors Feed</li>
              <li>✓ Dynamic ML Maintenance Predictors</li>
            </ul>
          </div>

          {/* Tier 2 */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/30 p-8 rounded-2xl relative shadow-xl shadow-emerald-950/10">
            <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-emerald-500 text-black font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              Recommended Enterprise
            </div>
            <h3 className="text-lg font-bold font-outfit text-emerald-400 mb-2">Multi-Site Enterprise</h3>
            <span className="text-4xl font-extrabold text-white font-outfit">₹8,00,000</span>
            <span className="text-emerald-500 text-sm font-semibold"> / month</span>
            <p className="text-zinc-400 text-sm mt-4 mb-6">Complete platform covering endless sites, full AI access, and custom RAG reports.</p>
            <ul className="text-zinc-300 text-sm space-y-3 border-t border-zinc-900 pt-6">
              <li>✓ Unlimited Worker & Site Registers</li>
              <li>✓ Unlimited Machinery Telemetry feeds</li>
              <li>✓ Multi-Model Production Forecasting</li>
              <li>✓ Persistent Gemini Chatbot Safety logs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-zinc-950/60 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-500 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold text-sm tracking-tight text-emerald-400">TERRAI</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Terrai. All rights reserved. Enterprise Mining Systems.</span>
          <div className="flex gap-4">
            <span className="hover:text-emerald-400 cursor-pointer">Privacy Laws</span>
            <span className="hover:text-emerald-400 cursor-pointer">ISO 45001 Compliance</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
