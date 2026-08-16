export type ChangeType = 'new' | 'update' | 'escalation' | 'deescalation' | 'all_clear';

export interface WeatherEventClaim {
  event_id: string;
  event_type: 'nevada' | 'lluvia' | 'viento' | 'frio' | 'mixto';
  status: 'confirmed' | 'probable' | 'ambiguous' | 'discarded';
  confidence: number; // 0 - 100
  issued_at: string;
  valid_from: string;
  valid_to: string;
  affected_zones: string[];
  impact_summary: {
    costa_laguna: string;
    antofagasta_ciudad: string;
    paranal_armazones: string;
    cordillera_costa: string;
  };
  recommended_action: string;
  next_update_time: string;
  sources: { type: 'primary' | 'secondary'; name: string; reference: string }[];
  change_type: ChangeType;
  official_code?: string;
}

export interface UserEmailPreferences {
  email: string;
  watch_zones: string[];
  watch_events: ('nevada' | 'lluvia' | 'viento' | 'frio')[];
  min_confidence: number; // default 80
  digest_enabled: boolean;
  digest_hour: string; // "08:00"
  quiet_hours: [string, string]; // ["00:00", "07:00"]
}

export type EmailTemplateKey = 
  | 'NEW_CONFIRMED'
  | 'RELEVANT_UPDATE'
  | 'NO_AFFECTATION'
  | 'ESCALATION'
  | 'CORRECTION'
  | 'ALL_CLEAR';

export interface RenderedEmail {
  templateKey: EmailTemplateKey;
  subject: string;
  preheader: string;
  htmlBody: string;
  textBody: string;
}
