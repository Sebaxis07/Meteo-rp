import React, { useState } from 'react';
import { EventClaimInput, EventClaimResult, SourceLevel, EventType } from '../types/verification';
import { verify_event_claim } from '../services/verificationEngine';
import { Cpu, ShieldCheck, FileText, Send, CheckCircle2 } from 'lucide-react';

interface LiveNoticeVerifierProps {
  onProcessClaim: (result: EventClaimResult) => void;
  onOpenAuditModal: (claim: EventClaimResult) => void;
}

export const LiveNoticeVerifier: React.FC<LiveNoticeVerifierProps> = ({
  onProcessClaim,
  onOpenAuditModal
}) => {
  const [rawText, setRawText] = useState('');
  const [sourceName, setSourceName] = useState('MeteoChile Oficial');
  const [sourceLevel, setSourceLevel] = useState<SourceLevel>('primary');
  const [officialCode, setOfficialCode] = useState('');
  const [claimedEvent, setClaimedEvent] = useState<EventType>('nevadas');
  const [altitudeMinM, setAltitudeMinM] = useState<number | undefined>(undefined);

  const [lastResult, setLastResult] = useState<EventClaimResult | null>(null);

  const handleExecuteVerification = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawText.trim()) return;

    const input: EventClaimInput = {
      raw_text: rawText,
      source_name: sourceName || 'Fuente Oficial Externa',
      source_level: sourceLevel,
      official_code: officialCode.trim() || undefined,
      claimed_zones: ['Cordillera de la Costa', 'Costa Laguna', 'Antofagasta'],
      claimed_event: claimedEvent,
      altitude_min_m: altitudeMinM
    };

    const result = verify_event_claim(input);
    setLastResult(result);
    onProcessClaim(result);
  };

  return (
    <div className="space-y-6">
      
      {/* Console Header */}
      <div className="card-corporate p-6 rounded-2xl border border-led-cyan/40 shadow-led-glow space-y-4">
        
        <div className="flex items-center justify-between border-b border-dark-700 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-led-cyan animate-pulse" />
              <span>Consola de Verificación para Avisos Reales</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa cualquier comunicado o texto de MeteoChile / SENAPRED para auditar su confianza (0-100), penalizaciones y riesgo en Costa Laguna
            </p>
          </div>

          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Motor 3-Capas Activo</span>
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleExecuteVerification} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Nombre de Fuente Oficial</label>
              <input
                type="text"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                placeholder="ej. MeteoChile, SENAPRED, Prensa"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-slate-100 focus:border-led-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Jerarquía Institucional</label>
              <select
                value={sourceLevel}
                onChange={e => setSourceLevel(e.target.value as SourceLevel)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-slate-100 focus:border-led-cyan focus:outline-none"
              >
                <option value="primary">Fuente Primaria (MeteoChile)</option>
                <option value="secondary">Fuente Secundaria (SENAPRED)</option>
                <option value="tertiary">Fuente Terciaria (Medios / Prensa)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Código del Aviso (opcional)</label>
              <input
                type="text"
                value={officialCode}
                onChange={e => setOfficialCode(e.target.value)}
                placeholder="ej. A422-1/2026"
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-slate-100 focus:border-led-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
              Texto del Boletín Oficial o Publicación:
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Pega aquí el texto del aviso meteorológico emitido por MeteoChile o SENAPRED..."
              className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-led-cyan to-led-blue text-dark-950 font-extrabold transition-all hover:shadow-led-glow text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditar Aviso con Motor `verify_event_claim()`</span>
          </button>

        </form>

      </div>

      {/* Verification Output Result Card */}
      {lastResult && (
        <div className="card-corporate p-6 rounded-2xl border border-dark-700 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-led-cyan" />
              <span>Resultado de Auditoría Real</span>
            </h3>

            <button
              onClick={() => onOpenAuditModal(lastResult)}
              className="px-3 py-1 rounded-lg bg-dark-800 text-led-cyan border border-led-cyan/40 hover:bg-dark-700 text-xs font-mono font-bold"
            >
              Ver Trazabilidad y Penalizaciones →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
              <div className="text-slate-400 text-[10px]">CONFIANZA CALCULADA</div>
              <div className="text-xl font-bold text-led-cyan">{lastResult.confidence} / 100</div>
            </div>

            <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
              <div className="text-slate-400 text-[10px]">IMPACTO EN COSTA LAGUNA</div>
              <div className="text-sm font-bold text-slate-100">{lastResult.affects_costa_laguna.risk_level}</div>
            </div>

            <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
              <div className="text-slate-400 text-[10px]">ACCIÓN RECOMENDADA</div>
              <div className="text-sm font-bold text-emerald-400">{lastResult.recommended_action}</div>
            </div>
          </div>

          <div className="bg-dark-950 p-3.5 rounded-xl border border-dark-800 text-xs text-slate-300">
            <span className="font-mono text-led-cyan font-bold block mb-1">Explicación Trazable:</span>
            {lastResult.explanation}
          </div>
        </div>
      )}

    </div>
  );
};
