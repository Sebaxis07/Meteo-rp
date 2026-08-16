import { RiskLevel } from '../../types/sectors';
import { EventType } from '../../types/verification';

export interface GeoValidationOutput {
  affects_costa_laguna: {
    affected: boolean;
    snow_risk: boolean;
    risk_level: RiskLevel;
    reason: string;
  };
  confuses_spatial_sectors: boolean;
}

export function evaluateGeoSpatialImpact(
  eventType: EventType,
  altitudeMinMeters: number | null,
  zones: string[],
  rawText: string
): GeoValidationOutput {
  const textLower = rawText.toLowerCase();

  // Spatial Confusion Check: e.g. claiming "Cordillera de la Costa" means "Costa Laguna / Ciudad"
  const confuses_spatial_sectors =
    (textLower.includes('cordillera de la costa') && textLower.includes('nieve en la playa')) ||
    (textLower.includes('nieve en costa laguna')) ||
    (textLower.includes('nieve en la ciudad de antofagasta'));

  // Costa Laguna Elevation: 25 meters above sea level
  const COSTA_LAGUNA_ALTITUDE = 25;

  let affected = false;
  let snow_risk = false;
  let risk_level: RiskLevel = 'VERDE';
  let reason = 'Sin impacto relevante registrado para Costa Laguna.';

  if (eventType === 'nevadas') {
    snow_risk = false; // Physically impossible at 25m in Antofagasta
    if (altitudeMinMeters !== null && COSTA_LAGUNA_ALTITUDE >= altitudeMinMeters) {
      // Extremely hypothetical low isoterma zero
      snow_risk = true;
      affected = true;
      risk_level = 'ROJO';
      reason = '¡ALERTA HISTÓRICA! Isoterma cero al nivel del mar en Costa Laguna.';
    } else {
      // Snow is in high mountains (>2,200m), NOT Costa Laguna
      affected = textLower.includes('viento') || textLower.includes('lluvia');
      risk_level = affected ? 'AMARILLO' : 'VERDE';
      reason = `Nevada restringida a sectores altos de la Cordillera sobre ${altitudeMinMeters || 2200}m. Sin nieve en Costa Laguna (25m msnm).`;
    }
  } else if (eventType === 'viento') {
    affected = true;
    risk_level = textLower.includes('fuerte') || textLower.includes('severo') ? 'AMARILLO' : 'VERDE';
    reason = 'Viento costero soplante en Costa Laguna y Ruta 1. Precaución en zona marítima.';
  } else if (eventType === 'precipitaciones') {
    affected = true;
    risk_level = textLower.includes('aluvión') || textLower.includes('torrencial') ? 'ROJO' : 'AMARILLO';
    reason = 'Precipitaciones urbanas débiles/moderadas posibles en Costa Laguna.';
  } else if (eventType === 'isoterma_cero_baja') {
    affected = true;
    risk_level = 'AMARILLO';
    reason = 'Descenso de temperatura ambiente nocturna en franja costera.';
  }

  return {
    affects_costa_laguna: {
      affected,
      snow_risk,
      risk_level,
      reason
    },
    confuses_spatial_sectors
  };
}
