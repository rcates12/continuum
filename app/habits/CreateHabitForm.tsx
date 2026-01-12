"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { createHabit } from "@/src/actions/habits";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateHabitForm() {
  const [state, formAction] = useActionState(createHabit, null);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error) {
      setOpen(true);
    } else if (state && !state.error) {
      // Success - reset form
      if (formRef.current) {
        formRef.current.reset();
        // Reset select to default value
        const select = formRef.current.querySelector('select[name="scheduleType"]') as HTMLSelectElement;
        if (select) {
          select.value = "DAILY";
        }
      }
    }
  }, [state]);

  return (
    <>
      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input 
            className="flex-1 rounded-md border px-3 py-2"
            type="text" 
            name="name" 
            placeholder="New habit..." 
          />

          <select className="flex-1 rounded-md border px-3 py-2"
            name="scheduleType"
            defaultValue="DAILY"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKDAYS">Weekdays</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <Button className="rounded-md px-4 py-2">Add</Button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {[
            ["Sun", 0],
            ["Mon", 1],
            ["Tue", 2],
            ["Wed", 3],
            ["Thu", 4],
            ["Fri", 5],
            ["Sat", 6],
          ].map(([label, val]) => (
            <label key={val as number} className="flex items-center gap-1">
              <input type="checkbox" name="daysOfWeek" value={val as number} />
              {label as string}
            </label>
          ))}
        </div>
      </form>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Validation Error</DialogTitle>
            <DialogDescription className="text-base">
              {state?.error}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

