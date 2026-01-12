export type ScheduleType = "DAILY" | "WEEKDAYS" | "CUSTOM";

export type HabitSchedule = {
    scheduleType: ScheduleType;
    // weekdays are 0-6, 0 is Sunday ... 6 is Saturday
    daysOfWeek: number[];
}

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
    return dt.getDay();
}

export function isScheduledDay(day: string, schedule: HabitSchedule): boolean {
    const wd = weekdayOfDayKey(day);

    if(schedule.scheduleType === "DAILY") return true;
    if(schedule.scheduleType === "WEEKDAYS") return wd >= 1 && wd <= 5; // Monday (1) through Friday (5)

    //CUSTOM
    const set = new Set(schedule.daysOfWeek ?? []);
    return set.has(wd);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatValidDays(schedule: HabitSchedule): string {
    if (schedule.scheduleType === "DAILY") {
        return "Every day";
    }
    
    if (schedule.scheduleType === "WEEKDAYS") {
        return "Monday, Tuesday, Wednesday, Thursday, Friday";
    }
    
    // CUSTOM
    const days = schedule.daysOfWeek
        .sort((a, b) => a - b)
        .map((d) => DAY_NAMES[d])
        .filter(Boolean);
    
    if (days.length === 0) {
        return "No days selected";
    }
    
    if (days.length === 1) {
        return days[0];
    }
    
    if (days.length === 2) {
        return `${days[0]} and ${days[1]}`;
    }
    
    // For 3+ days, use Oxford comma
    const lastDay = days[days.length - 1];
    const otherDays = days.slice(0, -1).join(", ");
    return `${otherDays}, and ${lastDay}`;
}