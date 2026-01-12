Goal for tomorrow (1 hour)

On /habits, show for each habit:

Current streak (ending today)

Longest streak (all-time, based on the days you fetched)

…and have it update when you check-in/uncheck-in.

Step 1: Add a streak utility

Create: src/lib/streaks.ts

// src/lib/streaks.ts

export type StreakStats = {
  current: number;
  longest: number;
};

export function dayKey(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(day: string, delta: number): string {
  // day is "YYYY-MM-DD" in local time
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return dayKey(dt);
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


This is “daily habits only” streak logic (perfect for MVP).

Step 2: Query check-ins history on /habits

Update your query in app/habits/page.tsx so you fetch more than just today.

Idea: fetch the last 365 days to be safe. Since day is YYYY-MM-DD, you can filter by string range.

At the top of app/habits/page.tsx, import the helper:

import { computeStreakStats, dayKey } from "@/lib/streaks";


Then compute today and minDay:

const today = dayKey();
const d = new Date();
d.setDate(d.getDate() - 365);
const minDay = dayKey(d);


Now update your Prisma query:

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


Then in your render, compute stats:

{habits.map((h) => {
  const checkedInToday = h.checkIns.some((c) => c.day === today);

  const stats = computeStreakStats(
    h.checkIns.map((c) => c.day),
    today
  );

  return (
    <li key={h.id} className="flex items-center justify-between rounded-md border p-3">
      <div className="space-y-1">
        <div className="font-medium">{h.name}</div>
        <div className="text-sm text-muted-foreground">
          Current: {stats.current} • Longest: {stats.longest}
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await toggleCheckIn(h.id);
        }}
      >
        <button
          className={`rounded-md px-3 py-2 text-sm ${
            checkedInToday ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {checkedInToday ? "Checked in" : "Check in"}
        </button>
      </form>
    </li>
  );
})}

Step 3: Make sure the UI refreshes after a check-in (important)

Sometimes Next won’t refresh the server component output unless you revalidate.

In your toggleCheckIn action (src/actions/habits.ts), add:

import { revalidatePath } from "next/cache";


Then after the create/delete:

revalidatePath("/habits");


So your action becomes (showing just the end):

if (existing) {
  await prisma.checkIn.delete({ where: { id: existing.id } });
} else {
  await prisma.checkIn.create({ data: { habitId, day } });
}

revalidatePath("/habits");

Step 4: Quick sanity tests (2 minutes)

Add a habit

Click “Check in” → current streak should become 1

Click again (uncheck) → back to 0

Manually insert a check-in for yesterday later (we’ll do next session) → streak should become 2 when today is checked in

If you want a tiny stretch goal tomorrow (if time remains)

Show “✅ today” in the stats line:

checkedInToday ? "✅ Today" : "— Not checked today"

If you hit any snag, paste:

your current habits Prisma query block

and the shape of h.checkIns you’re getting (just a console.log output)

…and I’ll adjust it quickly.