import React, { useState } from 'react';
import { INITIAL_ANTOFAGASTA_SECTORS } from '../services/antofagastaSectors';
import { MacroZone } from '../types/sectors';
import { composeWelcomeEmail } from '../services/email/emailComposer';
import { sendRealGmailNotification } from '../services/email/smtpService';
import { Mail, MapPin, CheckCircle2, X, Send, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  onSubscribeSuccess: (email: string, watchZones: string[]) => void;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onSubscribeSuccess,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [selectedZones, setSelectedZones] = useState<string[]>(['Costa Laguna (Norte)', 'Centro Histórico (Centro)', 'Cerro Paranal (VLT - Cordillera)']);
  const [activeMacroZone, setActiveMacroZone] = useState<MacroZone | 'ALL'>('ALL');
  const [isSending, setIsSending] = useState(false);
  const [welcomeSentStatus, setWelcomeSentStatus] = useState<string | null>(null);

  const toggleZone = (zoneName: string) => {
    setSelectedZones(prev =>
      prev.includes(zoneName) ? prev.filter(z => z !== zoneName) : [...prev, zoneName]
    );
  };

  const selectAllInZone = (macro: MacroZone) => {
    const zoneSectors = INITIAL_ANTOFAGASTA_SECTORS.filter(s => s.macroZone === macro).map(s => s.name);
    setSelectedZones(prev => Array.from(new Set([...prev, ...zoneSectors])));
  };

  const filteredSectors = INITIAL_ANTOFAGASTA_SECTORS.filter(s => {
    if (activeMacroZone === 'ALL') return true;
    return s.macroZone === activeMacroZone;
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setWelcomeSentStatus(null);

    // Compose real welcome email ("Oye, te has inscrito en esto")
    const welcomeEmail = composeWelcomeEmail(email.trim(), selectedZones);

    // Dispatch real email via Gmail SMTP
    const dispatchRes = await sendRealGmailNotification(email.trim(), welcomeEmail);

    setIsSending(false);

    if (dispatchRes.success) {
      setWelcomeSentStatus(`¡Inscripción confirmada! Te hemos enviado un correo de bienvenida a ${email.trim()}`);
      setTimeout(() => {
        onSubscribeSuccess(email.trim(), selectedZones);
      }, 1800);
    } else {
      onSubscribeSuccess(email.trim(), selectedZones);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md overflow-y-auto">
      
      <div className="card-corporate w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-led-cyan/40 shadow-led-glow space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-dark-800 text-slate-400 hover:text-slate-100 hover:bg-dark-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-led-cyan/10 border border-led-cyan/30 text-led-cyan flex items-center justify-center mx-auto shadow-led-glow">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-led-cyan bg-led-cyan/10 px-3 py-1 rounded-full border border-led-cyan/30 inline-block">
            Bienvenido a MeteoAntofagasta Alerts
          </span>
          <h2 className="text-2xl font-extrabold text-slate-100 font-sans">
            ¿Quieres que te notifiquemos por correo?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Selecciona de la lista completa de sectores de Antofagasta (Sector Norte, Centro, Sur o Cordillera) donde deseas recibir alertas verificadas por correo.
          </p>
        </div>

        {/* Subscription Form */}
        <form onSubmit={handleSubscribe} className="space-y-5">
          
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-led-cyan" />
              <span>Ingresa tu Correo Electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* Master Catalog Sector Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-led-cyan" />
                <span>Sectores a Vigilar ({selectedZones.length} seleccionados)</span>
              </label>

              <span className="text-[11px] font-mono text-led-cyan">
                21 Sectores Disponibles
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
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    activeMacroZone === tab.id
                      ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                      : 'bg-dark-900 text-slate-400 border border-dark-700 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Complete Sectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredSectors.map(sec => {
                const isChecked = selectedZones.includes(sec.name);
                const isCosta = sec.id === 'costa_laguna';

                return (
                  <button
                    type="button"
                    key={sec.id}
                    onClick={() => toggleZone(sec.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
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

          {welcomeSentStatus && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs flex items-center space-x-2 font-mono">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{welcomeSentStatus}</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-led-cyan to-led-blue text-dark-950 font-extrabold transition-all hover:shadow-led-glow text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Enviando Correo de Confirmación...' : 'Sí, Inscribirme a las Alertas'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all"
            >
              Continuar como visitante sin inscribirme
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
