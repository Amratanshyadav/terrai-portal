'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { api } from '../../services/api';
import { 
  Activity, 
  LayoutDashboard, 
  Map, 
  Users, 
  ArrowLeftRight,
  Fuel,
  LogOut,
  Bell,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import io from 'socket.io-client';

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { user, isAuthenticated, loadSession, clearSession, updateUser } = useAuthStore();
  const { notifications, addNotification } = useNotificationStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);

  // States for dynamic Post-Login Role Configuration
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Manager' | 'Supervisor' | 'Worker'>('Supervisor');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Submit Handler: Update Operational Role
  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingRole(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const { data } = await api.put('/auth/role', { role: selectedRole });
      const updatedUser = data.data.user;

      // Sync user session details
      updateUser(updatedUser);
      setProfileSuccess(true);
      
      // Auto close modal after brief delay
      setTimeout(() => {
        setShowProfileModal(false);
      }, 1500);
    } catch (err: any) {
      setProfileError(
        err.response?.data?.message || 
        'Failed to apply operational role credentials. Please check your connection.'
      );
    } finally {
      setUpdatingRole(false);
    }
  };

  // 1. Session verification & redirect guard
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const access = localStorage.getItem('accessToken');
    if (!access) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 2. Real-time web sockets integration
  useEffect(() => {
    // In serverless production, Socket.io is not active, so skip connection to prevent console errors
    const isProductionVercel = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !process.env.NEXT_PUBLIC_SOCKET_URL;
    if (isProductionVercel) {
      return;
    }

    const socket = io(SOCKET_URL);

    // Join room for real-time safety alerts
    socket.emit('join-room', 'alerts-room');

    socket.on('new-alert', (alert) => {
      addNotification({
        title: alert.title,
        message: alert.message,
        type: 'Alert',
        severity: alert.severity,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Employees & Payments', path: '/workers', icon: Users },
    { name: 'Vehicle Movement Logs', path: '/vehicles', icon: ArrowLeftRight },
    { name: 'Diesel Logs', path: '/diesel', icon: Fuel },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        Verifying Security Credentials...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex relative overflow-hidden">
      
      {/* --- SIDEBAR PANEL (DESKTOP) --- */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-900 bg-[#09090b] shrink-0 sticky top-0 h-screen p-4 justify-between">
        <div className="space-y-8">
          
          {/* Brand */}
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight font-outfit text-white">TERRAI PORTAL</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Logout */}
        <div className="border-t border-zinc-900 pt-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => {
                setSelectedRole(user.role);
                setProfileError(null);
                setProfileSuccess(false);
                setShowProfileModal(true);
              }}
              className="text-left group focus:outline-none"
              title="Click to configure operational role"
            >
              <span className="font-bold text-sm block text-white group-hover:text-emerald-400 transition-colors">{user.firstName}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-semibold mt-1 inline-block uppercase tracking-wider group-hover:bg-emerald-900 transition-colors">
                {user.role}
              </span>
            </button>
            <button 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-rose-400 p-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE NAVBAR --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#09090b] border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white font-outfit">TERRAI</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-zinc-400 p-1.5 rounded bg-zinc-900 border border-zinc-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* --- MOBILE DRAWER INDEX --- */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-[#09090b] pt-16 px-6 flex flex-col justify-between pb-8">
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 py-3 border-b border-zinc-900 text-sm font-medium ${
                    active ? 'text-emerald-400' : 'text-zinc-400'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-950/20 border border-rose-900/40 text-rose-300 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" /> End Security Session
          </button>
        </div>
      )}

      {/* --- MAIN PAGE WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        
        {/* Top Navbar */}
        <header className="h-14 border-b border-zinc-900 bg-[#09090b] px-6 hidden lg:flex items-center justify-between sticky top-0 z-20">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
            PORTAL OVERVIEW // SECURE ZONE
          </span>

          <div className="flex items-center gap-4 relative">
            
            {/* Alerts Bell */}
            <button 
              onClick={() => setShowNotiDropdown(!showNotiDropdown)}
              className="text-zinc-400 hover:text-white relative p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotiDropdown && (
              <div className="absolute right-0 top-10 w-80 bg-zinc-950 border border-zinc-900 rounded-xl p-4 shadow-2xl z-50 text-xs">
                <div className="font-bold text-white mb-3 pb-2 border-b border-zinc-900 flex justify-between items-center">
                  <span>SYSTEM DISPATCHES</span>
                  {unreadCount > 0 && <span className="text-[10px] text-rose-400 font-bold">{unreadCount} UNREAD</span>}
                </div>
                <div className="space-y-3.5 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <span className="text-zinc-600 italic block py-4 text-center">No active alerts recorded.</span>
                  ) : (
                    notifications.map((noti) => (
                      <div key={noti.id} className="border-b border-zinc-900 pb-2">
                        <span className="font-bold text-white block">{noti.title}</span>
                        <span className="text-zinc-400 text-[10px] mt-0.5 block leading-relaxed">{noti.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => {
                setSelectedRole(user.role);
                setProfileError(null);
                setProfileSuccess(false);
                setShowProfileModal(true);
              }}
              className="text-zinc-400 text-sm hover:text-white transition-colors focus:outline-none flex items-center gap-1 group"
              title="Click to configure operational role"
            >
              Welcome, <span className="font-bold text-white group-hover:text-emerald-400 transition-colors underline decoration-emerald-500/20 underline-offset-4 group-hover:decoration-emerald-500 transition-all">{user.firstName}</span>
            </button>
          </div>
        </header>

        {/* Children content page */}
        <main className="flex-grow p-6 md:p-8 max-w-[1600px] mx-auto w-full relative z-10">
          {children}
        </main>
      </div>

      {/* --- PROFILE & OPERATIONAL ROLE SETUP MODAL --- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-lg text-white font-outfit">Operational Role</h3>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase tracking-widest">Configure Session Access</p>
            </div>

            {profileError && (
              <div className="bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs p-2.5 rounded-lg mb-4">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs p-2.5 rounded-lg mb-4">
                Operational credentials configured successfully!
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">Set Operational Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Supervisor">Supervisor (Site Operations)</option>
                  <option value="Manager">Manager (Finance & Ledger review)</option>
                  <option value="Admin">Administrator (All Access Controls)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-semibold py-3 rounded-xl transition-all text-xs focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-black font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 focus:outline-none"
                >
                  {updatingRole ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...
                    </>
                  ) : (
                    'Apply Role'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
