import { generateDateGrid, dayKey } from "@/src/lib/streaks";
import { HabitSchedule, isScheduledDay } from "@/src/lib/schedule";

type CellStatus = "checked-scheduled" | "missed-scheduled" | "checked-bonus" | "not-scheduled";

function getCellStatus(
    day: string,
    checkInSet: Set<string>,
    schedule: HabitSchedule,
    today: string,
): CellStatus {
    const isChecked = checkInSet.has(day);
    const isScheduled = isScheduledDay(day, schedule);
    const isFuture = day > today;

    if (isFuture) return "not-scheduled"; // don't color future days
    if (isScheduled && isChecked) return "checked-scheduled";
    if (isScheduled && !isChecked) return "missed-scheduled";
    if (!isScheduled && isChecked) return "checked-bonus";
    return "not-scheduled";
}

// CRT filter inspired colors with dithered/scanline aesthetic
const statusColors: Record<CellStatus, string> = {
    "checked-scheduled": "heatmap-crt-filled heatmap-crt-glow-emerald bg-emerald",
    "missed-scheduled": "heatmap-crt-missed bg-gray-700",
    "checked-bonus": "heatmap-crt-filled heatmap-crt-glow-gold bg-gold",
    "not-scheduled": "heatmap-crt-empty bg-gray-800",
};

type Props = {
    checkIns: string[];
    schedule: HabitSchedule;
    weeks?: number;
};

export function HabitHeatmap({ checkIns, schedule, weeks = 24 }: Props) {
    const grid = generateDateGrid(weeks);
    const checkInSet = new Set(checkIns);
    const today = dayKey();
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Activity</h3>
        
        <div className="flex gap-3">
          {/* Day labels column */}
          <div className="flex flex-col gap-px text-xs text-muted-foreground pt-0">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-4 flex items-center">{label}</div>
            ))}
          </div>
  
          {/* Grid of cells */}
          <div 
            className="grid gap-px heatmap-grid"
            style={{
              gridTemplateRows: "repeat(7, 14px)",
              gridTemplateColumns: `repeat(${weeks}, 14px)`,
              gridAutoFlow: "column",
            }}
          >
            {grid.flat().map((day) => {
              const status = getCellStatus(day, checkInSet, schedule, today);
              const isToday = day === today;
              const isChecked = checkInSet.has(day);
              
              return (
                <div
                  key={day}
                  title={`${day}${isChecked ? " - Checked in" : ""}`}
                  className={`
                    w-4 h-4 transition-all duration-150 cursor-default
                    heatmap-cell heatmap-cell-${status}
                    ${statusColors[status]}
                    ${isToday ? "heatmap-today" : ""}
                    ${isChecked ? "heatmap-checked" : ""}
                  `}
                />
              );
            })}
          </div>
        </div>
  
        {/* Legend */}
        <HeatmapLegend />
      </div>
    );
  }


  function HeatmapLegend() {
    const items = [
      { color: "bg-emerald heatmap-crt-glow-emerald heatmap-cell", label: "Checked (scheduled)" },
      { color: "bg-gray-700 heatmap-crt-missed heatmap-cell", label: "Missed (scheduled)" },
      { color: "bg-gold heatmap-crt-glow-gold heatmap-cell", label: "Bonus day" },
      { color: "bg-gray-800 heatmap-crt-empty heatmap-cell", label: "Not scheduled" },
    ];
  
    return (
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {items.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }