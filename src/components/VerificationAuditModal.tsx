import React from 'react';
import { EventClaimResult } from '../types/verification';
import { ShieldCheck, AlertOctagon, CheckCircle2, FileText, Cpu, ChevronRight, X, AlertTriangle } from 'lucide-react';

interface VerificationAuditModalProps {
  claim: EventClaimResult;
  onClose: () => void;
}

export const VerificationAuditModal: React.FC<VerificationAuditModalProps> = ({ claim, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md overflow-y-auto">
      
      <div className="card-corporate w-full max-w-3xl rounded-2xl border border-led-cyan/40 shadow-led-glow p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-dark-800 text-slate-400 hover:text-slate-100 hover:bg-dark-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-dark-700 pb-4">
          <div className="p-3 rounded-xl bg-led-cyan/10 border border-led-cyan/30 text-led-cyan">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-led-cyan tracking-wider">
              Auditoría del Motor 3-Capas • verify_event_claim()
            </span>
            <h2 className="text-xl font-extrabold text-slate-100">
              Desglose Trazable del Aviso meteorológico
            </h2>
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          
          {/* Confidence Score Pill */}
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-1">
            <div className="text-slate-400 text-[10px]">PUNTAJE DE CONFIANZA</div>
            <div className="text-2xl font-extrabold text-led-cyan flex items-center space-x-2">
              <span>{claim.confidence}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">
              Estado: <strong className="text-slate-200">{claim.status.replace(/_/g, ' ')}</strong>
            </div>
          </div>

          {/* Official Code Pill */}
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-1">
            <div className="text-slate-400 text-[10px]">CÓDIGO TÉCNICO AUDITADO</div>
            <div className="text-base font-extrabold text-slate-100">
              {claim.official_code || 'SIN CÓDIGO (0 pts)'}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              Fuente: <strong className="text-slate-200">{claim.source_name} ({claim.source_level})</strong>
            </div>
          </div>

          {/* Action Recommended Pill */}
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-1">
            <div className="text-slate-400 text-[10px]">DECISIÓN FINAL MOTOR</div>
            <div className={`text-base font-extrabold ${
              claim.recommended_action === 'NOTIFY_WHATSAPP'
                ? 'text-emerald-400'
                : claim.recommended_action === 'MONITOR_ONLY'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}>
              {claim.recommended_action}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              Regla Madre de Notificación
            </div>
          </div>

        </div>

        {/* Penalties Engine Log */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Penalizaciones Automáticas Aplicadas ({claim.penalties_applied.length})</span>
          </h3>

          {claim.penalties_applied.length === 0 ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Sin penalizaciones. Información limpia, consistente y con código verificable.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {claim.penalties_applied.map((p, idx) => (
                <div key={idx} className="bg-dark-900 p-3 rounded-xl border border-red-500/30 text-xs flex items-center justify-between text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold text-[10px]">
                      {p.code}
                    </span>
                    <span>{p.reason}</span>
                  </div>
                  <span className="font-mono font-bold text-red-400">
                    {p.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GeoSpatial Resolver: Costa Laguna Impact */}
        <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-2 text-xs">
          <div className="text-xs font-mono font-bold text-led-cyan uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Resolución Espacial para Costa Laguna (25m msnm)</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            {claim.affects_costa_laguna.reason}
          </p>
          <div className="flex items-center space-x-4 pt-2 font-mono text-[11px]">
            <span>Nieve en Costa Laguna: <strong className="text-slate-100">{claim.affects_costa_laguna.snow_risk ? 'SÍ' : 'NO (Improbable)'}</strong></span>
            <span>Riesgo Global Sector: <strong className="text-amber-400">{claim.affects_costa_laguna.risk_level}</strong></span>
          </div>
        </div>

        {/* Full Auditable Explanation Trace */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Explicación Auditada en Lenguaje Natural:
          </label>
          <div className="bg-dark-950 p-4 rounded-xl border border-dark-700 font-mono text-xs text-slate-300 leading-relaxed">
            {claim.explanation}
          </div>
        </div>

        {/* Raw Claims Output Preview JSON */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Objeto JSON Estructurado Normalizado:
          </label>
          <pre className="bg-dark-950 p-4 rounded-xl border border-dark-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
            {JSON.stringify(claim, null, 2)}
          </pre>
        </div>

      </div>

    </div>
  );
};
