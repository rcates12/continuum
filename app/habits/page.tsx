import { prisma } from "@/src/lib/prisma";
import { toggleCheckIn } from "@/src/actions/habits";
import { getDevUser } from "@/src/lib/auth";
import Link from "next/link";
//import { computeStreakStats } from "@/src/lib/streaks";
import { parseDaysOfWeek } from "@/src/lib/schedule";
import { computeScheduleStreakStats, dayKey } from "@/src/lib/streaks";
import { CreateHabitForm } from "./CreateHabitForm";

const today = dayKey();
const d = new Date();
d.setDate(d.getDate() - 365);
const minDay = dayKey(d);
const y = new Date();
y.setDate(y.getDate() - 1);
const yesterday = dayKey(y);

function todayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default async function HabitsPage() {
    const user = await getDevUser();
    const day = todayKey();

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

    return (
        <>
        <div className="max-w-5xl mx-auto pt-8 text-center">
            <h1 className="text-4xl font-bold text-white">Continuum</h1>
            <p className="text-sm text-muted-foreground">A habit tracker for your life</p>
        </div>
        <div className="flex flex-col gap-4 max-w-5xl mx-auto py-16 bg-white/20 rounded-2xl p-6 mt-8">
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">Today: <span className="text-ocean font-medium">{day}</span></p>
            </header>

            <CreateHabitForm />

            <ul className="space-y-2">
                {habits.map((h) => {

                    const schedule = {
                        scheduleType: h.scheduleType,
                        daysOfWeek: parseDaysOfWeek(h.daysOfWeek),
                    }

                    const stats = computeScheduleStreakStats(
                        h.checkIns.map((c) => c.day),
                        schedule,
                        today,
                        minDay
                    );

                    const checkedInToday = h.checkIns.some((c) => c.day === today);

                    return (    
                    <li key={h.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-1">
                            <div className="font-medium"><Link href={`/habits/${h.id}`} className="font-semibold text-ocean hover:text-ocean/80 underline underline-offset-4 transition-colors">{h.name}</Link></div>
                            <div className="text-sm text-muted-foreground">
                            Current: {stats.current} • Longest: {stats.longest}
                            </div>
                            <div className="text-xs inline-block mt-2">
                                {checkedInToday ? <span className="bg-emerald text-white border border-emerald/80 px-2 py-1 rounded-full">✓ today</span> : <span className="bg-secondary text-muted-foreground border border-border px-2 py-1 rounded-full">Not checked today</span>}
                            </div>
                        </div>

                        <form
                            action={async () => {
                                "use server";
                                await toggleCheckIn(h.id, yesterday);
                            }}
                            >
                            <button className="rounded-md px-3 py-2 text-sm bg-secondary hover:bg-gold/20 transition-colors border border-border">Toggle yesterday</button>
                       </form>

                        <form
                            action={async () => {
                            "use server";
                            await toggleCheckIn(h.id);
                            }}
                        >
                            <button
                            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                checkedInToday ? "bg-emerald text-white hover:bg-emerald/90" : "bg-ocean text-white hover:bg-ocean/90"
                            }`}
                            >
                            {checkedInToday ? "Checked in" : "Check in"}
                            </button>
                        </form>

                        <form
                            action={async (formData: FormData) => {
                                "use server";
                                const day = String(formData.get("day"));
                                await toggleCheckIn(h.id, day);
                            }}
                            className="flex gap-2"
                            >
                                <input 
                                    type="date"
                                    name="day"
                                    className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                                    required
                                />
                                <button className="rounded-md px-3 py-2 text-sm bg-secondary hover:bg-gold/20 transition-colors border border-border">
                                    Toggle day
                                </button>

                            </form>
                    </li>
                    );
                })}

                {habits.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                        No habits yet - add one to get started!
                    </li>
                ) : null}
            </ul>
        </div>
        </>
    );
}