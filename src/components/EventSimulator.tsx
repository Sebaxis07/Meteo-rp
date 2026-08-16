import React, { useState } from 'react';
import { EventClaimInput, EventClaimResult, SourceLevel, EventType } from '../types/verification';
import { verify_event_claim } from '../services/verificationEngine';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Cpu, RefreshCw, Send } from 'lucide-react';

interface EventSimulatorProps {
  onProcessClaim: (result: EventClaimResult) => void;
  onOpenAuditModal: (claim: EventClaimResult) => void;
}

export const EventSimulator: React.FC<EventSimulatorProps> = ({
  onProcessClaim,
  onOpenAuditModal
}) => {
  const [rawText, setRawText] = useState(
    'Aviso Meteorológico A422-1/2026 emitido por MeteoChile: Nevadas normales a moderadas sobre 2.200 metros en la Cordillera de la Costa y precordillera de la Región de Antofagasta. Vigencia desde el martes 18 de agosto a las 06:00 hs.'
  );
  const [sourceName, setSourceName] = useState('MeteoChile Oficial');
  const [sourceLevel, setSourceLevel] = useState<SourceLevel>('primary');
  const [officialCode, setOfficialCode] = useState('A422-1/2026');
  const [claimedEvent, setClaimedEvent] = useState<EventType>('nevadas');
  const [altitudeMinM, setAltitudeMinM] = useState<number>(2200);

  const [lastResult, setLastResult] = useState<EventClaimResult | null>(null);

  const handleExecuteVerification = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const input: EventClaimInput = {
      raw_text: rawText,
      source_name: sourceName,
      source_level: sourceLevel,
      official_code: officialCode || undefined,
      claimed_zones: ['Cordillera de la Costa', 'Costa Laguna', 'Cerro Paranal'],
      claimed_event: claimedEvent,
      altitude_min_m: altitudeMinM
    };

    const result = verify_event_claim(input);
    setLastResult(result);
    onProcessClaim(result);
  };

  const loadPreset = (presetType: 'METEOCHILE' | 'BULO_RRSS' | 'SENAPRED_VIENTO' | 'ISOTERMA_ALTA') => {
    if (presetType === 'METEOCHILE') {
      setRawText(
        'Boletín MeteoChile A422-1/2026: Nevadas en sectores altos de la Cordillera de la Costa sobre 2.200 m.s.n.m. Costa Laguna sin nieve prevista, pero sí viento moderado.'
      );
      setSourceName('MeteoChile');
      setSourceLevel('primary');
      setOfficialCode('A422-1/2026');
      setClaimedEvent('nevadas');
      setAltitudeMinM(2200);
    } else if (presetType === 'BULO_RRSS') {
      setRawText(
        '🔴 URGENTE DIFUNDIR CADENA!! Alerta roja extrema de última hora! Se viene nevazón catastrófica en la playa de Costa Laguna e inundaciones en toda la ciudad costera!'
      );
      setSourceName('Post en Facebook / Redes');
      setSourceLevel('tertiary');
      setOfficialCode('');
      setClaimedEvent('nevadas');
      setAltitudeMinM(0);
    } else if (presetType === 'SENAPRED_VIENTO') {
      setRawText(
        'SENAPRED ATP-09/2026: Alerta Temprana Preventiva por viento de intensidad normal a moderada (55-70 km/h) en franja costera de Antofagasta, Costa Laguna y Ruta 1.'
      );
      setSourceName('SENAPRED Oficial');
      setSourceLevel('secondary');
      setOfficialCode('SENAPRED-ATP-09');
      setClaimedEvent('viento');
      setAltitudeMinM(0);
    } else if (presetType === 'ISOTERMA_ALTA') {
      setRawText(
        'Boletín A510/2026: Precipitaciones moderadas con Isoterma Cero Alta a 3.500 m.s.n.m. Riesgo de bajada de agua en quebradas de la Cordillera de la Costa.'
      );
      setSourceName('MeteoChile');
      setSourceLevel('primary');
      setOfficialCode('A510/2026');
      setClaimedEvent('precipitaciones');
      setAltitudeMinM(3500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sandbox Header */}
      <div className="card-corporate p-6 rounded-2xl border border-led-cyan/40 shadow-led-glow space-y-4">
        
        <div className="flex items-center justify-between border-b border-dark-700 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-led-cyan animate-pulse" />
              <span>Simulador Sandbox del Motor `verify_event_claim()`</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Prueba escenarios de avisos meteorológicos reales, bulos en redes y alertas SENAPRED
            </p>
          </div>

          <span className="text-xs font-mono bg-led-cyan/10 text-led-cyan px-3 py-1 rounded-lg border border-led-cyan/30">
            Modo Pruebas Interactivas
          </span>
        </div>

        {/* Preset Selector Buttons */}
        <div>
          <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
            Escenarios de Prueba Rápidos:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => loadPreset('METEOCHILE')}
              className="p-3 rounded-xl bg-dark-900 border border-dark-700 hover:border-led-cyan hover:bg-dark-850 text-left transition-all space-y-1"
            >
              <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                <span>🏔️ MeteoChile A422</span>
                <span className="text-[10px] text-emerald-400 font-mono">Oficial</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">Nevada sobre 2.200m en cordillera</p>
            </button>

            <button
              onClick={() => loadPreset('BULO_RRSS')}
              className="p-3 rounded-xl bg-dark-900 border border-dark-700 hover:border-red-500 hover:bg-dark-850 text-left transition-all space-y-1"
            >
              <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                <span>🚨 Bulo Redes Sociales</span>
                <span className="text-[10px] text-red-400 font-mono">Fake News</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">Nieve falsa en playa Costa Laguna</p>
            </button>

            <button
              onClick={() => loadPreset('SENAPRED_VIENTO')}
              className="p-3 rounded-xl bg-dark-900 border border-dark-700 hover:border-amber-500 hover:bg-dark-850 text-left transition-all space-y-1"
            >
              <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                <span>💨 SENAPRED Viento</span>
                <span className="text-[10px] text-amber-400 font-mono">Alerta ATP</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">Viento fuerte 70km/h en costa</p>
            </button>

            <button
              onClick={() => loadPreset('ISOTERMA_ALTA')}
              className="p-3 rounded-xl bg-dark-900 border border-dark-700 hover:border-sky-500 hover:bg-dark-850 text-left transition-all space-y-1"
            >
              <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                <span>🌧️ Isoterma Cero Alta</span>
                <span className="text-[10px] text-sky-400 font-mono">Aluvión</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">Lluvia con Iso0 a 3.500m</p>
            </button>
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleExecuteVerification} className="space-y-4 pt-2">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Nombre de Fuente</label>
              <input
                type="text"
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-slate-100 focus:border-led-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Nivel de Fuente</label>
              <select
                value={sourceLevel}
                onChange={e => setSourceLevel(e.target.value as SourceLevel)}
                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-slate-100 focus:border-led-cyan focus:outline-none"
              >
                <option value="primary">Primaria (MeteoChile)</option>
                <option value="secondary">Secundaria (SENAPRED)</option>
                <option value="tertiary">Terciaria (Redes / Medios)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Código Oficial (opcional)</label>
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
              Texto Completo del Aviso / Publicación:
            </label>
            <textarea
              rows={3}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-led-cyan to-led-blue text-dark-950 font-extrabold transition-all hover:shadow-led-glow text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-dark-950" />
            <span>Ejecutar Algoritmo `verify_event_claim()`</span>
          </button>

        </form>

      </div>

      {/* Verification Output Result Card */}
      {lastResult && (
        <div className="card-corporate p-6 rounded-2xl border border-dark-700 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-700 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-led-cyan" />
              <span>Resultado de la Verificación</span>
            </h3>

            <button
              onClick={() => onOpenAuditModal(lastResult)}
              className="px-3 py-1 rounded-lg bg-dark-800 text-led-cyan border border-led-cyan/40 hover:bg-dark-700 text-xs font-mono font-bold"
            >
              Ver Auditoría Trazable Completa →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
              <div className="text-slate-400 text-[10px]">CONFIANZA CALCULADA</div>
              <div className="text-xl font-bold text-led-cyan">{lastResult.confidence} / 100</div>
            </div>

            <div className="bg-dark-900 p-3 rounded-xl border border-dark-700">
              <div className="text-slate-400 text-[10px]">ESTADO GEOGRÁFICO COSTA LAGUNA</div>
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
