import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getDevUser } from "@/src/lib/auth";
import { toggleCheckIn, updateHabit } from "@/src/actions/habits";
import { Button } from "@/components/ui/button";
import { dayKey } from "@/src/lib/streaks";
import { parseDaysOfWeek, isScheduledDay, formatValidDays } from "@/src/lib/schedule";
import { computeScheduleStreakStats } from "@/src/lib/streaks";
import { DeleteHabitButton } from "./DeletHabitButton";
import { ArrowLeftIcon } from "lucide-react";

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
          <Link href="/habits" className="text-sm text-white inline-flex items-center gap-2 underline-offset-4 hover:text-white/70 transition-colors">
            <ArrowLeftIcon className="size-4" /> Back to habits
          </Link>
  
          <h1 className="text-2xl font-semibold text-white">{habit.name}</h1>
  
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
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                checkedInToday ? "bg-emerald text-white hover:bg-emerald/90" : "bg-ocean text-white hover:bg-ocean/90"
              }`}
            >
              {checkedInToday ? "Checked in today" : "Check in today"}
            </button>
          </form>
        </header>

        <form action={async (formData: FormData) => {
          "use server";
          const name = String(formData.get("name"));
          const scheduleType = String(formData.get("scheduleType"));
          const rawDays = formData.getAll("daysOfWeek").map((v) => Number(v));
          await updateHabit(habit.id, name, scheduleType, rawDays);
        }} className="space-y-4 border border-border rounded-lg p-5 bg-card shadow-sm">
          <h3 className="font-semibold text-teal">Edit Habit</h3>

          <input 
            type="text"
            name="name"
            defaultValue={habit.name}
            className="rounded-md border border-border bg-background px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-ocean/50"
            />

          <select
            name="scheduleType"
            defaultValue={habit.scheduleType}
            className="rounded-md border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ocean/50"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKDAYS">Weekdays</option>
              <option value="CUSTOM">Custom</option>
          </select>

          <div className="flex flex-wrap gap-3">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((label, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="daysOfWeek" 
                  value={i} 
                  defaultChecked={parseDaysOfWeek(habit.daysOfWeek)?.includes(i)} 
                  className="w-4 h-4 accent-ocean"
                />
                <span className="text-sm text-muted-foreground">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-start gap-2">
            <Button type="submit" className="bg-ocean hover:bg-ocean/90 text-white rounded-md px-4 py-2">Save changes</Button>
            <DeleteHabitButton habitId={habit.id} />
          </div>
        </form>

        <div className="text-sm text-muted-foreground">
            Current: {stats.current} • Longest: {stats.longest} • Total (last year): {totalLastYear}
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-teal">History</h2>
  
          <ul className="space-y-2">
            {habit.checkIns.slice(0, 30).map((c) => {
              const isValidDay = isScheduledDay(c.day, schedule);
              return (
                <li key={c.day} className={`rounded-lg border p-3 text-sm flex flex-col gap-1 transition-colors ${
                  c.day === today ? "bg-white/20 border-emerald/30" : "bg-card border-border text-muted-foreground"
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={c.day === today ? "text-teal font-medium" : ""}>{c.day}</span>
                    <div className="flex items-center gap-2">
                      {c.day === today && <span className="text-white bg-emerald/60 px-2 py-1 rounded border border-emerald/30 font-medium">Today</span>}
                      {!isValidDay && (
                        <span className="text-xs text-gold bg-gold/10 px-2 py-1 rounded border border-gold/30">
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