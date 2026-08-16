import React, { useState } from 'react';
import { SectorInfo, MacroZone } from '../types/sectors';
import { MapPin, Mountain, Wind, Thermometer, Droplets, CheckCircle, Compass } from 'lucide-react';

interface SectorCardsGridProps {
  sectors: SectorInfo[];
  selectedSectorId: string | null;
  onSelectSector: (id: string) => void;
}

export const SectorCardsGrid: React.FC<SectorCardsGridProps> = ({
  sectors,
  selectedSectorId,
  onSelectSector
}) => {
  const [activeMacroZone, setActiveMacroZone] = useState<MacroZone | 'ALL'>('ALL');

  const costaLaguna = sectors.find(s => s.id === 'costa_laguna');

  const filteredSectors = sectors.filter(s => {
    if (s.id === 'costa_laguna') return false; // Rendered in top feature card
    if (activeMacroZone === 'ALL') return true;
    return s.macroZone === activeMacroZone;
  });

  return (
    <div className="space-y-8">
      
      {/* Featured Focus Card: Costa Laguna (Sector Norte) */}
      {costaLaguna && (
        <div className="card-corporate p-6 rounded-3xl border-2 border-led-cyan shadow-led-glow relative overflow-hidden">
          
          <div className="absolute top-0 right-0 bg-led-cyan text-dark-950 px-4 py-1.5 rounded-bl-2xl text-xs font-mono font-extrabold uppercase tracking-wider shadow-md">
            ★ Sector Norte • Costa Laguna
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-led-cyan/10 border border-led-cyan/30 text-led-cyan">
                  <MapPin className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-led-cyan bg-led-cyan/10 px-2 py-0.5 rounded border border-led-cyan/30">
                      SECTOR NORTE
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Altitud: <strong>25 m.s.n.m.</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-100 font-sans mt-0.5">
                    Costa Laguna, Antofagasta
                  </h2>
                  <p className="text-xs text-slate-400">
                    {costaLaguna.callesHitos}
                  </p>
                </div>
              </div>

              <div className="bg-dark-900/90 p-4 rounded-2xl border border-dark-700 space-y-2">
                <div className="text-xs font-mono font-bold text-led-cyan uppercase">
                  Diagnóstico Meteorológico en Tiempo Real (Open-Meteo API)
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {costaLaguna.riskReason}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4" />
                  <span>Sin Nieve (Cota 25m msnm)</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-300 bg-dark-800 px-3 py-1.5 rounded-xl border border-dark-700">
                  <span>Datos Reales En Vivo</span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="bg-dark-900 p-3.5 rounded-2xl border border-dark-700 flex items-center space-x-3">
                <Thermometer className="w-5 h-5 text-led-cyan" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Temperatura</div>
                  <div className="text-base font-extrabold text-slate-100">{costaLaguna.tempCelsius}°C</div>
                </div>
              </div>

              <div className="bg-dark-900 p-3.5 rounded-2xl border border-dark-700 flex items-center space-x-3">
                <Wind className="w-5 h-5 text-led-cyan" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Viento Ráfaga</div>
                  <div className="text-base font-extrabold text-slate-100">{costaLaguna.windSpeedKmH} km/h</div>
                </div>
              </div>

              <div className="bg-dark-900 p-3.5 rounded-2xl border border-dark-700 flex items-center space-x-3">
                <Mountain className="w-5 h-5 text-led-cyan" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Isoterma Cero</div>
                  <div className="text-base font-extrabold text-slate-100">{costaLaguna.isotermaZeroMeters}m</div>
                </div>
              </div>

              <div className="bg-dark-900 p-3.5 rounded-2xl border border-dark-700 flex items-center space-x-3">
                <Droplets className="w-5 h-5 text-led-cyan" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400">Lluvia Acum.</div>
                  <div className="text-base font-extrabold text-slate-100">{costaLaguna.precipMmH} mm/h</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Catálogo Maestro Sector Navigation Tabs */}
      <div className="space-y-4">
        
        <div className="card-corporate p-4 rounded-2xl border border-dark-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-led-cyan" />
              <span>Catálogo Maestro de Sectores de Antofagasta</span>
            </h3>
            <p className="text-xs text-slate-400">
              División urbana consolidada: Sector Norte, Sector Centro, Sector Sur y Cordillera
            </p>
          </div>

          <div className="flex items-center space-x-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `Todos (${sectors.length})` },
              { id: 'SECTOR_NORTE', label: 'Sector Norte' },
              { id: 'SECTOR_CENTRO', label: 'Sector Centro' },
              { id: 'SECTOR_SUR', label: 'Sector Sur' },
              { id: 'CORDILLERA_REGIONAL', label: 'Cordillera' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveMacroZone(tab.id as MacroZone | 'ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  activeMacroZone === tab.id
                    ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                    : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-dark-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectors.map(sec => {
            const isSelected = sec.id === selectedSectorId;
            return (
              <div
                key={sec.id}
                onClick={() => onSelectSector(sec.id)}
                className={`card-corporate p-5 rounded-2xl cursor-pointer card-corporate-hover space-y-3 transition-all ${
                  isSelected ? 'border-led-cyan shadow-led-glow bg-dark-850' : 'border-dark-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-led-cyan bg-led-cyan/10 px-2 py-0.5 rounded border border-led-cyan/20">
                        {sec.macroZone.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {sec.altitudeMeters}m msnm
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-100 mt-1">
                      {sec.name}
                    </h4>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border shadow-sm"
                    style={{
                      backgroundColor:
                        sec.currentRisk === 'ROJO' ? 'rgba(239, 68, 68, 0.15)' :
                        sec.currentRisk === 'NARANJO' ? 'rgba(249, 115, 22, 0.15)' :
                        sec.currentRisk === 'AMARILLO' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      borderColor:
                        sec.currentRisk === 'ROJO' ? '#EF4444' :
                        sec.currentRisk === 'NARANJO' ? '#F97316' :
                        sec.currentRisk === 'AMARILLO' ? '#F59E0B' : '#10B981',
                      color:
                        sec.currentRisk === 'ROJO' ? '#EF4444' :
                        sec.currentRisk === 'NARANJO' ? '#F97316' :
                        sec.currentRisk === 'AMARILLO' ? '#F59E0B' : '#10B981'
                    }}
                  >
                    {sec.currentRisk}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 bg-dark-900 p-2 rounded-lg border border-dark-800">
                  📍 {sec.callesHitos}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {sec.riskReason}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-dark-800">
                  <span>🌡️ {sec.tempCelsius}°C</span>
                  <span>💨 {sec.windSpeedKmH} km/h</span>
                  <span className={sec.snowRisk ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    {sec.snowRisk ? '❄️ Nieve' : 'Sin nieve'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
