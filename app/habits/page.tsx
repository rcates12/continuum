import { prisma } from "@/src/lib/prisma";
import { getDevUser } from "@/src/lib/auth";
import { parseDaysOfWeek, formatValidDays } from "@/src/lib/schedule";
import { computeScheduleStreakStats, dayKey } from "@/src/lib/streaks";
import { NewHabitModal } from "./NewHabitModal";
import { HabitCard } from "./HabitCard";

export default async function HabitsPage() {
    const today = dayKey();
    const d = new Date();
    d.setDate(d.getDate() - 365);
    const minDay = dayKey(d);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = dayKey(y);

    const user = await getDevUser();

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

    // Calculate stats for each habit
    const habitsWithStats = habits.map((h) => {
        const parsedDays = parseDaysOfWeek(h.daysOfWeek);
        const schedule = {
            scheduleType: h.scheduleType,
            daysOfWeek: parsedDays,
        };

        const stats = computeScheduleStreakStats(
            h.checkIns.map((c) => c.day),
            schedule,
            today,
            minDay
        );

        const checkedInToday = h.checkIns.some((c) => c.day === today);
        const validDays = formatValidDays(schedule);

        return {
            habit: {
                id: h.id,
                name: h.name,
                scheduleType: h.scheduleType as "DAILY" | "WEEKDAYS" | "CUSTOM",
                daysOfWeek: h.daysOfWeek,
            },
            stats,
            checkedInToday,
            validDays,
            parsedDaysOfWeek: parsedDays,
        };
    });

    // Count today's progress
    const checkedToday = habitsWithStats.filter(h => h.checkedInToday).length;
    const totalHabits = habitsWithStats.length;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="max-w-3xl mx-auto pt-12 pb-8 text-center">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Continuum</h1>
                <p className="text-muted-foreground mt-2">Build lasting habits</p>
            </header>

            {/* New habit trigger */}
            <div className="max-w-3xl mx-auto px-4 mb-8">
                <NewHabitModal />
            </div>

            {/* Today's progress */}
            {totalHabits > 0 && (
                <div className="max-w-3xl mx-auto px-4 mb-6">
                    <div className="glass-card p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Today's Progress</p>
                            <p className="text-lg font-semibold text-foreground">
                                <span className="text-gold">{today}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">
                                <span className="text-emerald">{checkedToday}</span>
                                <span className="text-muted-foreground text-lg font-normal"> / {totalHabits}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">habits completed</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Habits grid */}
            <div className="max-w-3xl mx-auto px-4 pb-12">
                {habitsWithStats.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {habitsWithStats.map((h) => (
                            <HabitCard
                                key={h.habit.id}
                                habit={h.habit}
                                stats={h.stats}
                                checkedInToday={h.checkedInToday}
                                today={today}
                                yesterday={yesterday}
                                validDays={h.validDays}
                                parsedDaysOfWeek={h.parsedDaysOfWeek}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-12 text-center">
                        <p className="text-muted-foreground mb-2">No habits yet</p>
                        <p className="text-sm text-muted-foreground">
                            Click "New habit..." above to create your first one!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
