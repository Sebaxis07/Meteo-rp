import React, { useState } from 'react';
import { WeatherEventClaim, EmailTemplateKey } from '../types/emailAlert';
import { composeAlertEmail, composeWelcomeEmail } from '../services/email/emailComposer';
import { sendRealGmailNotification, getSavedGmailAppPassword, saveGmailAppPassword, RealEmailDispatchResult } from '../services/email/smtpService';
import { Mail, Send, CheckCircle2, AlertTriangle, Key, Smartphone, Monitor, RefreshCw, Sparkles } from 'lucide-react';

interface EmailTemplatePreviewProps {
  event?: WeatherEventClaim;
  userName?: string;
  recipientEmail?: string;
  watchZones?: string[];
}

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  event,
  userName = 'Suscriptor',
  recipientEmail = '',
  watchZones = ['Costa Laguna', 'Antofagasta ciudad']
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateKey | 'WELCOME'>('NEW_CONFIRMED');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  
  const [targetEmail, setTargetEmail] = useState<string>(recipientEmail || '');
  const [appPassword, setAppPassword] = useState<string>(getSavedGmailAppPassword());
  const [isSending, setIsSending] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<RealEmailDispatchResult | null>(null);

  const defaultEvent: WeatherEventClaim = event || {
    event_id: 'evt_2026_08_15_001',
    event_type: 'nevada',
    status: 'confirmed',
    confidence: 92,
    issued_at: new Date().toISOString(),
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 43200000).toISOString(),
    affected_zones: ['Costa Laguna', 'Antofagasta ciudad', 'Paranal', 'Armazones'],
    impact_summary: {
      costa_laguna: 'Sin nieve prevista. Viento moderado 35 km/h.',
      antofagasta_ciudad: 'Sin nieve; llovizna débil matinal en litoral.',
      paranal_armazones: 'Nevadas probables sobre 2.200m msnm.',
      cordillera_costa: 'Acumulación de nieve 5 a 10 cm.'
    },
    recommended_action: 'Evitar subir a sectores altos de la Cordillera de la Costa sin verificar condiciones del camino.',
    next_update_time: '18:00 hs',
    sources: [{ type: 'primary', name: 'MeteoChile', reference: 'A422-1/2026' }],
    change_type: 'new'
  };

  const rendered = selectedTemplate === 'WELCOME'
    ? composeWelcomeEmail(targetEmail || 'correo@ejemplo.com', watchZones)
    : composeAlertEmail(defaultEvent, userName || targetEmail.split('@')[0] || 'Suscriptor', selectedTemplate as EmailTemplateKey);

  const handleSendRealEmail = async () => {
    if (!targetEmail.trim()) return;
    setIsSending(true);
    setDispatchResult(null);

    if (appPassword) {
      saveGmailAppPassword(appPassword);
    }

    const res = await sendRealGmailNotification(targetEmail.trim(), rendered, appPassword);
    setDispatchResult(res);
    setIsSending(false);
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Real Email Dispatch Bar */}
      <div className="card-corporate p-5 rounded-3xl border border-led-cyan/40 shadow-led-glow space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-led-cyan" />
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                <span>Enviar / Repetir Correo Real por Gmail</span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  SMTP Activo
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Remitente: <strong className="text-led-cyan">thefilex07@gmail.com</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="email"
              value={targetEmail}
              onChange={e => setTargetEmail(e.target.value)}
              placeholder="Ingresa tu correo aquí"
              className="bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none flex-1 sm:w-64"
            />
            <button
              onClick={handleSendRealEmail}
              disabled={isSending || !targetEmail.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-led-cyan to-led-blue hover:shadow-led-glow text-dark-950 font-extrabold transition-all text-xs flex items-center space-x-1.5 shadow-md flex-shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Enviando...' : 'Reenviar Correo Real'}</span>
            </button>
          </div>
        </div>

        {/* Dispatch Result Pill */}
        {dispatchResult && (
          <div className={`p-3 rounded-xl text-xs font-mono flex items-center space-x-2 ${
            dispatchResult.success
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
              : 'bg-red-500/15 border border-red-500/40 text-red-300'
          }`}>
            {dispatchResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span>{dispatchResult.success ? dispatchResult.message : dispatchResult.error}</span>
          </div>
        )}
      </div>

      {/* Template Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-900 p-3 rounded-2xl border border-dark-700">
        
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {[
            { key: 'WELCOME', label: '✉️ Inscripción Confirmada' },
            { key: 'NEW_CONFIRMED', label: '1. Nuevo Evento' },
            { key: 'RELEVANT_UPDATE', label: '2. Actualización' },
            { key: 'NO_AFFECTATION', label: '3. Sin Riesgo' },
            { key: 'ESCALATION', label: '4. Escalada' },
            { key: 'CORRECTION', label: '5. Corrección' },
            { key: 'ALL_CLEAR', label: '6. Fin Evento' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setSelectedTemplate(t.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                selectedTemplate === t.key
                  ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                  : 'bg-dark-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1 bg-dark-800 p-1 rounded-xl border border-dark-700">
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'mobile' ? 'bg-led-cyan text-dark-950 font-bold' : 'text-slate-400'
            }`}
            title="Vista Móvil"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              viewMode === 'desktop' ? 'bg-led-cyan text-dark-950 font-bold' : 'text-slate-400'
            }`}
            title="Vista Escritorio"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Simulated Email Client Envelope */}
      <div className={`mx-auto transition-all ${viewMode === 'mobile' ? 'max-w-md' : 'max-w-3xl'} bg-dark-900 rounded-3xl overflow-hidden border border-dark-700 shadow-2xl`}>
        
        {/* Email Header Metadata */}
        <div className="bg-dark-950 p-4 border-b border-dark-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <div>De: <strong className="text-led-cyan">thefilex07@gmail.com</strong></div>
            <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="text-slate-300">
            Para: <strong className="text-slate-100">{targetEmail || '(Sin correo configurado)'}</strong>
          </div>
          <div className="text-sm font-bold text-slate-100 pt-1">
            Asunto: {rendered.subject}
          </div>
          <div className="text-[11px] text-slate-400 italic">
            Preheader: {rendered.preheader}
          </div>
        </div>

        {/* Rendered HTML Email Content */}
        <div className="p-2 bg-[#070B14] min-h-[420px]">
          <iframe
            title="Previsualizador Correo HTML"
            srcDoc={rendered.htmlBody}
            className="w-full h-[480px] border-0 rounded-2xl"
          />
        </div>

      </div>

    </div>
  );
};
