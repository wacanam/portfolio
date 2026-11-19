export interface TimezoneSnapshot {
  manilaTime24: string;
  visitorZone: string;
  offsetDeltaLabel: string;
  overlapSummary: string;
  overlapHours: number;
}

const MANILA_OFFSET_MIN = 480; // UTC+8 (Asia/Manila observes no DST)
const COLLAB_START_PHT_MIN = 8 * 60; // 08:00 PHT
const COLLAB_END_PHT_MIN = 23 * 60; // 23:00 PHT

function formatMinutesAsClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function formatHourDelta(hours: number): string {
  const abs = Math.abs(hours);
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
}

function groupContiguousRanges(slots: number[]): string[] {
  if (slots.length === 0) return [];
  const ranges: string[] = [];
  let start = slots[0];
  let prev = slots[0];

  for (let i = 1; i < slots.length; i++) {
    if (slots[i] === prev + 30) {
      prev = slots[i];
    } else {
      ranges.push(`${formatMinutesAsClock(start)}–${formatMinutesAsClock(prev + 30)}`);
      start = slots[i];
      prev = slots[i];
    }
  }
  ranges.push(`${formatMinutesAsClock(start)}–${formatMinutesAsClock(prev + 30)}`);
  return ranges;
}

/**
 * Computes live Asia/Manila (UTC+8) clock and daily collaboration overlap with the visitor's timezone.
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

  // Evaluate 30-minute increments across visitor's 08:00–18:00 workday against 08:00–23:00 PHT
  const matchingSlots: number[] = [];
  for (let slotMin = 8 * 60; slotMin < 18 * 60; slotMin += 30) {
    const phtMin = (((slotMin - visitorOffsetMin + MANILA_OFFSET_MIN) % 1440) + 1440) % 1440;
    if (phtMin >= COLLAB_START_PHT_MIN && phtMin < COLLAB_END_PHT_MIN) {
      matchingSlots.push(slotMin);
    }
  }

  const overlapHours = matchingSlots.length * 0.5;
  const ranges = groupContiguousRanges(matchingSlots);
  let overlapSummary = 'Flexible Americas sync · morning & late-afternoon standups';

  if (overlapHours >= 6 && ranges.length > 0) {
    overlapSummary = `Full workday overlap · ${overlapHours}h shared (${ranges.join(', ')} your time)`;
  } else if (overlapHours >= 1 && ranges.length > 0) {
    overlapSummary = `${overlapHours}h live overlap (${ranges.join(', ')} your time) · async handoff ready`;
  }

  return {
    manilaTime24,
    visitorZone,
    offsetDeltaLabel,
    overlapSummary,
    overlapHours,
  };
}
