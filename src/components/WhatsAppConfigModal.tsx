import React, { useState } from 'react';
import { UserWhatsAppConfig, EventType, EventClaimResult } from '../types/verification';
import { RiskLevel } from '../types/sectors';
import { WhatsAppPreview } from './WhatsAppPreview';
import { MessageSquare, Save, Send, ShieldCheck, CheckCircle2, Sliders, Bell } from 'lucide-react';
import { simulateWhatsAppDispatch, SimulationDispatchResult } from '../services/whatsappService';

interface WhatsAppConfigModalProps {
  config: UserWhatsAppConfig;
  onSaveConfig: (newConfig: UserWhatsAppConfig) => void;
  latestClaim?: EventClaimResult | null;
  sectorsList: { id: string; name: string }[];
}

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({
  config,
  onSaveConfig,
  latestClaim,
  sectorsList
}) => {
  const [phoneNumber, setPhoneNumber] = useState(config.phoneNumber);
  const [countryCode, setCountryCode] = useState(config.countryCode);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(config.subscribedSectors);
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<EventType[]>(config.alertTypes);
  const [minLevel, setMinLevel] = useState<RiskLevel>(config.minAlertLevel);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dispatchLog, setDispatchLog] = useState<SimulationDispatchResult | null>(null);

  const toggleSector = (id: string) => {
    setSelectedSectors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAlertType = (type: EventType) => {
    setSelectedAlertTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserWhatsAppConfig = {
      phoneNumber,
      countryCode,
      subscribedSectors: selectedSectors,
      alertTypes: selectedAlertTypes,
      minAlertLevel: minLevel,
      isEnabled
    };
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestDispatch = () => {
    if (!latestClaim) return;
    const testConfig: UserWhatsAppConfig = {
      phoneNumber,
      countryCode,
      subscribedSectors: selectedSectors,
      alertTypes: selectedAlertTypes,
      minAlertLevel: minLevel,
      isEnabled
    };
    const res = simulateWhatsAppDispatch(testConfig, latestClaim);
    setDispatchLog(res);
  };

  const sampleMessageText = latestClaim?.whatsapp_template_preview || `⚠️ *Actualización meteorológica para Antofagasta*
*Boletín:* A422-1/2026

🏔️ *Cordillera de la Costa (>2.200m):*
Nevadas probables sobre 2.200 metros en sectores altos.

🌊 *Costa Laguna:*
Sin nieve prevista. Viento moderado costero y llovizna débil.

🔭 *Cerro Paranal / Armazones:*
Riesgo alto por isoterma cero desentendida a 2.400m.

⏱️ *Vigencia:* hoy, 06:00 – 18:00 hs.
_Verificado por Motor 3-Capas (Confianza: 92/100)_`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Form Settings Left Column */}
      <div className="lg:col-span-7 space-y-6">
        
        <div className="card-corporate p-6 rounded-2xl border border-dark-700 space-y-6">
          
          <div className="flex items-center justify-between border-b border-dark-700 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Configuración de Notificaciones por WhatsApp</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                WhatsApp Business Cloud API Oficial • Filtros inteligentes por sector y tipo de riesgo
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={e => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Phone & Country Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
                  Código de País
                </label>
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none"
                >
                  <option value="+56">🇨🇱 Chile (+56)</option>
                  <option value="+54">🇦🇷 Argentina (+54)</option>
                  <option value="+51">🇵🇪 Perú (+51)</option>
                  <option value="+57">🇨🇴 Colombia (+57)</option>
                  <option value="+1">🇺🇸 EE.UU. (+1)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5">
                  Número de WhatsApp
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="9 1234 5678"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Minimum Risk Threshold */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-2 flex items-center justify-between">
                <span>Nivel Mínimo para Recibir Alerta</span>
                <span className="text-led-cyan text-[11px]">{minLevel}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['VERDE', 'AMARILLO', 'NARANJO', 'ROJO'] as RiskLevel[]).map(lvl => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setMinLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      minLevel === lvl
                        ? 'bg-led-cyan text-dark-950 border-led-cyan shadow-led-glow'
                        : 'bg-dark-900 text-slate-400 border-dark-700 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Types Selection */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
                Tipos de Alerta Deseados
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'nevadas', label: '❄️ Nieve' },
                  { id: 'precipitaciones', label: '🌧️ Lluvia' },
                  { id: 'viento', label: '💨 Viento' },
                  { id: 'tormentas', label: '⚡ Tormentas' },
                  { id: 'isoterma_cero_baja', label: '📉 Isoterma 0' },
                ].map(item => {
                  const isChecked = selectedAlertTypes.includes(item.id as EventType);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleAlertType(item.id as EventType)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                        isChecked
                          ? 'bg-dark-800 border-led-cyan text-led-cyan font-bold'
                          : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sectors Selection */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
                Sectores a Vigilar (Antofagasta & Cordillera)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {sectorsList.map(sec => {
                  const isChecked = selectedSectors.includes(sec.id);
                  const isCosta = sec.id === 'costa_laguna';
                  return (
                    <button
                      type="button"
                      key={sec.id}
                      onClick={() => toggleSector(sec.id)}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        isChecked
                          ? isCosta
                            ? 'bg-led-cyan/15 border-led-cyan text-led-cyan font-bold shadow-led-glow'
                            : 'bg-dark-800 border-slate-500 text-slate-100 font-bold'
                          : 'bg-dark-900 border-dark-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sec.name} {isCosta ? '★' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <button
                type="button"
                onClick={handleTestDispatch}
                className="px-4 py-2.5 rounded-xl bg-dark-800 text-slate-200 border border-dark-600 hover:border-led-cyan hover:text-led-cyan transition-all text-xs font-mono font-bold flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Simular Envíos WhatsApp</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all text-xs flex items-center space-x-2 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Preferencias</span>
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Preferencias de WhatsApp guardadas con éxito!</span>
              </div>
            )}

          </form>

        </div>

        {/* Dispatch Log Result Card */}
        {dispatchLog && (
          <div className="card-corporate p-4 rounded-xl border border-dark-700 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-led-cyan font-bold">
              <span>Respuesta Meta WhatsApp API (Simulación)</span>
              <span className="text-[10px] bg-dark-900 px-2 py-0.5 rounded border border-dark-700 text-slate-300">
                {dispatchLog.status}
              </span>
            </div>
            <div className="text-slate-300 space-y-1 text-[11px]">
              <div>Destinatario: <strong className="text-slate-100">{dispatchLog.recipient}</strong></div>
              <div>ID Respuesta: <span className="text-sky-400">{dispatchLog.metaResponseId}</span></div>
              <div>Timestamp: {new Date(dispatchLog.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}

      </div>

      {/* WhatsApp Smartphone Live Preview Column */}
      <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4">
        <div className="text-center">
          <span className="text-xs font-mono font-bold text-led-cyan uppercase tracking-wider block">
            Previsualización en Vivo
          </span>
          <h3 className="text-sm font-semibold text-slate-300 mt-0.5">
            Plantilla Oficial Meta WhatsApp Business
          </h3>
        </div>

        <WhatsAppPreview
          phoneNumber={phoneNumber}
          countryCode={countryCode}
          messageText={sampleMessageText}
        />
      </div>

    </div>
  );
};
