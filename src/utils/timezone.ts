export interface TimezoneSnapshot {
  manilaTime24: string;
  visitorZone: string;
  offsetDeltaLabel: string;
}

const MANILA_OFFSET_MIN = 480; // UTC+8 (Asia/Manila observes no DST)

function formatHourDelta(hours: number): string {
  const abs = Math.abs(hours);
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
}

/**
 * Computes live Asia/Manila (UTC+8) clock and offset relative to the visitor's timezone.
 */
export function getTimezoneSnapshot(now: Date = new Date()): TimezoneSnapshot {
  let manilaTime24 = '00:00';
  let visitorZone = 'Local';

  try {
    manilaTime24 = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
  } catch {
    // Fallback if Intl timezone options are restricted
  }

  const visitorOffsetMin = -now.getTimezoneOffset();
  const diffFromVisitorHours = (MANILA_OFFSET_MIN - visitorOffsetMin) / 60;

  let offsetDeltaLabel = 'Same timezone (UTC+8)';
  if (Math.abs(diffFromVisitorHours) >= 0.05) {
    const formatted = formatHourDelta(diffFromVisitorHours);
    offsetDeltaLabel =
      diffFromVisitorHours > 0
        ? `PHT is +${formatted}h ahead of you`
        : `PHT is -${formatted}h behind you`;
  }

  return {
    manilaTime24,
    visitorZone,
    offsetDeltaLabel,
  };
}
