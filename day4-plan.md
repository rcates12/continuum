Day 4 (1 hour): Backfill + Arbitrary Day Check-ins
Outcome

On the habit detail page, you can:

Check in for today (still)

Check in for yesterday (quick button)

Check in for any date (via date input)

See streaks update correctly

Engineering Intent (why this matters)

Right now, your system is implicitly tied to “today”.

That’s fragile.

Today you will:

Make the system date-aware

Make check-ins idempotent for any day

Prepare for real-world usage (missed days, timezone weirdness, etc.)

This teaches:

Business rules vs UI

Server-side validation

Generalized mutations

Step 1: Generalize toggleCheckIn to accept a day
Change signature

In src/actions/habits.ts, change:

export async function toggleCheckIn(habitId: string)


to:

export async function toggleCheckIn(habitId: string, day?: string)


Inside the function, replace the hardcoded today logic:

const day = todayKey();


with:

const actualDay = day ?? todayKey();


Then use actualDay everywhere instead of day.

Step 2: Add yesterday button on detail page

In app/habits/[id]/page.tsx, compute yesterday:

const y = new Date();
y.setDate(y.getDate() - 1);
const yesterday = dayKey(y);


Add another form:

<form
  action={async () => {
    "use server";
    await toggleCheckIn(habit.id, yesterday);
  }}
>
  <button className="rounded-md px-3 py-2 text-sm bg-gray-100">
    Toggle yesterday
  </button>
</form>

Step 3: Add a date picker

Add this UI under the buttons:

<form
  action={async (formData: FormData) => {
    "use server";
    const day = String(formData.get("day"));
    await toggleCheckIn(habit.id, day);
  }}
  className="flex gap-2"
>
  <input
    type="date"
    name="day"
    className="rounded-md border px-3 py-2 text-sm"
    required
  />
  <button className="rounded-md px-3 py-2 text-sm bg-gray-100">
    Toggle day
  </button>
</form>

Step 4: Add server-side validation

In toggleCheckIn, add guardrails:

import { z } from "zod";

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);


Then:

const parsedDay = daySchema.safeParse(actualDay);
if (!parsedDay.success) {
  throw new Error("Invalid date format");
}


Optional rule:

Disallow future dates

Disallow more than 7 days ago

Step 5: Update revalidation

Make sure you already have:

revalidatePath("/habits");
revalidatePath(`/habits/${habitId}`);


This becomes more important now.

Step 6: Show visual clarity in history

On the detail page history list:

Highlight today

Highlight yesterday

Maybe gray out old days

Example:

<li
  key={c.day}
  className={`rounded-md border p-3 text-sm ${
    c.day === today ? "bg-green-50" : ""
  }`}
>
  {c.day}
</li>

Manual Test Checklist

Toggle today → streak increments

Toggle yesterday → streak increments if today is checked

Toggle yesterday off → streak recalculates

Pick a random date last week → appears in history

Pick same date again → it removes

What this unlocks next

After Day 4, your system is time-correct. That means:

Day 5 becomes easy:

Schedules (weekday-only, custom days)

“Expected days” logic

No more hardcoded daily streaks

If you want, I can now:

✅ Generate your exact Day 4 code patches
✅ Adjust for your current file structure
✅ Add the validation rules
✅ Add UX polish

Just say: “Give me the Day 4 code patches.”