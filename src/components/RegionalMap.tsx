import React, { useEffect, useRef, useState } from 'react';
import { SectorInfo, RiskLevel } from '../types/sectors';
import { MapPin, AlertTriangle, ShieldCheck, Mountain, Wind, Thermometer, Droplets, Info } from 'lucide-react';

interface RegionalMapProps {
  sectors: SectorInfo[];
  selectedSectorId: string | null;
  onSelectSector: (id: string) => void;
}

export const RegionalMap: React.FC<RegionalMapProps> = ({
  sectors,
  selectedSectorId,
  onSelectSector
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'ALL'>('ALL');

  const activeSector = sectors.find(s => s.id === selectedSectorId) || sectors.find(s => s.id === 'costa_laguna');

  useEffect(() => {
    // Dynamically load Leaflet JS script if not already present on window
    const initializeLeafletMap = () => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (window as any).L;
      if (!L) {
        // Fallback script inject
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.crossOrigin = '';
        script.onload = () => buildMap(L || (window as any).L);
        document.head.appendChild(script);
      } else {
        buildMap(L);
      }
    };

    const buildMap = (L: any) => {
      if (!L || mapInstanceRef.current || !mapContainerRef.current) return;

      // Antofagasta region center
      const map = L.map(mapContainerRef.current, {
        center: [-24.100, -69.800],
        zoom: 7,
        zoomControl: true,
        attributionControl: false
      });

      // Dark Matter Map Tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Draw Cordillera de la Costa polygon highlight (>2200m zone)
      const cordilleraPolygonCoords = [
        [-24.30, -70.45],
        [-24.45, -70.40],
        [-24.95, -70.20],
        [-25.20, -70.30],
        [-24.90, -70.05],
        [-24.40, -70.15],
      ];

      L.polygon(cordilleraPolygonCoords, {
        color: '#F97316',
        weight: 2,
        dashArray: '5, 5',
        fillColor: '#F97316',
        fillOpacity: 0.15
      }).addTo(map).bindTooltip('Zona Cordillera de la Costa (>2.200m msnm) - Cota de Nieve', { permanent: false, className: 'leaflet-popup-tip' });

      // Draw Coastal Urban Strip polygon (Antofagasta / Costa Laguna / La Portada)
      const coastalPolygonCoords = [
        [-23.45, -70.45],
        [-23.58, -70.40],
        [-23.75, -70.45],
        [-23.75, -70.35],
        [-23.45, -70.35]
      ];

      L.polygon(coastalPolygonCoords, {
        color: '#00F0FF',
        weight: 2,
        fillColor: '#00F0FF',
        fillOpacity: 0.12
      }).addTo(map).bindTooltip('Franja Costera Urbana (Costa Laguna - 25m msnm)', { permanent: false });

      renderMarkers(L);
    };

    initializeLeafletMap();
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (L && mapInstanceRef.current) {
      renderMarkers(L);
    }
  }, [sectors, filterRisk]);

  const getMarkerColorHex = (risk: RiskLevel) => {
    switch (risk) {
      case 'ROJO': return '#EF4444';
      case 'NARANJO': return '#F97316';
      case 'AMARILLO': return '#F59E0B';
      case 'VERDE': return '#10B981';
      default: return '#64748B';
    }
  };

  const renderMarkers = (L: any) => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m: any) => mapInstanceRef.current.removeLayer(m));
    markersRef.current = {};

    sectors.forEach(sector => {
      if (filterRisk !== 'ALL' && sector.currentRisk !== filterRisk) return;

      const hexColor = getMarkerColorHex(sector.currentRisk);
      const isCosta = sector.id === 'costa_laguna';

      const customHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isCosta ? '34px' : '26px'};
          height: ${isCosta ? '34px' : '26px'};
          background-color: #0F172A;
          border: 2px solid ${hexColor};
          border-radius: 50%;
          box-shadow: 0 0 ${isCosta ? '15px' : '8px'} ${hexColor};
          cursor: pointer;
        ">
          <div style="
            width: ${isCosta ? '12px' : '8px'};
            height: ${isCosta ? '12px' : '8px'};
            background-color: ${hexColor};
            border-radius: 50%;
          "></div>
          ${isCosta ? `<div style="position:absolute; top:-6px; right:-6px; background:#00F0FF; color:#070B14; font-size:9px; font-weight:bold; padding:1px 4px; border-radius:4px;">FOCUS</div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([sector.lat, sector.lng], { icon: customIcon }).addTo(mapInstanceRef.current);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #F8FAFC;">${sector.name}</strong>
            <span style="font-size: 10px; background: ${hexColor}22; color: ${hexColor}; border: 1px solid ${hexColor}; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
              ${sector.currentRisk}
            </span>
          </div>
          <p style="font-size: 11px; color: #94A3B8; margin: 0 0 8px 0;">Altitud: <strong>${sector.altitudeMeters}m msnm</strong></p>
          <p style="font-size: 12px; color: #E2E8F0; margin: 0 0 8px 0; line-height: 1.4;">${sector.riskReason}</p>
          <div style="display: flex; gap: 8px; font-size: 11px; color: #00F0FF; font-family: monospace;">
            <span>🌡️ ${sector.tempCelsius}°C</span>
            <span>💨 ${sector.windSpeedKmH} km/h</span>
            <span>❄️ Iso0: ${sector.isotermaZeroMeters}m</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onSelectSector(sector.id));
      markersRef.current[sector.id] = marker;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Map Main Canvas */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Map Header Controls */}
        <div className="card-corporate p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-led-cyan" />
              <span>Mapa Regional de la Región de Antofagasta</span>
            </h2>
            <p className="text-xs text-slate-400">
              14 Sectores Monitoreados • Polígonos de Altitud & Franja Costera Urbana
            </p>
          </div>

          {/* Risk Level Filter Badges */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            <button
              onClick={() => setFilterRisk('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                filterRisk === 'ALL'
                  ? 'bg-led-cyan text-dark-950 font-bold'
                  : 'bg-dark-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({sectors.length})
            </button>
            {(['ROJO', 'NARANJO', 'AMARILLO', 'VERDE'] as RiskLevel[]).map(lvl => {
              const count = sectors.filter(s => s.currentRisk === lvl).length;
              return (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                    filterRisk === lvl
                      ? 'bg-dark-700 text-slate-100 border border-led-cyan'
                      : 'bg-dark-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{
                      backgroundColor:
                        lvl === 'ROJO' ? '#EF4444' : lvl === 'NARANJO' ? '#F97316' : lvl === 'AMARILLO' ? '#F59E0B' : '#10B981'
                    }}
                  ></span>
                  {lvl} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="relative rounded-2xl overflow-hidden border border-dark-700 shadow-2xl h-[520px] bg-dark-900">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Map Overlay Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-dark-950/90 backdrop-blur-md p-3.5 rounded-xl border border-dark-700 text-xs space-y-2 max-w-xs shadow-2xl">
            <div className="font-bold text-slate-200 text-[11px] uppercase font-mono tracking-wider text-led-cyan">
              Leyenda Espacial Antofagasta
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-risk-verde border border-emerald-400"></span>
              <span className="text-slate-300 text-[11px]">Verde: Sin riesgo relevante</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-risk-amarillo border border-amber-400"></span>
              <span className="text-slate-300 text-[11px]">Amarillo: Lluvia débil / Viento</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-risk-naranjo border border-orange-400"></span>
              <span className="text-slate-300 text-[11px]">Naranjo: Nieve probable &gt;2.200m</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-risk-rojo border border-red-400 animate-pulse"></span>
              <span className="text-slate-300 text-[11px]">Rojo: Nieve severa / Aluvión</span>
            </div>
            <div className="pt-2 border-t border-dark-800 text-[10px] text-slate-400 flex items-center space-x-1">
              <Info className="w-3.5 h-3.5 text-led-cyan flex-shrink-0" />
              <span>Costa Laguna (25m) aislada de alertas de nieve en cordillera.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Sector Sidebar Detail */}
      <div className="lg:col-span-4 space-y-4">
        {activeSector && (
          <div className="card-corporate p-6 rounded-2xl space-y-6 border border-led-cyan/30 shadow-led-glow">
            
            {/* Sector Title & Category */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-led-cyan bg-led-cyan/10 px-2 py-0.5 rounded border border-led-cyan/30">
                  {activeSector.category.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-extrabold text-slate-100 mt-1">
                  {activeSector.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Altitud: <strong className="text-slate-200">{activeSector.altitudeMeters} m.s.n.m.</strong>
                </p>
              </div>

              <div
                className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wide border shadow-md flex items-center space-x-1.5"
                style={{
                  backgroundColor:
                    activeSector.currentRisk === 'ROJO' ? 'rgba(239, 68, 68, 0.15)' :
                    activeSector.currentRisk === 'NARANJO' ? 'rgba(249, 115, 22, 0.15)' :
                    activeSector.currentRisk === 'AMARILLO' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  borderColor:
                    activeSector.currentRisk === 'ROJO' ? '#EF4444' :
                    activeSector.currentRisk === 'NARANJO' ? '#F97316' :
                    activeSector.currentRisk === 'AMARILLO' ? '#F59E0B' : '#10B981',
                  color:
                    activeSector.currentRisk === 'ROJO' ? '#EF4444' :
                    activeSector.currentRisk === 'NARANJO' ? '#F97316' :
                    activeSector.currentRisk === 'AMARILLO' ? '#F59E0B' : '#10B981'
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{activeSector.currentRisk}</span>
              </div>
            </div>

            {/* Distinction badges: Snow Risk vs Event Risk */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex flex-col justify-center ${
                activeSector.snowRisk
                  ? 'bg-red-500/10 border-red-500/40 text-red-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">Afectado por Nieve</span>
                <span className="font-bold text-sm mt-0.5">
                  {activeSector.snowRisk ? '❄️ SÍ (Riesgo Alto)' : '✅ NO (Sin Nieve)'}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border flex flex-col justify-center ${
                activeSector.eventRisk
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/50 border-dark-700 text-slate-400'
              }`}>
                <span className="text-[10px] uppercase font-mono font-semibold text-slate-400">Afectado por Evento</span>
                <span className="font-bold text-sm mt-0.5">
                  {activeSector.eventRisk ? '⚠️ Sí (Lluvia/Viento)' : '🛡️ Normal'}
                </span>
              </div>
            </div>

            {/* Risk Reason Explanation */}
            <div className="bg-dark-900/80 p-3.5 rounded-xl border border-dark-700 text-xs text-slate-300 space-y-1">
              <span className="font-mono font-bold text-led-cyan uppercase text-[10px] block">
                Diagnóstico del Motor 3-Capas
              </span>
              <p className="leading-relaxed">{activeSector.riskReason}</p>
            </div>

            {/* Live Metrics Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-dark-900 p-3 rounded-xl border border-dark-700 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-led-cyan/10 text-led-cyan">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Temperatura</div>
                  <div className="text-sm font-extrabold text-slate-100">{activeSector.tempCelsius}°C</div>
                </div>
              </div>

              <div className="bg-dark-900 p-3 rounded-xl border border-dark-700 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-led-cyan/10 text-led-cyan">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Ráfagas Viento</div>
                  <div className="text-sm font-extrabold text-slate-100">{activeSector.windSpeedKmH} km/h</div>
                </div>
              </div>

              <div className="bg-dark-900 p-3 rounded-xl border border-dark-700 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-led-cyan/10 text-led-cyan">
                  <Mountain className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Isoterma Cero</div>
                  <div className="text-sm font-extrabold text-slate-100">{activeSector.isotermaZeroMeters}m</div>
                </div>
              </div>

              <div className="bg-dark-900 p-3 rounded-xl border border-dark-700 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-led-cyan/10 text-led-cyan">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Lluvia Acum.</div>
                  <div className="text-sm font-extrabold text-slate-100">{activeSector.precipMmH} mm/h</div>
                </div>
              </div>
            </div>

            {/* Quick Sector Selector Buttons */}
            <div>
              <label className="text-xs font-mono font-bold text-slate-400 block mb-2">
                Seleccionar otro sector:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {sectors.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => onSelectSector(sec.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      sec.id === activeSector.id
                        ? 'bg-led-cyan text-dark-950 font-bold shadow-led-glow'
                        : 'bg-dark-800 text-slate-300 hover:bg-dark-700'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
