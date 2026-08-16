import { EventClaimInput, EventType } from '../../types/verification';

export function normalizeRawClaim(input: EventClaimInput) {
  const textLower = input.raw_text.toLowerCase();

  // Extract official code if present (e.g., A422-1/2026, AA50/2026, SENAPRED-ATP-09)
  const codeRegex = /(?:[A-Z]{1,4}\d{2,4}-\d{1,2}\/\d{4}|[A-Z]{2,4}\d{2,4}\/\d{4}|SENAPRED-[A-Z0-9-]+)/i;
  const matchCode = input.raw_text.match(codeRegex);
  const official_code = input.official_code || (matchCode ? matchCode[0] : null);

  // Extract altitude bounds
  let altitude_min_m = input.altitude_min_m ?? null;
  let altitude_max_m = input.altitude_max_m ?? null;

  const altMatch = textLower.match(/sobre\s+(?:los\s+)?(\d{1,4}(?:\.\d{3})?)\s*(?:m|metros|msnm)/);
  if (altMatch && !altitude_min_m) {
    altitude_min_m = parseInt(altMatch[1].replace('.', ''), 10);
  }

  // Detect event type
  let event_type: EventType = input.claimed_event;
  if (textLower.includes('nieve') || textLower.includes('nevada') || textLower.includes('ventisca')) {
    event_type = 'nevadas';
  } else if (textLower.includes('viento') || textLower.includes('temporal') || textLower.includes('ráfagas')) {
    event_type = 'viento';
  } else if (textLower.includes('lluvia') || textLower.includes('precipitación') || textLower.includes('chubasco')) {
    event_type = 'precipitaciones';
  } else if (textLower.includes('isoterma cero') || textLower.includes('helada')) {
    event_type = 'isoterma_cero_baja';
  }

  // Detect zones mentioned
  const zones: string[] = [...(input.claimed_zones || [])];
  if (textLower.includes('cordillera de la costa') && !zones.includes('Cordillera de la Costa')) {
    zones.push('Cordillera de la Costa');
  }
  if (textLower.includes('costa laguna') && !zones.includes('Costa Laguna')) {
    zones.push('Costa Laguna');
  }
  if (textLower.includes('paranal') && !zones.includes('Cerro Paranal')) {
    zones.push('Cerro Paranal');
  }
  if (textLower.includes('antofagasta') && !zones.includes('Antofagasta Centro')) {
    zones.push('Antofagasta Centro');
  }

  return {
    official_code,
    event_type,
    altitude_min_m: altitude_min_m ?? (event_type === 'nevadas' ? 2200 : null),
    altitude_max_m: altitude_max_m ?? 3500,
    zones: zones.length > 0 ? zones : ['Cordillera de la Costa'],
    issued_at: input.issued_at || new Date().toISOString(),
    valid_from: input.valid_from || new Date().toISOString(),
    valid_to: input.valid_to || new Date(Date.now() + 86400000).toISOString(),
  };
}
