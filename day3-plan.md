Day 3 (1 hour): Habit Detail Page + History + Today Toggle
Outcome

You can click a habit and go to /habits/[id] to see:

Habit name

Current/longest streak (optional but quick)

A simple history list (last 30–90 days)

A Toggle today button (reuse your existing action)

This teaches: dynamic routes, scoped data fetching, authorization patterns (even with dev user), and reusable server actions.

Engineering intent (mindset)

The list page answers: “What do I do today?”

The detail page answers: “How am I doing over time?”

This is also where you’ll later add backfill and schedule rules, so it’s the right foundation.

Layering:

Page is a Server Component (DB reads happen server-side).

Toggle is a Server Action (mutations server-side).

UI stays mostly server-rendered; no client state needed yet.

Failure modes to watch for:

Returning the wrong habit (ownership / user scoping)

Stale UI after toggle (missing revalidatePath)

Accidentally importing Prisma into a client component

Tasks checklist (do in this order)
1) Add links from the list page → detail page (5–10 min)

In app/habits/page.tsx, wrap the habit name in a Link.

import Link from "next/link";


Then inside your habit row:

<Link href={`/habits/${h.id}`} className="font-medium underline underline-offset-4">
  {h.name}
</Link>


(Or keep styling minimal—just make it clickable.)

✅ Done when: clicking a habit takes you to /habits/<id> (it will 404 until next step).

2) Create the dynamic route page (20–25 min)

Create: app/habits/[id]/page.tsx

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDevUser } from "@/lib/auth";
import { toggleCheckIn } from "@/actions/habits";
import { computeStreakStats, dayKey } from "@/lib/streaks";

export default async function HabitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getDevUser();
  const today = dayKey();

  // Fetch habit + recent check-ins (last 365 days is fine for now)
  const d = new Date();
  d.setDate(d.getDate() - 365);
  const minDay = dayKey(d);

  const habit = await prisma.habit.findFirst({
    where: { id: params.id, userId: user.id }, // ownership check
    include: {
      checkIns: {
        where: { day: { gte: minDay } },
        select: { day: true },
        orderBy: { day: "desc" },
      },
    },
  });

  if (!habit) {
    return (
      <div className="mx-auto max-w-xl p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Habit not found.</p>
        <Link href="/habits" className="underline underline-offset-4">
          Back to habits
        </Link>
      </div>
    );
  }

  const days = habit.checkIns.map((c) => c.day);
  const stats = computeStreakStats(days, today);
  const checkedInToday = habit.checkIns.some((c) => c.day === today);

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <header className="space-y-2">
        <Link href="/habits" className="text-sm underline underline-offset-4">
          ← Back
        </Link>

        <h1 className="text-2xl font-semibold">{habit.name}</h1>

        <div className="text-sm text-muted-foreground">
          Current: {stats.current} • Longest: {stats.longest}
        </div>

        <form
          action={async () => {
            "use server";
            await toggleCheckIn(habit.id);
          }}
        >
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              checkedInToday ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            {checkedInToday ? "Checked in today" : "Check in today"}
          </button>
        </form>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">History</h2>

        <ul className="space-y-2">
          {habit.checkIns.slice(0, 30).map((c) => (
            <li key={c.day} className="rounded-md border p-3 text-sm">
              {c.day}
            </li>
          ))}

          {habit.checkIns.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              No check-ins yet.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}


✅ Done when: /habits/[id] loads and shows history.

3) Ensure revalidation covers detail pages too (5 min)

Your toggleCheckIn currently does:

revalidatePath("/habits");


Update it to revalidate both list and detail pages. Add:

revalidatePath("/habits");
revalidatePath(`/habits/${habitId}`);


So after toggling, both pages refresh with correct streaks/history.

✅ Done when: toggling on detail page updates the streak and the history list immediately.

4) Quick validation + polish (10–15 min)

Add one small UX improvement:

Show a “Today” indicator in history

In the history list:

<li key={c.day} className="rounded-md border p-3 text-sm flex justify-between">
  <span>{c.day}</span>
  {c.day === today ? <span className="text-green-600">Today</span> : null}
</li>


Optional: show count:

“Total check-ins (last year): X”

Manual test plan (5 minutes)

From /habits, click a habit → detail page loads

Click “Check in today” → button flips, history includes today

Go back → list page shows updated streak

What Day 3 sets you up for

Day 4 becomes easy:

Backfill: add a date picker + toggleCheckIn(habitId, day) instead of only today.

If you hit any issue, paste your current toggleCheckIn action and your CheckIn model shape and I’ll adjust the revalidation + query to match exactly.