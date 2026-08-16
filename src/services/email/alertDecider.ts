import { WeatherEventClaim, UserEmailPreferences } from '../../types/emailAlert';

export interface DecisionResult {
  shouldSend: boolean;
  reason: string;
  dispatchCategory: 'IMMEDIATE_ALERT' | 'DIGEST_ONLY' | 'SUPPRESSED_NO_CHANGE' | 'SUPPRESSED_LOW_CONFIDENCE' | 'SUPPRESSED_QUIET_HOURS' | 'SUPPRESSED_NO_ZONE_MATCH';
}

export function evaluateShouldSendEmail(
  event: WeatherEventClaim,
  userPrefs: UserEmailPreferences,
  lastSentEvent?: WeatherEventClaim | null
): DecisionResult {
  
  // 1. Confidence check
  if (event.confidence < userPrefs.min_confidence && event.status !== 'confirmed') {
    return {
      shouldSend: false,
      reason: `Nivel de confianza (${event.confidence}/100) inferior al umbral mínimo del usuario (${userPrefs.min_confidence}/100).`,
      dispatchCategory: 'SUPPRESSED_LOW_CONFIDENCE'
    };
  }

  // 2. Geographic Zone Intersection check
  const userZonesLower = userPrefs.watch_zones.map(z => z.toLowerCase());
  const eventZonesLower = event.affected_zones.map(z => z.toLowerCase());

  const hasZoneIntersection = eventZonesLower.some(ez =>
    userZonesLower.some(uz => ez.includes(uz) || uz.includes(ez))
  );

  if (!hasZoneIntersection) {
    return {
      shouldSend: false,
      reason: `El evento afecta sectores (${event.affected_zones.join(', ')}) que no están en las zonas vigiladas por el usuario (${userPrefs.watch_zones.join(', ')}).`,
      dispatchCategory: 'SUPPRESSED_NO_ZONE_MATCH'
    };
  }

  // 3. Meaningful Change check (avoid identical re-sends)
  if (lastSentEvent) {
    const isIdenticalStatus = lastSentEvent.status === event.status;
    const isIdenticalConfidence = Math.abs(lastSentEvent.confidence - event.confidence) < 5;
    const isIdenticalType = lastSentEvent.event_type === event.event_type;
    const isIdenticalChange = event.change_type === 'new' ? false : (lastSentEvent.change_type === event.change_type);

    if (isIdenticalStatus && isIdenticalConfidence && isIdenticalType && isIdenticalChange) {
      return {
        shouldSend: false,
        reason: `Sin cambio significativo con respecto al último correo enviado a las ${new Date(lastSentEvent.issued_at).toLocaleTimeString()}.`,
        dispatchCategory: 'SUPPRESSED_NO_CHANGE'
      };
    }
  }

  // 4. Quiet Hours check (e.g. 00:00 to 07:00)
  const currentHour = new Date().getHours();
  const quietStart = parseInt(userPrefs.quiet_hours[0].split(':')[0], 10);
  const quietEnd = parseInt(userPrefs.quiet_hours[1].split(':')[0], 10);

  const isInQuietHours = quietStart > quietEnd
    ? (currentHour >= quietStart || currentHour < quietEnd)
    : (currentHour >= quietStart && currentHour < quietEnd);

  // Escaped / High emergencies bypass quiet hours
  const isHighSeverity = event.change_type === 'escalation' || (event.confidence >= 90 && event.status === 'confirmed');

  if (isInQuietHours && !isHighSeverity) {
    return {
      shouldSend: false,
      reason: `Horario silencioso activo (${userPrefs.quiet_hours[0]} - ${userPrefs.quiet_hours[1]}). Notificación no crítica pospuesta.`,
      dispatchCategory: 'SUPPRESSED_QUIET_HOURS'
    };
  }

  // 5. Positive Decision
  return {
    shouldSend: true,
    reason: `Disparo válido: Evento verificado para ${event.affected_zones.join(', ')} (Tipo: ${event.change_type}, Confianza: ${event.confidence}/100).`,
    dispatchCategory: 'IMMEDIATE_ALERT'
  };
}
