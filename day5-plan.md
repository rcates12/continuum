Outcome

When creating a habit, you can choose:

Daily

Weekdays (Mon–Fri)

Custom days (pick weekdays)

Streaks do not break on non-scheduled days (e.g., Weekdays habit doesn’t break over the weekend).

Engineering intent

This is domain modeling: “a habit isn’t just a name, it has rules.”

Streaks become schedule-aware derived data (still computed from check-ins, not stored).

You’ll implement the business rules server-side (utilities + actions), not in the UI.

Where things live

DB schema change: Prisma Habit.scheduleType + Habit.daysOfWeek

Server Action: createHabit saves schedule fields

Server-only utility: streak computation uses schedule rules

UI: form inputs for schedule

Day 5 code patches
Patch 1 — Prisma schema: add schedule fields

Edit prisma/schema.prisma (Habit model) and add:

enum ScheduleType {
  DAILY
  WEEKDAYS
  CUSTOM
}

model Habit {
  id        String   @id @default(cuid())
  userId    String
  name      String
  color     String?
  createdAt DateTime @default(now())

  scheduleType ScheduleType @default(DAILY)
  // For CUSTOM: store comma-separated weekday numbers 0-6 (Sun=0 ... Sat=6), e.g. "1,3,5"
  daysOfWeek   String? 

  user      User     @relation(fields: [userId], references: [id])
  checkIns  CheckIn[]
}


Run migration:

npx prisma migrate dev --name add_schedule

Patch 2 — Schedule helpers (new file)

Create src/lib/schedule.ts:

export type ScheduleType = "DAILY" | "WEEKDAYS" | "CUSTOM";

export type HabitSchedule = {
  scheduleType: ScheduleType;
  // weekday numbers 0-6 (Sun=0 ... Sat=6)
  daysOfWeek?: number[];
};

export function parseDaysOfWeek(csv?: string | null): number[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
}

export function daysOfWeekToCsv(days: number[]): string {
  // normalize, sort, dedupe
  const uniq = Array.from(new Set(days)).filter((n) => n >= 0 && n <= 6).sort((a, b) => a - b);
  return uniq.join(",");
}

export function weekdayOfDayKey(day: string): number {
  // day is "YYYY-MM-DD" in local time
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getDay(); // 0=Sun..6=Sat
}

export function isScheduledDay(day: string, schedule: HabitSchedule): boolean {
  const wd = weekdayOfDayKey(day);

  if (schedule.scheduleType === "DAILY") return true;
  if (schedule.scheduleType === "WEEKDAYS") return wd >= 1 && wd <= 5;

  // CUSTOM
  const set = new Set(schedule.daysOfWeek ?? []);
  return set.has(wd);
}

Patch 3 — Update streak logic to respect schedules

Edit src/lib/streaks.ts and add a schedule-aware function (keep your existing one too if you want).

Add at the top:

import { HabitSchedule, isScheduledDay } from "@/lib/schedule";


Then add this new function:

function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dayKey(dt);
}

export function computeScheduledStreakStats(
  checkedDays: string[],
  schedule: HabitSchedule,
  today = dayKey(),
  minDay?: string
): StreakStats {
  const set = new Set(checkedDays);

  // --- Current streak: walk backward across scheduled days only ---
  let current = 0;
  let cursor = today;

  // If minDay is provided, don’t walk back past it
  while (!minDay || cursor >= minDay) {
    if (!isScheduledDay(cursor, schedule)) {
      cursor = addDays(cursor, -1);
      continue; // non-scheduled days don't affect streak
    }

    if (set.has(cursor)) {
      current += 1;
      cursor = addDays(cursor, -1);
      continue;
    }

    break; // scheduled day missing check-in breaks the streak
  }

  // --- Longest streak: scan day-by-day from minDay to today across scheduled days only ---
  // We need a start day to scan. If not provided, derive from earliest checked day.
  let start = minDay ?? (Array.from(set).sort()[0] ?? today);
  let longest = 0;
  let run = 0;

  let scan = start;
  while (scan <= today) {
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


What this changes: non-scheduled days are ignored (don’t break a run).

Patch 4 — Update createHabit action to store schedule

Edit src/actions/habits.ts.

Add imports:

import { daysOfWeekToCsv } from "@/lib/schedule";


Update validation + parsing.

Replace your current schema for createHabit with:

const schema = z.object({
  name: z.string().min(1).max(50),
  scheduleType: z.enum(["DAILY", "WEEKDAYS", "CUSTOM"]).default("DAILY"),
  // for CUSTOM, you'll receive multiple checkbox values -> handle separately
});


Parse:

const parsed = schema.safeParse({
  name: String(formData.get("name") ?? ""),
  scheduleType: String(formData.get("scheduleType") ?? "DAILY"),
});

if (!parsed.success) throw new Error("Invalid habit data");

const scheduleType = parsed.data.scheduleType;

// Collect custom days from checkboxes named "daysOfWeek"
const rawDays = formData.getAll("daysOfWeek").map((v) => Number(v));
const daysCsv =
  scheduleType === "CUSTOM" ? daysOfWeekToCsv(rawDays.filter((n) => Number.isInteger(n))) : null;


Then in prisma.habit.create add:

await prisma.habit.create({
  data: {
    userId: user.id,
    name: parsed.data.name,
    scheduleType,
    daysOfWeek: daysCsv,
  },
});


Also keep your existing revalidatePath("/habits") after creation if you have it.

Patch 5 — Update /habits page form UI to include schedule

Edit app/habits/page.tsx form and add:

<select
  name="scheduleType"
  className="rounded-md border px-3 py-2 text-sm"
  defaultValue="DAILY"
>
  <option value="DAILY">Daily</option>
  <option value="WEEKDAYS">Weekdays</option>
  <option value="CUSTOM">Custom</option>
</select>


Then add checkboxes (always visible; only used if CUSTOM):

<div className="flex flex-wrap gap-2 text-sm">
  {[
    ["Sun", 0],
    ["Mon", 1],
    ["Tue", 2],
    ["Wed", 3],
    ["Thu", 4],
    ["Fri", 5],
    ["Sat", 6],
  ].map(([label, val]) => (
    <label key={val as number} className="flex items-center gap-1">
      <input type="checkbox" name="daysOfWeek" value={val as number} />
      {label as string}
    </label>
  ))}
</div>


Your form becomes (roughly):

<form action={createHabit} className="space-y-2">
  <div className="flex gap-2">
    <input name="name" ... />
    <select name="scheduleType" ...>...</select>
    <button ...>Add</button>
  </div>

  {/* custom days */}
  <div className="flex flex-wrap gap-2 text-sm">...</div>
</form>

Patch 6 — Use schedule-aware streaks on list + detail pages
A) /habits list page

Update your habit query to select schedule fields:

const habits = await prisma.habit.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "asc" },
  include: {
    checkIns: {
      where: { day: { gte: minDay } },
      select: { day: true },
    },
  },
});


(Include already returns the habit fields, so you just need to use them.)

Import schedule parsing:

import { parseDaysOfWeek } from "@/lib/schedule";
import { computeScheduledStreakStats, dayKey } from "@/lib/streaks";


Then in render:

const schedule = {
  scheduleType: h.scheduleType,
  daysOfWeek: parseDaysOfWeek(h.daysOfWeek),
};

const stats = computeScheduledStreakStats(
  h.checkIns.map((c) => c.day),
  schedule,
  today,
  minDay
);

B) Detail page /habits/[id]

Same idea: build schedule from habit.scheduleType + habit.daysOfWeek, and call computeScheduledStreakStats(...).

Manual test plan (5 minutes)

Create Weekdays habit

Check in Friday, skip weekend, check in Monday → streak should continue (not break on Sat/Sun).

Create Custom habit with Mon/Wed/Fri

Missing Tue shouldn’t matter; missing a scheduled day should break the run.

Toggle today on/off and confirm streak updates immediately (revalidation still works).

If you want the “fast” version (in case time is tight)

If the full UI (custom checkboxes) feels like too much for Day 5, do:

Add scheduleType only (Daily vs Weekdays)

Skip CUSTOM until Day 6

But the patches above are still small enough to fit in an hour if you keep UI basic.