import { EventClaimResult } from '../../types/verification';

export function buildAuditableExplanation(
  result: Partial<EventClaimResult> & {
    source_name: string;
    confidence: number;
    penalties_applied: { reason: string; points: number }[];
    affects_costa_laguna: { affected: boolean; snow_risk: boolean; risk_level: string; reason: string };
    official_code: string | null;
    altitude_min_m: number | null;
  }
): string {
  const parts: string[] = [];

  // Source & Confidence part
  parts.push(`[Evaluación de Confianza: ${result.confidence}/100 - Fuente: ${result.source_name}]`);

  if (result.official_code) {
    parts.push(`Código técnico auditado: ${result.official_code}.`);
  } else {
    parts.push(`AVISO: No se detectó un código técnico oficial de MeteoChile o SENAPRED.`);
  }

  // Penalties summary
  if (result.penalties_applied && result.penalties_applied.length > 0) {
    const penaltyText = result.penalties_applied
      .map(p => `${p.reason} (${p.points} pts)`)
      .join(' | ');
    parts.push(`Penalizaciones aplicadas: ${penaltyText}.`);
  } else {
    parts.push(`Sin penalizaciones de inconsistencia espacial ni temporal.`);
  }

  // Spatial impact on Costa Laguna vs High Mountains
  parts.push(`Impacto en Costa Laguna: ${result.affects_costa_laguna.reason}`);

  if (result.altitude_min_m) {
    parts.push(`Cota de altitudinal evaluada: sobre ${result.altitude_min_m} m.s.n.m. Costa Laguna se ubica a 25 m.s.n.m.`);
  }

  return parts.join(' ');
}

export function generateWhatsAppMessageTemplate(claim: EventClaimResult): string {
  const dateStr = new Date(claim.valid_from).toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
  
  const timeFrom = new Date(claim.valid_from).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const timeTo = new Date(claim.valid_to).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return `⚠️ *Actualización meteorológica para Antofagasta*
*Boletín:* ${claim.official_code || 'Aviso Meteorológico'}

🏔️ *Cordillera de la Costa (>2.200m):*
${claim.event_type === 'nevadas' ? `Nevadas probables sobre ${claim.altitude_min_m || 2200} metros en sectores altos.` : 'Condiciones de viento y baja temperatura.'}

🌊 *Costa Laguna:*
${claim.affects_costa_laguna.snow_risk ? '🚨 Alerta extrema en cota urbana.' : 'Sin nieve prevista. ' + claim.affects_costa_laguna.reason}

🔭 *Cerro Paranal / Armazones:*
Riesgo alto por altitud y baja isoterma cero.

⏱️ *Vigencia:* ${dateStr}, ${timeFrom} – ${timeTo} hs.
_Verificado por Motor 3-Capas (Confianza: ${claim.confidence}/100)_`;
}
