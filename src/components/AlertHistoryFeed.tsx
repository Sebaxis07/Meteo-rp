import React from 'react';
import { EventClaimResult } from '../types/verification';
import { ShieldCheck, MessageSquare, AlertOctagon, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

interface AlertHistoryFeedProps {
  claims: EventClaimResult[];
  onOpenAuditModal: (claim: EventClaimResult) => void;
}

export const AlertHistoryFeed: React.FC<AlertHistoryFeedProps> = ({ claims, onOpenAuditModal }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-led-cyan" />
            <span>Feed de Avisos & Historial Verificado ({claims.length})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Boletines analizados mediante la arquitectura de verificación en 3 capas
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {claims.map((claim, idx) => {
          const isConfirmed = claim.status === 'confirmed';
          const isDiscarded = claim.status === 'discarded';

          return (
            <div
              key={idx}
              className="card-corporate p-4 rounded-2xl border border-dark-700 hover:border-dark-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  
                  {/* Confidence Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-extrabold border ${
                      claim.confidence >= 80
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : claim.confidence >= 50
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                  >
                    Confianza: {claim.confidence}/100
                  </span>

                  {/* Official Code */}
                  <span className="text-xs font-mono text-slate-200 font-bold bg-dark-900 px-2 py-0.5 rounded border border-dark-700">
                    {claim.official_code || 'Sin Código'}
                  </span>

                  {/* Source Level */}
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-dark-800 px-2 py-0.5 rounded">
                    Fuente: {claim.source_name} ({claim.source_level})
                  </span>

                  {/* Event Type */}
                  <span className="text-[10px] font-mono text-led-cyan uppercase font-bold bg-led-cyan/10 px-2 py-0.5 rounded border border-led-cyan/20">
                    {claim.event_type}
                  </span>

                </div>

                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-sans">
                  {claim.explanation}
                </p>

                <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-3">
                  <span>Costa Laguna: <strong className="text-slate-200">{claim.affects_costa_laguna.risk_level}</strong></span>
                  <span>Cota: {claim.altitude_min_m ? `sobre ${claim.altitude_min_m}m` : 'superficie'}</span>
                  <span>Vigencia: {new Date(claim.valid_from).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => onOpenAuditModal(claim)}
                  className="px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-led-cyan border border-dark-600 hover:border-led-cyan transition-all text-xs font-mono font-bold flex items-center space-x-1.5"
                >
                  <span>Auditar Motor</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
