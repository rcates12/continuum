import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getDevUser } from "@/src/lib/auth";
import { toggleCheckIn } from "@/src/actions/habits";
import { computeStreakStats, dayKey } from "@/src/lib/streaks";
import { parseDaysOfWeek, isScheduledDay, formatValidDays } from "@/src/lib/schedule";
import { computeScheduleStreakStats } from "@/src/lib/streaks";

export default async function HabitDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    const user = await getDevUser();
    const today = dayKey();
  
    // Fetch habit + recent check-ins (last 365 days is fine for now)
    const d = new Date();
    d.setDate(d.getDate() - 365);
    const minDay = dayKey(d);
    const y = new Date();
    y.setDate(y.getDate() - 1);
  
    const habit = await prisma.habit.findFirst({
      where: { id, userId: user.id }, // ownership check
      include: {
        checkIns: {
          where: { day: { gte: minDay } },
          select: { day: true },
          orderBy: { day: "desc" },
        },
      },
    }) as {
      id: string;
      name: string;
      scheduleType: "DAILY" | "WEEKDAYS" | "CUSTOM";
      daysOfWeek: string | null;
      checkIns: { day: string }[];
    } | null;
  
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
    const checkedInToday = habit.checkIns.some((c) => c.day === today);
    const totalLastYear = habit.checkIns.length;
    const schedule = {
      scheduleType: habit.scheduleType,
      daysOfWeek: parseDaysOfWeek(habit.daysOfWeek),
    }
    const stats = computeScheduleStreakStats(
      habit.checkIns.map((c) => c.day),
      schedule,
      today,
      minDay
    );

    return (
      <div className="mx-auto max-w-xl p-6 space-y-6">
        <header className="space-y-2">
          <Link href="/habits" className="text-sm underline underline-offset-4">
            ← Back
          </Link>
  
          <h1 className="text-2xl font-semibold">{habit.name}</h1>
  
          <div className="text-sm text-muted-foreground">
            <div>Current: {stats.current} • Longest: {stats.longest}</div>
            <div className="mt-1">Valid on: {formatValidDays(schedule)}</div>
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

        <div className="text-sm text-muted-foreground">
            Current: {stats.current} • Longest: {stats.longest} • Total (last year): {totalLastYear}
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-medium">History</h2>
  
          <ul className="space-y-2">
            {habit.checkIns.slice(0, 30).map((c) => {
              const isValidDay = isScheduledDay(c.day, schedule);
              return (
                <li key={c.day} className={`rounded-md border p-3 text-sm flex flex-col gap-1 ${
                  c.day === today ? "bg-green-100" : "text-gray-500"
                }`}>
                  <div className="flex justify-between items-center">
                    <span>{c.day}</span>
                    <div className="flex items-center gap-2">
                      {c.day === today && <span className="text-green-600">Today</span>}
                      {!isValidDay && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          Excluded
                        </span>
                      )}
                    </div>
                  </div>
                  {!isValidDay && (
                    <div className="text-xs text-muted-foreground">
                      This day doesn't count toward your streak
                    </div>
                  )}
                </li>
              );
            })}
  
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