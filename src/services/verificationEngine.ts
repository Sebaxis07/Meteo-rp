import { EventClaimInput, EventClaimResult } from '../types/verification';
import { normalizeRawClaim } from './verification/normalizer';
import { evaluateGeoSpatialImpact } from './verification/geoValidator';
import { calculateConfidenceScore } from './verification/confidenceEngine';
import { evaluateNotificationDecision } from './verification/decisionEngine';
import { buildAuditableExplanation, generateWhatsAppMessageTemplate } from './verification/explainEngine';

export function verify_event_claim(input: EventClaimInput): EventClaimResult {
  // 1. Layer 1: Normalizer
  const normalized = normalizeRawClaim(input);

  // 2. Layer 2: GeoSpatial Validator
  const geoResult = evaluateGeoSpatialImpact(
    normalized.event_type,
    normalized.altitude_min_m,
    normalized.zones,
    input.raw_text
  );

  // 3. Layer 2: Confidence Engine & Penalties
  const hasValidTimestamp = Boolean(normalized.issued_at && normalized.valid_from && normalized.valid_to);
  const confidenceResult = calculateConfidenceScore(
    input.source_level,
    input.source_name,
    normalized.official_code,
    input.raw_text,
    geoResult.confuses_spatial_sectors,
    hasValidTimestamp
  );

  // 4. Layer 3: Decision Engine
  const recommended_action = evaluateNotificationDecision(
    input.source_level,
    confidenceResult.score,
    confidenceResult.status,
    geoResult.affects_costa_laguna.affected
  );

  // 5. Layer 3: Explain Engine & WhatsApp Template
  const partialResult = {
    source_name: input.source_name,
    confidence: confidenceResult.score,
    penalties_applied: confidenceResult.penalties,
    affects_costa_laguna: geoResult.affects_costa_laguna,
    official_code: normalized.official_code,
    altitude_min_m: normalized.altitude_min_m
  };

  const explanation = buildAuditableExplanation(partialResult);

  const fullResult: EventClaimResult = {
    official_code: normalized.official_code,
    event_type: normalized.event_type,
    source_level: input.source_level,
    source_name: input.source_name,
    issued_at: normalized.issued_at,
    valid_from: normalized.valid_from,
    valid_to: normalized.valid_to,
    regions: ['Antofagasta'],
    zones: normalized.zones,
    altitude_min_m: normalized.altitude_min_m,
    altitude_max_m: normalized.altitude_max_m,
    snow_cm_min: input.snow_cm_min ?? (normalized.event_type === 'nevadas' ? 5 : 0),
    snow_cm_max: input.snow_cm_max ?? (normalized.event_type === 'nevadas' ? 15 : 0),
    confidence: confidenceResult.score,
    status: confidenceResult.status,
    penalties_applied: confidenceResult.penalties,
    affects_costa_laguna: geoResult.affects_costa_laguna,
    explanation,
    recommended_action
  };

  fullResult.whatsapp_template_preview = generateWhatsAppMessageTemplate(fullResult);

  return fullResult;
}
