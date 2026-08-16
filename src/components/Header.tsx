import React from 'react';
import { ShieldCheck, MapPin, MessageSquare, Activity, RefreshCw, Cpu, Calendar, Mail, Bell, Key } from 'lucide-react';
import { UserRole } from '../types/auth';

interface HeaderProps {
  userRole: UserRole;
  userEmail: string;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  lastUpdated: Date;
  onRefresh: () => void;
  isLoadingLive: boolean;
  onOpenOnboarding: () => void;
  onOpenAdminAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  userEmail,
  activeTab,
  setActiveTab,
  lastUpdated,
  onRefresh,
  isLoadingLive,
  onOpenOnboarding,
  onOpenAdminAuth
}) => {
  const isSubscribed = Boolean(userEmail && !userEmail.includes('ejemplo.com') && userEmail.length > 3);

  return (
    <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-md border-b border-dark-700/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab(userRole === 'ADMIN' ? 'map' : 'calendar')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-led-cyan/40 flex items-center justify-center shadow-led-glow">
              <ShieldCheck className="w-6 h-6 text-led-cyan animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-100 font-sans">
                  METEO<span className="text-led-cyan font-mono font-bold">ALERTS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Antofagasta Real-time</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Costa Laguna • Antofagasta • Cordillera de la Costa
              </p>
            </div>
          </div>

          {/* Navigation Tabs (User vs Admin) */}
          {userRole === 'USER' ? (
            <nav className="hidden md:flex items-center space-x-1 bg-dark-900/90 p-1.5 rounded-xl border border-dark-700">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-led-cyan text-dark-950 shadow-led-glow font-bold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-dark-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendario 7 Días</span>
              </button>

              <button
                onClick={() => setActiveTab('sectors')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'sectors'
                    ? 'bg-led-cyan text-dark-950 shadow-led-glow font-bold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-dark-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Costa Laguna & Sectores</span>
              </button>

              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'map'
                    ? 'bg-led-cyan text-dark-950 shadow-led-glow font-bold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-dark-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Mapa Regional</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preferences'
                    ? 'bg-led-cyan text-dark-950 shadow-led-glow font-bold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-dark-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Mis Alertas Email</span>
              </button>
            </nav>
          ) : null}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            
            <button
              onClick={onRefresh}
              disabled={isLoadingLive}
              title="Consultar datos reales"
              className="px-3 py-1.5 rounded-xl bg-dark-900 text-slate-300 hover:text-led-cyan hover:bg-dark-800 border border-dark-700 transition-all flex items-center space-x-2 text-xs font-mono"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingLive ? 'animate-spin text-led-cyan' : ''}`} />
              <span className="hidden sm:inline">{isLoadingLive ? 'Cargando...' : 'Sincronizar'}</span>
            </button>

            {/* Email Subscription Indicator */}
            {userRole === 'USER' && (
              isSubscribed ? (
                <div className="bg-dark-900 px-3 py-1.5 rounded-xl border border-dark-700 text-xs font-mono text-slate-200 flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span className="hidden md:inline font-bold">{userEmail}</span>
                </div>
              ) : (
                <button
                  onClick={onOpenOnboarding}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-led-cyan to-led-blue text-dark-950 font-extrabold text-xs font-mono transition-all hover:shadow-led-glow flex items-center space-x-1.5"
                >
                  <Bell className="w-4 h-4" />
                  <span>Inscribir mi Correo</span>
                </button>
              )
            )}

            {/* Admin Switcher trigger */}
            {userRole === 'ADMIN' && (
              <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-led-cyan/30 text-xs font-mono text-led-cyan font-bold flex items-center space-x-1.5">
                <Key className="w-4 h-4" />
                <span>👑 Panel Admin</span>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
