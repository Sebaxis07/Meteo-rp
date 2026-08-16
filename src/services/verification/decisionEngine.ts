import { SourceLevel, VerificationStatus } from '../../types/verification';

export function evaluateNotificationDecision(
  sourceLevel: SourceLevel,
  confidenceScore: number,
  status: VerificationStatus,
  affectsCostaLaguna: boolean
): 'NOTIFY_WHATSAPP' | 'MONITOR_ONLY' | 'DISCARD' {
  // GOLDEN RULE:
  // Notify ONLY IF:
  // (Primary source confirmed) OR (Secondary source confirmed AND high spatial/temporal match)
  // NEVER notify on tertiary / social media alone!

  if (sourceLevel === 'tertiary') {
    return 'DISCARD';
  }

  if (sourceLevel === 'primary' && confidenceScore >= 75) {
    return affectsCostaLaguna ? 'NOTIFY_WHATSAPP' : 'MONITOR_ONLY';
  }

  if (sourceLevel === 'secondary' && confidenceScore >= 75) {
    return affectsCostaLaguna ? 'NOTIFY_WHATSAPP' : 'MONITOR_ONLY';
  }

  if (confidenceScore >= 50) {
    return 'MONITOR_ONLY';
  }

  return 'DISCARD';
}
