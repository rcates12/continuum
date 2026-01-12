import { HabitSchedule, isScheduledDay } from "@/src/lib/schedule";

function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dayKey(dt);
}

export function computeScheduleStreakStats(
  checkedDays: string[],
  schedule: HabitSchedule,
  today = dayKey(),
  minDay?: string,
): StreakStats {
  const set = new Set(checkedDays);

  // Current streak: walk backward across scheduled days only
  let current = 0;
  let cursor = today;

  // If minDay is provided, dont walk back past it
  while(!minDay || cursor >= minDay) {
    if(!isScheduledDay(cursor, schedule)) {
      cursor = addDays(cursor, -1);
      continue;
    }

    if(set.has(cursor)) {
      current += 1;
      cursor = addDays(cursor, -1);
      continue;
    }

    break;
  }

  // Longest streak: scan day-by-day from minDay to today across scheduled days only.
  // We need a start day to scan. If not provided, derive from earliest checked day or today.
  let start = minDay ?? (Array.from(set).sort()[0] ?? today);
  let longest = 0;
  let run = 0;

  let scan = start;
  while(scan <= today) {
    if (!isScheduledDay(scan, schedule)) {
      scan = addDays(scan, 1);
      continue;
    }

    if (set.has(scan)) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }

    scan = addDays(scan, 1);
  }

  return { current, longest };
}

export type StreakStats = {
    current: number;
    longest: number;
};

export function dayKey(date = new Date()) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function computeStreakStats(days: string[], today = dayKey()): StreakStats {
    // Normalize + dedupe
    const set = new Set(days);
  
    // Current streak: count backwards from today while days exist
    let current = 0;
    let cursor = today;
    while (set.has(cursor)) {
      current += 1;
      cursor = addDays(cursor, -1);
    }
  
    // Longest streak: walk forward through sorted unique days
    const sorted = Array.from(set).sort(); // works because YYYY-MM-DD sorts lexicographically
    let longest = 0;
    let run = 0;
  
    for (let i = 0; i < sorted.length; i++) {
      const d = sorted[i];
  
      if (i === 0) {
        run = 1;
      } else {
        const prev = sorted[i - 1];
        const expected = addDays(prev, 1);
        run = d === expected ? run + 1 : 1;
      }
      if (run > longest) longest = run;
    }
  
    return { current, longest };
}