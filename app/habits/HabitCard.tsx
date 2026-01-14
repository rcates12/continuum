"use client";

import { useState } from "react";
import { toggleCheckIn, updateHabit, deleteHabit } from "@/src/actions/habits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckIcon, FlameIcon, TrophyIcon, TrashIcon, SettingsIcon, CalendarIcon } from "lucide-react";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    scheduleType: "DAILY" | "WEEKDAYS" | "CUSTOM";
    daysOfWeek: string | null;
  };
  stats: {
    current: number;
    longest: number;
  };
  checkedInToday: boolean;
  today: string;
  yesterday: string;
  validDays: string;
  parsedDaysOfWeek: number[] | null;
}

export function HabitCard({ 
  habit, 
  stats, 
  checkedInToday, 
  yesterday,
  validDays,
  parsedDaysOfWeek
}: HabitCardProps) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [habitName, setHabitName] = useState(habit.name);
  const [scheduleType, setScheduleType] = useState(habit.scheduleType);
  const [selectedDays, setSelectedDays] = useState<number[]>(parsedDaysOfWeek || []);

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    await updateHabit(habit.id, habitName, scheduleType, selectedDays);
    setEditMode(false);
  };

  const handleDelete = async () => {
    await deleteHabit(habit.id);
    setDeleteOpen(false);
    setOpen(false);
  };

  return (
    <>
      {/* Card preview */}
      <button
        onClick={() => setOpen(true)}
        className="glass-item p-5 text-left w-full group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate group-hover:text-gold transition-colors">
              {habit.name}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1.5 text-emerald">
                <FlameIcon className="size-4" />
                <span className="font-medium">{stats.current}</span>
              </span>
              <span className="flex items-center gap-1.5 text-ocean">
                <TrophyIcon className="size-4" />
                <span className="font-medium">{stats.longest}</span>
              </span>
            </div>
          </div>

          {/* Quick check-in indicator */}
          <div className={`shrink-0 size-12 rounded-xl flex items-center justify-center transition-all ${
            checkedInToday 
              ? "bg-emerald/20 border-2 border-emerald text-emerald" 
              : "glass-btn text-muted-foreground group-hover:text-ocean"
          }`}>
            {checkedInToday ? (
              <CheckIcon className="size-6" strokeWidth={3} />
            ) : (
              <div className="size-3 rounded-full bg-current opacity-30" />
            )}
          </div>
        </div>
      </button>

      {/* Full habit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          {!editMode ? (
            // View mode
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-gold text-xl">{habit.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="size-3" />
                      {validDays}
                    </DialogDescription>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="glass-btn p-2 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <SettingsIcon className="size-4" />
                  </button>
                </div>
              </DialogHeader>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-item p-4 text-center">
                  <FlameIcon className="size-6 text-emerald mx-auto mb-1" />
                  <div className="text-2xl font-bold text-emerald">{stats.current}</div>
                  <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
                <div className="glass-item p-4 text-center">
                  <TrophyIcon className="size-6 text-ocean mx-auto mb-1" />
                  <div className="text-2xl font-bold text-ocean">{stats.longest}</div>
                  <div className="text-xs text-muted-foreground">Best Streak</div>
                </div>
              </div>

              {/* Check-in buttons */}
              <div className="space-y-2">
                <form action={async () => { await toggleCheckIn(habit.id); }}>
                  <Button
                    type="submit"
                    className={`w-full rounded-xl py-6 text-lg font-medium ${
                      checkedInToday 
                        ? "bg-emerald text-teal hover:bg-emerald/90" 
                        : "bg-ocean text-teal hover:bg-ocean/90"
                    }`}
                  >
                    {checkedInToday ? (
                      <>
                        <CheckIcon className="size-5 mr-2" />
                        Checked in today
                      </>
                    ) : (
                      "Check in for today"
                    )}
                  </Button>
                </form>

                <div className="flex gap-2">
                  <form action={async () => { await toggleCheckIn(habit.id, yesterday); }} className="flex-1">
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full glass-btn rounded-xl py-3 text-sm"
                    >
                      Toggle yesterday
                    </Button>
                  </form>
                  <form 
                    action={async (formData: FormData) => {
                      const day = String(formData.get("day"));
                      await toggleCheckIn(habit.id, day);
                    }}
                    className="flex-1 flex gap-1"
                  >
                    <input 
                      type="date"
                      name="day"
                      className="glass-input flex-1 rounded-xl px-3 py-2 text-sm text-foreground"
                      required
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="glass-btn rounded-xl px-3 text-sm"
                    >
                      Toggle
                    </Button>
                  </form>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Edit mode
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-gold">Edit Habit</DialogTitle>
                <DialogDescription>
                  Update your habit details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Habit name</label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="glass-input w-full rounded-xl px-4 py-3 text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Schedule</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "DAILY", label: "Every day" },
                      { value: "WEEKDAYS", label: "Weekdays" },
                      { value: "CUSTOM", label: "Custom" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setScheduleType(option.value as typeof scheduleType)}
                        className={`glass-btn px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                          scheduleType === option.value
                            ? "!bg-ocean/30 !border-ocean text-ocean"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {scheduleType === "CUSTOM" && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Select days</label>
                    <div className="flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDayToggle(i)}
                          className={`glass-btn px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedDays.includes(i)
                              ? "!bg-emerald/30 !border-emerald text-emerald"
                              : ""
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  className="rounded-xl"
                >
                  <TrashIcon className="size-4 mr-1" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditMode(false);
                      setHabitName(habit.name);
                      setScheduleType(habit.scheduleType);
                      setSelectedDays(parsedDaysOfWeek || []);
                    }}
                    className="text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-ocean text-teal hover:bg-ocean/90 rounded-xl font-medium"
                  >
                    Save changes
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-pink/30">
          <DialogHeader>
            <DialogTitle className="text-pink font-semibold">Delete Habit</DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete "{habit.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="text-muted-foreground">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-xl font-medium">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

