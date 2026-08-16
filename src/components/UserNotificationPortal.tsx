import React, { useState } from 'react';
import { UserAccount } from '../types/auth';
import { INITIAL_ANTOFAGASTA_SECTORS } from '../services/antofagastaSectors';
import { MacroZone } from '../types/sectors';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { HourlyWeatherCalendar } from './HourlyWeatherCalendar';
import { composeWelcomeEmail } from '../services/email/emailComposer';
import { sendRealGmailNotification, RealEmailDispatchResult } from '../services/email/smtpService';
import { Mail, Save, CheckCircle2, MapPin, ShieldCheck, Clock, Moon, Calendar, RefreshCw, Send, AlertTriangle } from 'lucide-react';

interface UserNotificationPortalProps {
  user: UserAccount;
  onSavePreferences: (updatedUser: UserAccount) => void;
  activeSubTab?: 'preferences' | 'email_preview';
  onChangeSubTab?: (tab: 'preferences' | 'email_preview') => void;
}

export const UserNotificationPortal: React.FC<UserNotificationPortalProps> = ({
  user,
  onSavePreferences,
  activeSubTab = 'preferences',
  onChangeSubTab
}) => {
  const [internalSubTab, setInternalSubTab] = useState<'preferences' | 'email_preview'>(activeSubTab);
  const [email, setEmail] = useState(user.email || '');
  const [watchZones, setWatchZones] = useState<string[]>(user.watch_zones || ['Costa Laguna (Norte)', 'Centro Histórico (Centro)']);
  const [watchEvents, setWatchEvents] = useState<('nevada' | 'lluvia' | 'viento' | 'frio')[]>(user.watch_events);
  const [minConfidence, setMinConfidence] = useState<number>(user.min_confidence);
  const [digestEnabled, setDigestEnabled] = useState<boolean>(user.digest_enabled);
  const [quietHoursStart, setQuietHoursStart] = useState<string>(user.quiet_hours[0]);
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>(user.quiet_hours[1]);

  const [activeMacroZone, setActiveMacroZone] = useState<MacroZone | 'ALL'>('ALL');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<RealEmailDispatchResult | null>(null);

  const currentTab = onChangeSubTab ? activeSubTab : internalSubTab;
  const setSubTab = (t: 'preferences' | 'email_preview') => {
    if (onChangeSubTab) onChangeSubTab(t);
    setInternalSubTab(t);
  };

  const toggleZone = (zoneName: string) => {
    setWatchZones(prev =>
      prev.includes(zoneName) ? prev.filter(z => z !== zoneName) : [...prev, zoneName]
    );
  };

  const toggleEvent = (eventId: 'nevada' | 'lluvia' | 'viento' | 'frio') => {
    setWatchEvents(prev =>
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
  };

  const filteredSectors = INITIAL_ANTOFAGASTA_SECTORS.filter(s => {
    if (activeMacroZone === 'ALL') return true;
    return s.macroZone === activeMacroZone;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...user,
      email: email.trim(),
      watch_zones: watchZones,
      watch_events: watchEvents,
      min_confidence: minConfidence,
      digest_enabled: digestEnabled,
      quiet_hours: [quietHoursStart, quietHoursEnd]
    };
    onSavePreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReSendTestEmail = async () => {
    const target = email.trim() || user.email;
    if (!target) return;

    setIsSendingTest(true);
    setTestResult(null);

    const welcomeEmail = composeWelcomeEmail(target, watchZones);
    const res = await sendRealGmailNotification(target, welcomeEmail);

    setTestResult(res);
    setIsSendingTest(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Portal Sub-Header Navigation */}
      <div className="card-corporate p-6 rounded-3xl border border-led-cyan/40 shadow-led-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-led-cyan bg-led-cyan/10 px-3 py-1 rounded-full border border-led-cyan/30">
            Gestión de Suscripción por Correo
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100 font-sans mt-2">
            Configuración de Alertas & Reenvío de Ejemplo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra tu correo y envía el correo de ejemplo cuantas veces quieras a tu buzón.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-dark-900 p-1.5 rounded-2xl border border-dark-700">
          <button
            onClick={() => setSubTab('preferences')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              currentTab === 'preferences'
                ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                : 'text-slate-300 hover:bg-dark-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Mis Preferencias</span>
          </button>

          <button
            onClick={() => setSubTab('email_preview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              currentTab === 'email_preview'
                ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                : 'text-slate-300 hover:bg-dark-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Previsualizar / Reenviar Correo</span>
          </button>
        </div>
      </div>

      {currentTab === 'preferences' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <form onSubmit={handleSave} className="card-corporate p-6 sm:p-8 rounded-3xl border border-dark-700 space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-2 flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-led-cyan" />
                <span>Tu Correo Electrónico Destino</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ingresa tu correo aquí (ej. tu@correo.com)"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none"
                required
              />
            </div>

            {/* Master Catalog 21 Sectors Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-led-cyan" />
                  <span>Sectores de Antofagasta a Vigilar ({watchZones.length} seleccionados)</span>
                </label>
                <span className="text-[11px] font-mono text-led-cyan">
                  Catálogo Maestro 21 Sectores
                </span>
              </div>

              {/* Macro Zone Filter Tabs */}
              <div className="flex items-center space-x-1.5 overflow-x-auto mb-3 pb-1">
                {[
                  { id: 'ALL', label: 'Todos (21)' },
                  { id: 'SECTOR_NORTE', label: 'Sector Norte' },
                  { id: 'SECTOR_CENTRO', label: 'Sector Centro' },
                  { id: 'SECTOR_SUR', label: 'Sector Sur' },
                  { id: 'CORDILLERA_REGIONAL', label: 'Cordillera' },
                ].map(tab => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveMacroZone(tab.id as MacroZone | 'ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                      activeMacroZone === tab.id
                        ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                        : 'bg-dark-900 text-slate-400 border border-dark-700 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid of 21 Sectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredSectors.map(sec => {
                  const isChecked = watchZones.includes(sec.name);
                  const isCosta = sec.id === 'costa_laguna';

                  return (
                    <button
                      type="button"
                      key={sec.id}
                      onClick={() => toggleZone(sec.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isChecked
                          ? isCosta
                            ? 'bg-led-cyan/15 border-led-cyan text-led-cyan font-bold shadow-led-glow'
                            : 'bg-dark-800 border-slate-500 text-slate-100 font-bold'
                          : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-[9.5px] font-mono uppercase text-led-cyan">
                          {sec.macroZone.replace('_', ' ')} • {sec.altitudeMeters}m
                        </div>
                        <div className="text-xs font-bold mt-0.5">{sec.name}</div>
                      </div>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-led-cyan flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleReSendTestEmail}
                disabled={isSendingTest || (!email.trim() && !user.email)}
                className="py-3.5 rounded-2xl bg-dark-800 hover:bg-dark-700 text-led-cyan border border-dark-600 hover:border-led-cyan transition-all text-xs font-mono font-bold flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSendingTest ? 'animate-spin' : ''}`} />
                <span>{isSendingTest ? 'Enviando...' : '🔄 Reenviar Correo de Ejemplo a Mi Buzón'}</span>
              </button>

              <button
                type="submit"
                className="py-3.5 rounded-2xl bg-gradient-to-r from-led-cyan to-led-blue text-dark-950 font-extrabold transition-all hover:shadow-led-glow text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3.5 rounded-2xl text-xs font-mono flex items-center space-x-2 ${
                testResult.success
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                  : 'bg-red-500/15 border border-red-500/40 text-red-300'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                <span>{testResult.success ? testResult.message : testResult.error}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center space-x-2 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Tus preferencias han sido guardadas con éxito!</span>
              </div>
            )}

          </form>
        </div>
      )}

      {currentTab === 'email_preview' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <EmailTemplatePreview userName={user.name} recipientEmail={email || user.email} watchZones={watchZones} />
        </div>
      )}

    </div>
  );
};
