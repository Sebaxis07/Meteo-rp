import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from './types/auth';
import { getCurrentUser, saveCurrentUser, getAllUsers } from './services/authService';
import { INITIAL_ANTOFAGASTA_SECTORS } from './services/antofagastaSectors';
import { SectorInfo } from './types/sectors';
import { EventClaimResult } from './types/verification';
import { fetchLiveSectorData } from './services/liveWeatherService';
import { fetchLiveOfficialAlerts } from './services/meteochileLiveFeed';

import { Header } from './components/Header';
import { OnboardingModal } from './components/OnboardingModal';
import { UserNotificationPortal } from './components/UserNotificationPortal';
import { HourlyWeatherCalendar } from './components/HourlyWeatherCalendar';
import { SectorCardsGrid } from './components/SectorCardsGrid';
import { RegionalMap } from './components/RegionalMap';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';

import { ShieldCheck, Mail, Lock, Key } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount>(getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserAccount[]>(getAllUsers());
  
  const [activeUserTab, setActiveUserTab] = useState<'calendar' | 'sectors' | 'map' | 'preferences' | 'email_preview'>('calendar');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return currentUser.role === 'USER' && !currentUser.email;
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);

  const [sectors, setSectors] = useState<SectorInfo[]>(INITIAL_ANTOFAGASTA_SECTORS);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>('costa_laguna');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);
  const [claimsHistory, setClaimsHistory] = useState<EventClaimResult[]>([]);

  // Fetch real live weather metrics from Open-Meteo & MeteoChile
  const loadRealLiveData = async () => {
    setIsLoadingLive(true);
    try {
      const updatedSectors = await fetchLiveSectorData(INITIAL_ANTOFAGASTA_SECTORS);
      setSectors(updatedSectors);

      const liveClaims = await fetchLiveOfficialAlerts();
      setClaimsHistory(liveClaims);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching live weather data:', err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    loadRealLiveData();
    const interval = setInterval(loadRealLiveData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribeUser = (email: string, watchZones: string[]) => {
    const updated: UserAccount = {
      ...currentUser,
      email,
      name: email.split('@')[0],
      watch_zones: watchZones
    };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    setAllUsers(getAllUsers());
    setShowOnboarding(false);
  };

  const handleSaveUserPreferences = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);
    setAllUsers(getAllUsers());
  };

  const handleLoginAdminSuccess = (loggedInUser: UserAccount) => {
    setCurrentUser(loggedInUser);
    setAllUsers(getAllUsers());
    setShowAdminAuthModal(false);
  };

  const handleProcessClaim = (newClaim: EventClaimResult) => {
    setClaimsHistory(prev => [newClaim, ...prev]);
  };

  const handleSwitchToUserMode = () => {
    const defaultUser: UserAccount = {
      id: 'usr_user_visitante',
      email: '',
      name: 'Visitante',
      role: 'USER',
      watch_zones: ['Costa Laguna (Norte)', 'Centro Histórico (Centro)'],
      watch_events: ['nevada', 'lluvia', 'viento', 'frio'],
      min_confidence: 80,
      digest_enabled: true,
      digest_hour: '08:00',
      quiet_hours: ['00:00', '07:00'],
      created_at: new Date().toISOString()
    };
    setCurrentUser(defaultUser);
    saveCurrentUser(defaultUser);
    setActiveUserTab('calendar');
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans selection:bg-led-cyan selection:text-dark-950">
      
      {/* Header Bar */}
      <Header
        userRole={currentUser.role}
        userEmail={currentUser.email}
        activeTab={activeUserTab}
        setActiveTab={setActiveUserTab}
        lastUpdated={lastUpdated}
        onRefresh={loadRealLiveData}
        isLoadingLive={isLoadingLive}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenAdminAuth={() => setShowAdminAuthModal(true)}
      />

      {/* Unsubscribed User Banner Prompt */}
      {currentUser.role === 'USER' && !currentUser.email && (
        <div className="bg-gradient-to-r from-led-cyan/10 via-dark-900 to-dark-950 border-b border-led-cyan/30 px-4 py-3 text-center text-xs font-mono">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3 flex-wrap gap-y-2">
            <span className="text-slate-200">
              ✉️ ¿Quieres recibir avisos en tu correo cuando el clima cambie en Costa Laguna o Antofagasta?
            </span>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-3.5 py-1.5 rounded-xl bg-led-cyan text-dark-950 font-extrabold transition-all hover:shadow-led-glow text-xs"
            >
              Sí, Inscribir mi Correo →
            </button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {currentUser.role === 'USER' ? (
          <>
            {activeUserTab === 'calendar' && (
              <HourlyWeatherCalendar
                sectors={sectors}
                selectedSectorId={selectedSectorId || 'costa_laguna'}
              />
            )}

            {activeUserTab === 'sectors' && (
              <SectorCardsGrid
                sectors={sectors}
                selectedSectorId={selectedSectorId}
                onSelectSector={id => {
                  setSelectedSectorId(id);
                  setActiveUserTab('map');
                }}
              />
            )}

            {activeUserTab === 'map' && (
              <RegionalMap
                sectors={sectors}
                selectedSectorId={selectedSectorId}
                onSelectSector={setSelectedSectorId}
              />
            )}

            {(activeUserTab === 'preferences' || activeUserTab === 'email_preview') && (
              <UserNotificationPortal
                user={currentUser}
                onSavePreferences={handleSaveUserPreferences}
                activeSubTab={activeUserTab === 'email_preview' ? 'email_preview' : 'preferences'}
                onChangeSubTab={tab => setActiveUserTab(tab as any)}
              />
            )}
          </>
        ) : (
          <AdminDashboard
            sectors={sectors}
            selectedSectorId={selectedSectorId}
            onSelectSector={setSelectedSectorId}
            claimsHistory={claimsHistory}
            onProcessClaim={handleProcessClaim}
            allUsers={allUsers}
          />
        )}

      </main>

      {/* Onboarding Welcome Modal */}
      {showOnboarding && (
        <OnboardingModal
          onSubscribeSuccess={handleSubscribeUser}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Admin Auth Modal */}
      {showAdminAuthModal && (
        <AuthModal
          onLoginSuccess={handleLoginAdminSuccess}
          onClose={() => setShowAdminAuthModal(false)}
        />
      )}

      {/* Footer Bar */}
      <footer className="bg-dark-900 border-t border-dark-800 py-6 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>MeteoAntofagasta Alerts • Costa Laguna & Región de Antofagasta</span>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser.role === 'ADMIN' ? (
              <button
                onClick={handleSwitchToUserMode}
                className="text-slate-400 hover:text-slate-200 transition-all flex items-center space-x-1"
              >
                <span>Salir de Modo Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAdminAuthModal(true)}
                className="text-slate-500 hover:text-slate-300 transition-all flex items-center space-x-1"
              >
                <Key className="w-3.5 h-3.5 text-led-cyan" />
                <span>Acceso Administrador 🔐</span>
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
