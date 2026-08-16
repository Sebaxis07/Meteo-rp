import React, { useState, useEffect } from 'react';
import { SectorInfo } from '../types/sectors';
import { fetchSectorHourlyForecast, SectorHourlyForecast, HourlyForecastPoint } from '../services/liveForecastService';
import { Calendar, CloudRain, Droplets, Thermometer, Mountain, Wind, AlertCircle, CheckCircle2, ChevronRight, Clock } from 'lucide-react';

interface HourlyWeatherCalendarProps {
  sectors: SectorInfo[];
  selectedSectorId?: string;
}

export const HourlyWeatherCalendar: React.FC<HourlyWeatherCalendarProps> = ({
  sectors,
  selectedSectorId = 'costa_laguna'
}) => {
  const [currentSectorId, setCurrentSectorId] = useState<string>(selectedSectorId);
  const [forecast, setForecast] = useState<SectorHourlyForecast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDateIso, setSelectedDateIso] = useState<string>('');

  const activeSector = sectors.find(s => s.id === currentSectorId) || sectors[0];

  const loadForecastData = async (sec: SectorInfo) => {
    setIsLoading(true);
    try {
      const data = await fetchSectorHourlyForecast(
        sec.id,
        sec.lat,
        sec.lng,
        sec.altitudeMeters,
        sec.name
      );
      setForecast(data);
      if (data.dailySummary.length > 0) {
        setSelectedDateIso(data.dailySummary[0].dateIso);
      }
    } catch (e) {
      console.error('Error loading hourly calendar forecast:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSector) {
      loadForecastData(activeSector);
    }
  }, [currentSectorId]);

  const selectedDaySummary = forecast?.dailySummary.find(d => d.dateIso === selectedDateIso);
  const selectedDayPoints = forecast?.hourlyPoints.filter(p => p.time.startsWith(selectedDateIso)) || [];

  return (
    <div className="space-y-6">
      
      {/* Calendar Header */}
      <div className="card-corporate p-6 rounded-3xl border border-led-cyan/40 shadow-led-glow space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-700 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase text-led-cyan bg-led-cyan/10 px-2.5 py-0.5 rounded border border-led-cyan/30">
                Pronóstico Detallado 7 Días Por Hora
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Open-Meteo API Real-Time
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 font-sans mt-1 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-led-cyan" />
              <span>Calendario de Lluvia y Nieve por Sector</span>
            </h2>
          </div>

          {/* Sector Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-mono font-bold text-slate-400 whitespace-nowrap">
              Sector:
            </label>
            <select
              value={currentSectorId}
              onChange={e => setCurrentSectorId(e.target.value)}
              className="bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-100 focus:border-led-cyan focus:outline-none"
            >
              {sectors.map(sec => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.altitudeMeters}m msnm)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 7-Day Day Selector Tabs */}
        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-led-cyan animate-pulse">
            Consultando datos de lluvia y temperatura hora por hora en tiempo real...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {forecast?.dailySummary.map(day => {
              const isSelected = day.dateIso === selectedDateIso;
              return (
                <button
                  key={day.dateIso}
                  onClick={() => setSelectedDateIso(day.dateIso)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-led-cyan text-dark-950 font-bold border-led-cyan shadow-led-glow'
                      : day.willRain || day.willSnow
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-dark-900 border-dark-700 text-slate-300 hover:bg-dark-800'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono uppercase truncate opacity-80">
                      {day.dayLabel.split(' ')[0]} {day.dayLabel.split(' ')[1]}
                    </div>
                    <div className="text-xs font-extrabold mt-0.5 truncate">
                      {day.dayLabel.split(' ').slice(2).join(' ')}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span>{day.maxTemp}° / {day.minTemp}°C</span>
                    </div>

                    <div className="flex items-center justify-between font-bold">
                      <span>{day.willRain ? '🌧️ Lluvia' : '☀️ Despejado'}</span>
                      <span className="text-[10px]">{day.maxPrecipProb}%</span>
                    </div>
                  </div>

                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Selected Day Hourly Timeline */}
      {selectedDaySummary && !isLoading && (
        <div className="card-corporate p-6 rounded-3xl border border-dark-700 space-y-6">
          
          {/* Day Verdict Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-dark-700">
            <div>
              <div className="text-xs font-mono font-bold text-led-cyan uppercase">
                Veredicto del Día: {selectedDaySummary.dayLabel} en {activeSector.name}
              </div>
              <h3 className="text-lg font-extrabold text-slate-100 mt-1">
                {selectedDaySummary.willRain
                  ? `🌧️ ALERTA DE LLUVIA: Se pronostican precipitaciones (Probabilidad Máx ${selectedDaySummary.maxPrecipProb}%, Total ${selectedDaySummary.totalPrecipMm} mm)`
                  : '☀️ SIN RIESGO DE LLUVIA RELEVANTE: Condiciones estables en tiempo real.'}
              </h3>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="bg-dark-800 px-3 py-1.5 rounded-xl border border-dark-700 text-slate-300">
                Horas con Lluvia: <strong className="text-led-cyan">{selectedDaySummary.rainHoursCount}h</strong>
              </div>
              <div className="bg-dark-800 px-3 py-1.5 rounded-xl border border-dark-700 text-slate-300">
                Altitud: <strong className="text-slate-100">{activeSector.altitudeMeters}m msnm</strong>
              </div>
            </div>
          </div>

          {/* Hourly Timeline Grid */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-led-cyan" />
              <span>Desglose Hora por Hora (24 Horas)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedDayPoints.map((pt, idx) => {
                const isRainyHour = pt.hasRainRisk || pt.precipMm > 0 || pt.precipProbability >= 35;
                const isSnowyHour = pt.hasSnowRisk;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 font-mono text-xs ${
                      isSnowyHour
                        ? 'bg-red-500/15 border-red-500/50 shadow-lg text-slate-100'
                        : isRainyHour
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-lg text-slate-100'
                        : 'bg-dark-900 border-dark-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-100 bg-dark-950 px-2 py-0.5 rounded border border-dark-700">
                        {pt.hourLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {pt.conditionLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 block text-[9.5px]">Temperatura</span>
                        <strong className="text-slate-100 text-xs">{pt.tempCelsius}°C</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9.5px]">Prob. Lluvia</span>
                        <strong className={isRainyHour ? 'text-amber-400 text-xs font-bold' : 'text-slate-200'}>
                          {pt.precipProbability}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9.5px]">Acumulación</span>
                        <strong className="text-slate-200">{pt.precipMm} mm/h</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9.5px]">Isoterma 0</span>
                        <strong className="text-led-cyan">{pt.isotermaZeroMeters}m</strong>
                      </div>
                    </div>

                    {isRainyHour && (
                      <div className="pt-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 p-1.5 rounded text-center border border-amber-500/30">
                        ⚠️ Alerta Lluvia a las {pt.hourLabel} ({pt.precipProbability}%)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
