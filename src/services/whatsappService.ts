import { UserWhatsAppConfig, EventClaimResult } from '../types/verification';

const LOCAL_STORAGE_KEY = 'meteo_antofagasta_whatsapp_config';

export const DEFAULT_WHATSAPP_CONFIG: UserWhatsAppConfig = {
  phoneNumber: '912345678',
  countryCode: '+56',
  subscribedSectors: ['costa_laguna', 'antofagasta_centro', 'cerro_paranal', 'cerro_armazones', 'sierra_vicuna_mackenna', 'ruta_1'],
  alertTypes: ['nevadas', 'precipitaciones', 'viento', 'tormentas'],
  minAlertLevel: 'AMARILLO',
  isEnabled: true,
};

export function loadWhatsAppConfig(): UserWhatsAppConfig {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading WhatsApp config:', e);
  }
  return DEFAULT_WHATSAPP_CONFIG;
}

export function saveWhatsAppConfig(config: UserWhatsAppConfig): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving WhatsApp config:', e);
  }
}

export interface SimulationDispatchResult {
  success: boolean;
  timestamp: string;
  recipient: string;
  messageBody: string;
  metaTemplateName: string;
  metaResponseId: string;
  status: 'DELIVERED' | 'SENT' | 'FILTERED_MIN_LEVEL' | 'FILTERED_NO_SECTOR_MATCH';
}

export function simulateWhatsAppDispatch(
  config: UserWhatsAppConfig,
  claim: EventClaimResult
): SimulationDispatchResult {
  const fullPhone = `${config.countryCode}${config.phoneNumber.replace(/\D/g, '')}`;

  // Check if minimum alert level condition is met
  const levelOrder = { VERDE: 0, AMARILLO: 1, NARANJO: 2, ROJO: 3, GRIS: 0 };
  const claimLevelNum = levelOrder[claim.affects_costa_laguna.risk_level] || 0;
  const userMinLevelNum = levelOrder[config.minAlertLevel] || 1;

  if (claimLevelNum < userMinLevelNum && claim.recommended_action !== 'NOTIFY_WHATSAPP') {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      recipient: fullPhone,
      messageBody: claim.whatsapp_template_preview || '',
      metaTemplateName: 'weather_alert_update_v1',
      metaResponseId: 'wamid.HBgLMTU2OT...',
      status: 'FILTERED_MIN_LEVEL'
    };
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    recipient: fullPhone,
    messageBody: claim.whatsapp_template_preview || '',
    metaTemplateName: 'weather_alert_update_v1',
    metaResponseId: `wamid.HBgL${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    status: 'DELIVERED'
  };
}
