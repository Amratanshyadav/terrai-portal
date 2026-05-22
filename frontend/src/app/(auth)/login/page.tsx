'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/useAuthStore';
import { api } from '../../../services/api';
import { 
  Lock, 
  Mail, 
  Activity, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft, 
  UserPlus, 
  UserCheck, 
  HelpCircle 
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  
  // Interactive UI Mode Switcher
  const [mode, setMode] = useState<AuthMode>('login');

  // Input states
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Supervisor'); // Default to Supervisor for access console
  const [showPassword, setShowPassword] = useState(false);
  
  // Operation states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to extract clean error message from API responses
  const getErrorMessage = (err: any, fallback: string): string => {
    if (err.response?.data) {
      const data = err.response.data;
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const details = data.errors.map((e: any) => e.message || e.msg).filter(Boolean).join(', ');
        return details ? `${data.message}: ${details}` : data.message;
      }
      if (data.message) {
        return data.message;
      }
    }
    // Handle Network Errors (e.g. backend server is unreachable due to Wi-Fi mismatch or firewall blocks)
    if (err.request && !err.response) {
      return 'Connection failed. Please verify that your phone is connected to the EXACT same Wi-Fi network as the computer, and that Windows Defender Firewall is not blocking port 5000.';
    }
    return fallback;
  };

  // 1. Submit Handle: Login User
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = data.data;

      // Establish auth store session
      setSession(user, accessToken, refreshToken);
      
      // Redirect to Control dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        getErrorMessage(err, 'Failed to establish portal session. Please check your network or credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Handle: Create New Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Simple validation
    if (firstName.trim().includes(' ')) {
      setError('Please provide first name only (single word name).');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        firstName: firstName.trim(),
        email: email.trim(),
        password,
        role
      });

      // Clear register states and transition to login
      setSuccessMessage(`Account for ${firstName} created successfully! You can now log in.`);
      setFirstName('');
      setPassword('');
      setMode('login');
    } catch (err: any) {
      setError(
        getErrorMessage(err, 'Registration failed. Please check your credentials or contact site administrator.')
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Handle: Forgot Password Recovery
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Simulated Secure Email Dispatch
    setTimeout(() => {
      setSuccessMessage(`Password recovery link has been dispatched to ${email}. Please check your inbox.`);
      setMode('login');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden selection:bg-emerald-500 selection:text-black">
      
      {/* Decorative ambient background spots */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-950/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-950/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-900 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10">
        
        {/* PLATFORM IDENTITY */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/10">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-outfit text-white text-center">Terrai</h1>
          
          <p className="text-zinc-500 text-xs text-center mt-1.5 px-4">
            {mode === 'login' && 'Enter your supervisor credentials to access control dashboards.'}
            {mode === 'register' && 'Create a new security or manager account for site operations.'}
            {mode === 'forgot' && 'Provide your registered email address to recover your password.'}
          </p>
        </div>

        {/* FEEDBACK LABELS */}
        {error && (
          <div className="bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs p-3 rounded-lg mb-6 leading-relaxed">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs p-3 rounded-lg mb-6 leading-relaxed">
            {successMessage}
          </div>
        )}

        {/* --- SIGN IN MODE (LOGIN) --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-11 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
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
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-6 active:scale-[0.98] shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" /> Establish Secure Session
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <span className="text-xs text-zinc-500">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('register');
                }}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors focus:outline-none"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* --- SIGN UP MODE (CREATE ACCOUNT) --- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">First Name Only</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Amratansh"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">Single word name only (no last names).</p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-4 active:scale-[0.98] shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>

            <div className="text-center mt-5">
              <span className="text-xs text-zinc-500">Already registered? </span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setMode('login');
                }}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors focus:outline-none"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* --- FORGOT PASSWORD MODE --- */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-6 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Registry...
                </>
              ) : (
                'Request Reset Instructions'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setMode('login');
              }}
              className="w-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-3 focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
          </form>
        )}

        {/* SSL indicators */}
        <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-8 pt-6 border-t border-zinc-900 font-mono">
          <span>SECURE GATEWAY v1.0</span>
          <span>SSL 256-BIT ENCRYPTION</span>
        </div>

      </div>
    </div>
  );
}
