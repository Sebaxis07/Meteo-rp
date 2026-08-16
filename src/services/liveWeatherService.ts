import { SectorInfo, RiskLevel } from '../types/sectors';
import { INITIAL_ANTOFAGASTA_SECTORS } from './antofagastaSectors';

export interface OpenMeteoResponseItem {
  latitude: number;
  longitude: number;
  elevation: number;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    freezing_level_height: number;
  };
}

export async function fetchLiveSectorData(baseSectors: SectorInfo[]): Promise<SectorInfo[]> {
  const lats = baseSectors.map(s => s.lat).join(',');
  const lngs = baseSectors.map(s => s.lng).join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,wind_speed_10m,wind_gusts_10m,freezing_level_height&timezone=America%2FSantiago`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error ${res.status}`);
    }
    const data = await res.json();
    const items: OpenMeteoResponseItem[] = Array.isArray(data) ? data : [data];

    return baseSectors.map((sector, index) => {
      const live = items[index]?.current;
      if (!live) return sector;

      const tempCelsius = Math.round(live.temperature_2m * 10) / 10;
      const windSpeedKmH = Math.round(live.wind_gusts_10m || live.wind_speed_10m);
      const precipMmH = Math.round(live.precipitation * 10) / 10;
      const isotermaZeroMeters = Math.round(live.freezing_level_height || 2800);
      const liveSnowfall = live.snowfall || 0;

      // Evaluate real risk levels based strictly on real live data
      let currentRisk: RiskLevel = 'VERDE';
      let snowRisk = false;
      let eventRisk = false;
      let riskReason = 'Condiciones atmosféricas normales en tiempo real.';

      // Snow Risk Check: Elevation >= Isoterma 0 OR live snowfall > 0
      if (sector.altitudeMeters >= isotermaZeroMeters || liveSnowfall > 0) {
        if (liveSnowfall > 0 || precipMmH > 2) {
          currentRisk = sector.altitudeMeters > 2800 ? 'ROJO' : 'NARANJO';
          snowRisk = true;
          eventRisk = true;
          riskReason = `Riego activo por Isoterma Cero a ${isotermaZeroMeters}m msnm. Nieve en cumbre (${liveSnowfall} cm).`;
        } else {
          currentRisk = 'AMARILLO';
          snowRisk = true;
          riskReason = `Isoterma Cero desciende a ${isotermaZeroMeters}m msnm (bajo la altitud de cumbre de ${sector.altitudeMeters}m). Temp: ${tempCelsius}°C.`;
        }
      } else if (windSpeedKmH >= 65 || precipMmH >= 10) {
        currentRisk = 'ROJO';
        eventRisk = true;
        riskReason = `Viento severo (${windSpeedKmH} km/h) / Precipitaciones intensas en tiempo real (${precipMmH} mm/h).`;
      } else if (windSpeedKmH >= 40 || precipMmH >= 2) {
        currentRisk = 'AMARILLO';
        eventRisk = true;
        riskReason = `Ráfagas de viento de ${windSpeedKmH} km/h y humedad elevada (${live.relative_humidity_2m}%).`;
      } else {
        if (sector.id === 'costa_laguna') {
          riskReason = `Costa Laguna (25m msnm): Temp ${tempCelsius}°C, Viento ${windSpeedKmH} km/h, Humedad ${live.relative_humidity_2m}%. Isoterma cero a ${isotermaZeroMeters}m msnm. Sin riesgo de nieve.`;
        } else {
          riskReason = `Tiempo real: ${tempCelsius}°C, viento ${windSpeedKmH} km/h, sin precipitaciones relevantes.`;
        }
      }

      return {
        ...sector,
        tempCelsius,
        windSpeedKmH,
        precipMmH,
        isotermaZeroMeters,
        currentRisk,
        snowRisk,
        eventRisk,
        riskReason
      };
    });
  } catch (error) {
    console.error('Error fetching live weather from Open-Meteo:', error);
    return baseSectors;
  }
}
