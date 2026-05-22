'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { api } from '../../../services/api';
import { Lock, Mail, Activity, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = data.data;

      // Update state
      setSession(user, accessToken, refreshToken);
      
      // Redirect
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Failed to establish portal session. Please check your network or credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10">
        
        {/* Platform identity */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-outfit text-white text-center">Terrai</h1>
          <p className="text-zinc-500 text-xs text-center mt-1">Please enter your supervisor credentials to access control dashboards.</p>
        </div>

        {error && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shrikrishna.com"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-4 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Security...
              </>
            ) : (
              'Establish Secure Session'
            )}
          </button>
        </form>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-8 pt-6 border-t border-zinc-900 font-mono">
          <span>SECURE GATEWAY v1.0</span>
          <span>SSL 256-BIT ENCRYPTION</span>
        </div>

      </div>
    </div>
  );
}
