import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getAuthUser } from "@/src/lib/auth";
import { toggleCheckIn, updateHabit } from "@/src/actions/habits";
import { Button } from "@/components/ui/button";
import { dayKey } from "@/src/lib/streaks";
import { parseDaysOfWeek, isScheduledDay, formatValidDays } from "@/src/lib/schedule";
import { computeScheduleStreakStats } from "@/src/lib/streaks";
import { DeleteHabitButton } from "./DeletHabitButton";
import { ArrowLeftIcon } from "lucide-react";
import { HabitHeatmap } from "./HabitHeatmap";

export default async function HabitDetailPage({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {
    const { id } = await params;
    const { id: userId } = await getAuthUser();
    const today = dayKey();
  
    // Fetch habit + recent check-ins (last 365 days is fine for now)
    const d = new Date();
    d.setDate(d.getDate() - 365);
    const minDay = dayKey(d);
    const y = new Date();
    y.setDate(y.getDate() - 1);
  
    const habit = await prisma.habit.findFirst({
      where: { id, userId }, // ownership check
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
      <div className="mx-auto max-w-xl p-4 sm:p-6 space-y-6 pb-safe">
        <header className="space-y-3">
          <Link href="/habits" className="text-sm text-muted-foreground inline-flex items-center gap-2 underline-offset-4 hover:text-foreground transition-colors">
            <ArrowLeftIcon className="size-4" /> Back to habits
          </Link>
  
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{habit.name}</h1>
  
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Current: <span className="text-emerald font-medium">{stats.current}</span> • Longest: <span className="text-ocean font-medium">{stats.longest}</span></div>
            <div>Valid on: <span className="text-gold">{formatValidDays(schedule)}</span></div>
          </div>
  
          <form
            action={async () => {
              "use server";
              await toggleCheckIn(habit.id);
            }}
          >
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                checkedInToday ? "bg-emerald text-teal hover:bg-emerald/90" : "bg-ocean text-teal hover:bg-ocean/90"
              }`}
            >
              {checkedInToday ? "Checked in today" : "Check in today"}
            </button>
          </form>

          <HabitHeatmap checkIns={days} schedule={schedule} />
        </header>

        <form action={async (formData: FormData) => {
          "use server";
          const name = String(formData.get("name"));
          const scheduleType = String(formData.get("scheduleType"));
          const rawDays = formData.getAll("daysOfWeek").map((v) => Number(v));
          await updateHabit(habit.id, name, scheduleType, rawDays);
        }} className="space-y-4 glass-card p-5">
          <h3 className="font-semibold text-gold">Edit Habit</h3>

          <input 
            type="text"
            name="name"
            defaultValue={habit.name}
            className="glass-input rounded-lg px-3 py-2 w-full text-foreground placeholder:text-muted-foreground focus:outline-none"
            />

          <select
            name="scheduleType"
            defaultValue={habit.scheduleType}
            className="glass-input rounded-lg px-3 py-2 text-foreground focus:outline-none"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKDAYS">Weekdays</option>
              <option value="CUSTOM">Custom</option>
          </select>

          <div className="flex flex-wrap gap-3">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((label, i) => (
              <label key={i} className="glass-btn px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  name="daysOfWeek" 
                  value={i} 
                  defaultChecked={parseDaysOfWeek(habit.daysOfWeek)?.includes(i)} 
                  className="w-4 h-4 accent-emerald"
                />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-start gap-2">
            <Button type="submit" className="bg-ocean hover:bg-ocean/90 text-teal rounded-lg px-4 py-2 font-medium">Save changes</Button>
            <DeleteHabitButton habitId={habit.id} />
          </div>
        </form>

        <div className="text-sm text-muted-foreground glass-card p-4">
            Current: <span className="text-emerald font-medium">{stats.current}</span> • Longest: <span className="text-ocean font-medium">{stats.longest}</span> • Total (last year): <span className="text-gold font-medium">{totalLastYear}</span>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">History</h2>
  
          <ul className="space-y-2">
            {habit.checkIns.slice(0, 30).map((c) => {
              const isValidDay = isScheduledDay(c.day, schedule);
              return (
                <li key={c.day} className={`glass-item p-3 text-sm flex flex-col gap-1 ${
                  c.day === today ? "!border-emerald/40 !bg-emerald/10" : ""
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={c.day === today ? "text-emerald font-medium" : "text-foreground"}>{c.day}</span>
                    <div className="flex items-center gap-2">
                      {c.day === today && <span className="text-teal bg-emerald px-2 py-1 rounded-lg border border-emerald/60 font-medium text-xs">Today</span>}
                      {!isValidDay && (
                        <span className="text-xs text-gold bg-gold/20 px-2 py-1 rounded-lg border border-gold/40">
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
              <li className="glass-item text-sm text-muted-foreground py-4 text-center">
                No check-ins yet.
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    );
  }