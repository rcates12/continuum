/**
 * Server actions for habit management.
 * 
 * This file contains server-side functions that handle habit creation and check-in tracking.
 * All functions are marked with "use server" to run on the server and can be called directly
 * from React Server Components or Client Components.
 */

"use server";

import { prisma } from "@/src/lib/prisma";
import { z } from "zod";
import { getAuthUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";
import { daysOfWeekToCsv } from "@/src/lib/schedule";

/**
 * Generates a date key string in YYYY-MM-DD format for the current local date.
 * 
 * This key is used to uniquely identify check-ins for a specific day. The function uses
 * the local timezone, which is sufficient for MVP but should be replaced with user-specific
 * timezones in production.
 * 
 * @returns A string in the format "YYYY-MM-DD" (e.g., "2024-01-15")
 */
function todayKey() {
  // Local day key. Good enough for MVP; later you can store user timezone.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Creates a new habit for the authenticated user.
 * 
 * This function:
 * 1. Authenticates the user (using dev user for MVP)
 * 2. Ensures the user exists in the database (upsert pattern)
 * 3. Validates the habit name (1-50 characters)
 * 4. Creates the habit record associated with the user
 * 
 * @param formData - FormData containing the habit name under the "name" key
 * @throws Error if the habit name is invalid (empty or exceeds 50 characters)
 */
export async function createHabit(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const { id: userId, email } = await getAuthUser();

  // Ensure user exists in the database (syncs Clerk user to local DB)
  // Uses upsert to create if missing, or update if exists
  await prisma.user.upsert({
    where: { id: userId },
    update: { email },
    create: { id: userId, email },
  });

  // Define validation schema for habit name
  // Name must be between 1 and 50 characters
  const schema = z.object({
    name: z.string().min(1).max(50),
    scheduleType: z.enum(["DAILY", "WEEKDAYS", "CUSTOM"]).default("DAILY"),
    // for CUSTOM, you'll receive multiple checkbox values -> handle separately
  });

  // Parse and validate the form data
  const parsed = schema.safeParse({
    name: String(formData.get("name") ?? ""),
    scheduleType: String(formData.get("scheduleType") ?? "DAILY"),
  });

  if (!parsed.success) {
    return { error: "Invalid habit name" };
  }

  const scheduleType = parsed.data.scheduleType;

  // Collect custom days from checkboxes named "daysOfWeek"
  const rawDays = formData.getAll("daysOfWeek").map((v) => Number(v));
  const validDays = rawDays.filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  
  // Validate that CUSTOM schedule type has at least one day selected
  if (scheduleType === "CUSTOM" && validDays.length === 0) {
    return { error: "Please select at least one day for custom schedule" };
  }
  
  const daysCsv = 
    scheduleType === "CUSTOM" ? daysOfWeekToCsv(validDays) : null;

  try {
    // Create the habit record in the database
    await prisma.habit.create({
      data: {
        userId,
        name: parsed.data.name,
        scheduleType: scheduleType,
        daysOfWeek: daysCsv,
      },
    });
    
    revalidatePath("/habits");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create habit" };
  }
}

/**
 * Toggles a check-in for a habit on the current day.
 * 
 * This function implements a toggle behavior:
 * - If a check-in exists for today, it deletes it (uncheck)
 * - If no check-in exists for today, it creates one (check)
 * 
 * The function also verifies that the habit belongs to the authenticated user
 * before allowing the operation.
 * 
 * @param habitId - The unique identifier of the habit to check in/out
 * @throws Error if the habit is not found or doesn't belong to the user
 */
export async function toggleCheckIn(habitId: string, day?: string) {
  const { id: userId } = await getAuthUser();

  // Verify that the habit exists and belongs to the authenticated user
  // This prevents users from modifying habits they don't own
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });
  if (!habit) throw new Error("Habit not found");

  // Get the date key for today
  const actualDay = day ?? todayKey();

  const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

  const parsedDay = daySchema.safeParse(actualDay);
  if(!parsedDay.success) {
    throw new Error("Invalid date format");
  }

  // Check if a check-in already exists for this habit on this day
  // Uses the unique constraint on (habitId, day) to find the record
  const existing = await prisma.checkIn.findUnique({
    where: { habitId_day: { habitId, day: actualDay } },
  });

  // Toggle logic: delete if exists, create if doesn't exist
  if (existing) {
    // Check-in exists, so remove it (uncheck)
    await prisma.checkIn.delete({ where: { id: existing.id } });
  } else {
    // No check-in exists, so create one (check)
    await prisma.checkIn.create({ data: { habitId, day: actualDay } });
  }
  revalidatePath("/habits");
  revalidatePath(`/habits/${habitId}`);
}

// Deletes a habit and all associated check-ins
// @param habitId - The unique identifier of the habit to delete
// @throws Error if the habit is not found or doesn't belong to the user
export async function deleteHabit(habitId: string) {
  const { id: userId } = await getAuthUser();
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });
  if (!habit) throw new Error("Habit not found");
  await prisma.habit.delete({ where: { id: habitId } });
  revalidatePath("/habits");
}

export async function updateHabit(habitId: string, name: string, scheduleType: string, daysOfWeek: number[]) {
  const { id: userId } = await getAuthUser();

  // verify that the habit exists and belongs to the user
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: { id: true },
  });
  if (!habit) throw new Error("Habit not found");

  // validate name and schedule type
  const schema = z.object({
    name: z.string().min(1).max(50),
    scheduleType: z.enum(["DAILY", "WEEKDAYS", "CUSTOM"]).default("DAILY"),
    daysOfWeek: z.array(z.number().min(0).max(6)).default([]),
  });
  const parsed = schema.safeParse({ name, scheduleType, daysOfWeek });
  if (!parsed.success) throw new Error("Invalid habit name or schedule type");

  // update the habit record
  await prisma.habit.update({ where: { id: habitId }, data: { name: parsed.data.name, scheduleType: parsed.data.scheduleType } });
  // revalidate list and detail pages
  revalidatePath("/habits");
  revalidatePath(`/habits/${habitId}`);
}