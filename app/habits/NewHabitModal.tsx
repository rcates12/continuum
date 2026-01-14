"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createHabit } from "@/src/actions/habits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusIcon, SparklesIcon } from "lucide-react";

export function NewHabitModal() {
  const [state, formAction] = useActionState(createHabit, null);
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [habitName, setHabitName] = useState("");
  const [scheduleType, setScheduleType] = useState("DAILY");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) {
      setErrorOpen(true);
    } else if (state && !state.error) {
      // Success - close modal and reset
      setOpen(false);
      setStep(1);
      setHabitName("");
      setScheduleType("DAILY");
      setSelectedDays([]);
    }
  }, [state]);

  const handleTriggerClick = () => {
    setOpen(true);
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const canProceed = step === 1 ? habitName.trim().length > 0 : true;

  return (
    <>
      {/* Trigger button styled as an input */}
      <button
        onClick={handleTriggerClick}
        className="w-full max-w-md mx-auto glass-card px-5 py-4 flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all group cursor-text"
      >
        <PlusIcon className="size-5 text-ocean group-hover:scale-110 transition-transform" />
        <span className="text-lg">New habit...</span>
      </button>

      {/* Main creation modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <form ref={formRef} action={formAction}>
            {/* Hidden inputs for form submission */}
            <input type="hidden" name="name" value={habitName} />
            <input type="hidden" name="scheduleType" value={scheduleType} />
            {selectedDays.map(day => (
              <input key={day} type="hidden" name="daysOfWeek" value={day} />
            ))}

            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-gold flex items-center gap-2">
                    <SparklesIcon className="size-5" />
                    Create a new habit
                  </DialogTitle>
                  <DialogDescription>
                    What habit do you want to build?
                  </DialogDescription>
                </DialogHeader>

                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g., Morning meditation, Read 20 pages..."
                  className="glass-input w-full rounded-xl px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />

                <DialogFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceed}
                    className="bg-ocean text-teal hover:bg-ocean/90 font-medium"
                  >
                    Next
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-gold">
                    Set your schedule
                  </DialogTitle>
                  <DialogDescription>
                    How often do you want to do <span className="text-foreground font-medium">"{habitName}"</span>?
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Schedule type buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "DAILY", label: "Every day" },
                      { value: "WEEKDAYS", label: "Weekdays" },
                      { value: "CUSTOM", label: "Custom" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setScheduleType(option.value)}
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

                  {/* Custom day selection */}
                  {scheduleType === "CUSTOM" && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Select days:</p>
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

                <DialogFooter className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald text-teal hover:bg-emerald/90 font-medium"
                  >
                    Create habit
                  </Button>
                </DialogFooter>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Error dialog */}
      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent className="border-pink/30">
          <DialogHeader>
            <DialogTitle className="text-pink font-semibold">Validation Error</DialogTitle>
            <DialogDescription className="text-foreground">
              {state?.error}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorOpen(false)} className="bg-ocean text-teal hover:bg-ocean/90 font-medium">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

