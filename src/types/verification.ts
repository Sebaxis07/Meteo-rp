import { RiskLevel } from './sectors';

export type SourceLevel = 'primary' | 'secondary' | 'tertiary';

export type VerificationStatus = 
  | 'confirmed' 
  | 'probable_but_not_fully_verified' 
  | 'ambiguous' 
  | 'discarded';

export type EventType = 'nevadas' | 'precipitaciones' | 'viento' | 'tormentas' | 'isoterma_cero_baja';

export interface PenaltyItem {
  code: string;
  points: number; // e.g. -25, -20, -15
  reason: string;
}

export interface EventClaimInput {
  raw_text: string;
  source_name: string; // e.g. "MeteoChile", "SENAPRED", "Twitter / X @clima_chile", "Prensa Local"
  source_level: SourceLevel;
  official_code?: string;
  claimed_zones: string[];
  claimed_event: EventType;
  altitude_min_m?: number;
  altitude_max_m?: number;
  snow_cm_min?: number;
  snow_cm_max?: number;
  issued_at?: string;
  valid_from?: string;
  valid_to?: string;
}

export interface EventClaimResult {
  official_code: string | null;
  event_type: EventType;
  source_level: SourceLevel;
  source_name: string;
  issued_at: string;
  valid_from: string;
  valid_to: string;
  regions: string[];
  zones: string[];
  altitude_min_m: number | null;
  altitude_max_m: number | null;
  snow_cm_min: number;
  snow_cm_max: number;
  confidence: number; // 0 - 100
  status: VerificationStatus;
  penalties_applied: PenaltyItem[];
  
  affects_costa_laguna: {
    affected: boolean;
    snow_risk: boolean;
    risk_level: RiskLevel;
    reason: string;
  };

  explanation: string; // Auditable trace in natural language
  recommended_action: 'NOTIFY_WHATSAPP' | 'MONITOR_ONLY' | 'DISCARD';
  whatsapp_template_preview?: string;
}

export interface UserWhatsAppConfig {
  phoneNumber: string;
  countryCode: string; // default '+56'
  subscribedSectors: string[]; // Sector IDs
  alertTypes: EventType[];
  minAlertLevel: RiskLevel;
  isEnabled: boolean;
}
