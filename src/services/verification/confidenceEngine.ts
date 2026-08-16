import { PenaltyItem, SourceLevel, VerificationStatus } from '../../types/verification';

export interface ConfidenceEvaluation {
  score: number; // 0 - 100
  status: VerificationStatus;
  penalties: PenaltyItem[];
  baseScore: number;
}

export function calculateConfidenceScore(
  sourceLevel: SourceLevel,
  sourceName: string,
  officialCode: string | null,
  rawText: string,
  confusesSpatialSectors: boolean,
  hasValidTimestamp: boolean
): ConfidenceEvaluation {
  const textLower = rawText.toLowerCase();
  const penalties: PenaltyItem[] = [];

  // 1. Determine Base Score
  let baseScore = 50;

  if (sourceLevel === 'primary') {
    // MeteoChile official
    baseScore = officialCode ? 95 : 82;
  } else if (sourceLevel === 'secondary') {
    // SENAPRED official
    baseScore = officialCode ? 90 : 78;
  } else {
    // Tertiary (Media or Social Media)
    if (sourceName.toLowerCase().includes('prensa') || sourceName.toLowerCase().includes('biobio') || sourceName.toLowerCase().includes('emol')) {
      baseScore = officialCode ? 78 : 65;
    } else if (textLower.includes('oficial') || textLower.includes('meteochile')) {
      baseScore = officialCode ? 60 : 45;
    } else {
      // Raw social post / screenshot / chain message
      baseScore = 28;
    }
  }

  let score = baseScore;

  // 2. Apply Automatic Penalties

  // Penalty -25: Official Code cannot be verified / missing when required
  if ((sourceLevel === 'primary' || sourceLevel === 'secondary') && !officialCode) {
    penalties.push({
      code: 'CODE_UNVERIFIED',
      points: -25,
      reason: 'El boletín oficial carece de un código de aviso o alerta verificable (ej. A422-1/2026).'
    });
    score -= 25;
  }

  // Penalty -20: Confuses spatial sectors (e.g., claiming snow in coastal city vs high mountains)
  if (confusesSpatialSectors) {
    penalties.push({
      code: 'SPATIAL_CONFUSION',
      points: -20,
      reason: 'Confunde sectores geográficos (ej. Cordillera de la Costa >2200m etiquetada como playa o Costa Laguna).'
    });
    score -= 20;
  }

  // Penalty -15: Mixing regions / provinces
  if (textLower.includes('tarapacá') && textLower.includes('antofagasta') && textLower.includes('coquimbo')) {
    penalties.push({
      code: 'REGION_MISMATCH',
      points: -15,
      reason: 'Mezcla antecedentes de múltiples regiones o provincias lejanas.'
    });
    score -= 15;
  }

  // Penalty -15: Alarmist language not supported by technical bulletin
  if (
    textLower.includes('alerta roja extrema') ||
    textLower.includes('catástrofe imminente') ||
    textLower.includes('difundir urgente') ||
    textLower.includes('cadena')
  ) {
    penalties.push({
      code: 'ALARMIST_LANGUAGE',
      points: -15,
      reason: 'Emplea vocabulario sensacionalista o alarmista sin respaldo en el boletín técnico.'
    });
    score -= 15;
  }

  // Penalty -10: Missing timestamp / validity period
  if (!hasValidTimestamp) {
    penalties.push({
      code: 'NO_TIMESTAMP',
      points: -10,
      reason: 'Falta hora exacta de emisión o período de vigencia definido.'
    });
    score -= 10;
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine Verification Status based on score and source
  let status: VerificationStatus = 'discarded';
  if (score >= 85) {
    status = 'confirmed';
  } else if (score >= 60) {
    status = 'probable_but_not_fully_verified';
  } else if (score >= 40) {
    status = 'ambiguous';
  } else {
    status = 'discarded';
  }

  return {
    score,
    status,
    penalties,
    baseScore
  };
}
