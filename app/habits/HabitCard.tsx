"use client";

import { useState } from "react";
import { toggleCheckIn, updateHabit, deleteHabit } from "@/src/actions/habits";
import { HabitHeatmap } from "./[id]/HabitHeatmap";
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
  checkIns: string[];
}

export function HabitCard({ 
  habit, 
  stats, 
  checkedInToday, 
  yesterday,
  validDays,
  parsedDaysOfWeek,
  checkIns
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

              {/* Activity Heatmap */}
              <div>
                <HabitHeatmap 
                  checkIns={checkIns} 
                  schedule={{
                    scheduleType: habit.scheduleType,
                    daysOfWeek: parsedDaysOfWeek || [],
                  }}
                  weeks={26}
                />
              </div>

              {/* Stats - Hologram 3D Effect */}
              <div className="flex gap-4" style={{ perspective: '1200px' }}>
                {/* Current Streak Hologram */}
                <div className="flex-1 relative h-32 flex items-center justify-center" style={{
                  perspective: '1200px',
                }}>
                  {/* Hologram glow effect */}
                  <div className="absolute inset-0 rounded-xl blur-2xl bg-gradient-to-b from-emerald/40 via-emerald/20 to-transparent opacity-60 animate-pulse" />
                  
                  {/* Hologram scan lines */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald/10 via-transparent to-emerald/10 animate-pulse" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald/60 to-transparent" />
                  </div>

                  {/* Hologram container with 3D perspective */}
                  <div className="relative z-10 text-center">
                    {/* Hologram label */}
                    <div className="text-xs uppercase tracking-widest text-emerald/70 font-semibold mb-2 drop-shadow-lg" style={{
                      textShadow: '0 0 10px rgba(6, 214, 160, 0.6), 0 0 20px rgba(6, 214, 160, 0.3)',
                      filter: 'brightness(1.2)',
                    }}>
                      Current
                    </div>

                    {/* Main hologram number with multiple shadow layers - ROTATING */}
                    <div className="relative" style={{
                      animation: 'hologram-rotate-y 6s linear infinite',
                      transformStyle: 'preserve-3d',
                      width: 'fit-content',
                      margin: '0 auto',
                    }}>
                      {/* Deep shadow layers for 3D effect */}
                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-emerald/25" style={{
                        transform: 'translate(12px, 12px)',
                        filter: 'blur(2px)',
                      }}>
                        {stats.current}
                      </div>

                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-emerald/20" style={{
                        transform: 'translate(8px, 8px)',
                        filter: 'blur(1px)',
                      }}>
                        {stats.current}
                      </div>

                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-emerald/15" style={{
                        transform: 'translate(4px, 4px)',
                      }}>
                        {stats.current}
                      </div>
                      
                      {/* Light edge highlight for dimension */}
                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-white/30" style={{
                        transform: 'translate(-2px, -2px)',
                        filter: 'blur(0.5px)',
                      }}>
                        {stats.current}
                      </div>

                      {/* Main hologram number - 3D plastic */}
                      <div className="relative text-5xl font-black tracking-tighter" style={{
                        background: 'linear-gradient(135deg, rgba(6, 214, 160, 0.85) 0%, rgba(6, 214, 160, 0.6) 50%, rgba(0, 255, 200, 0.7) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                        filter: 'drop-shadow(0 2px 4px rgba(6, 214, 160, 0.2))',
                        position: 'relative',
                        zIndex: 10,
                      }}>
                        {stats.current}
                      </div>

                      {/* Hologram flicker effect (subtle) */}
                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-emerald/20 mix-blend-screen pointer-events-none" style={{
                        animation: 'hologram-flicker 3s ease-in-out infinite',
                      }}>
                        {stats.current}
                      </div>
                    </div>

                    {/* Icon with glow */}
                    <div className="mt-2 flex justify-center">
                      <FlameIcon className="size-5 text-emerald" style={{
                        filter: 'drop-shadow(0 0 8px rgba(6, 214, 160, 0.6))',
                      }} />
                    </div>
                  </div>

                  {/* Hologram frame border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-emerald/30 pointer-events-none" style={{
                    boxShadow: 'inset 0 0 20px rgba(6, 214, 160, 0.1), 0 0 30px rgba(6, 214, 160, 0.2)',
                  }} />

                  {/* Corner accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald/60" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald/60" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald/60" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald/60" />
                </div>

                {/* Best Streak Hologram */}
                <div className="flex-1 relative h-32 flex items-center justify-center" style={{
                  perspective: '1200px',
                }}>
                  {/* Hologram glow effect */}
                  <div className="absolute inset-0 rounded-xl blur-2xl bg-gradient-to-b from-ocean/40 via-ocean/20 to-transparent opacity-60 animate-pulse" />
                  
                  {/* Hologram scan lines */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-ocean/10 via-transparent to-ocean/10 animate-pulse" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ocean/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ocean/60 to-transparent" />
                  </div>

                  {/* Hologram container with 3D perspective */}
                  <div className="relative z-10 text-center">
                    {/* Hologram label */}
                    <div className="text-xs uppercase tracking-widest text-ocean/70 font-semibold mb-2 drop-shadow-lg" style={{
                      textShadow: '0 0 10px rgba(61, 184, 229, 0.6), 0 0 20px rgba(61, 184, 229, 0.3)',
                      filter: 'brightness(1.2)',
                    }}>
                      Best
                    </div>

                    {/* Main hologram number with multiple shadow layers - ROTATING */}
                    <div className="relative" style={{
                      animation: 'hologram-rotate-y-opposite 6s linear infinite',
                      transformStyle: 'preserve-3d',
                      width: 'fit-content',
                      margin: '0 auto',
                    }}>
                      {/* Deep shadow layers for 3D effect */}
                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-ocean/25" style={{
                        transform: 'translate(12px, 12px)',
                        filter: 'blur(2px)',
                      }}>
                        {stats.longest}
                      </div>

                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-ocean/20" style={{
                        transform: 'translate(8px, 8px)',
                        filter: 'blur(1px)',
                      }}>
                        {stats.longest}
                      </div>

                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-ocean/15" style={{
                        transform: 'translate(4px, 4px)',
                      }}>
                        {stats.longest}
                      </div>
                      
                      {/* Light edge highlight for dimension */}
                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-white/30" style={{
                        transform: 'translate(-2px, -2px)',
                        filter: 'blur(0.5px)',
                      }}>
                        {stats.longest}
                      </div>

                      {/* Main hologram number - 3D plastic */}
                      <div className="relative text-5xl font-black tracking-tighter" style={{
                        background: 'linear-gradient(135deg, rgba(61, 184, 229, 0.85) 0%, rgba(61, 184, 229, 0.6) 50%, rgba(0, 200, 255, 0.7) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                        filter: 'drop-shadow(0 2px 4px rgba(61, 184, 229, 0.2))',
                        position: 'relative',
                        zIndex: 10,
                      }}>
                        {stats.longest}
                      </div>

                      {/* Hologram flicker effect (subtle) */}
                      <div className="absolute inset-0 text-5xl font-black tracking-tighter text-ocean/20 mix-blend-screen pointer-events-none" style={{
                        animation: 'hologram-flicker 3s ease-in-out infinite',
                      }}>
                        {stats.longest}
                      </div>
                    </div>

                    {/* Icon with glow */}
                    <div className="mt-2 flex justify-center">
                      <TrophyIcon className="size-5 text-ocean" style={{
                        filter: 'drop-shadow(0 0 8px rgba(61, 184, 229, 0.6))',
                      }} />
                    </div>
                  </div>

                  {/* Hologram frame border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-ocean/30 pointer-events-none" style={{
                    boxShadow: 'inset 0 0 20px rgba(61, 184, 229, 0.1), 0 0 30px rgba(61, 184, 229, 0.2)',
                  }} />

                  {/* Corner accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-ocean/60" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-ocean/60" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-ocean/60" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-ocean/60" />
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

