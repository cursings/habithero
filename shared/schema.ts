import { pgTable, text, serial, integer, boolean, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // Daily, Weekly, or custom string like "Mon, Wed, Fri"
  reminderTime: text("reminder_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Habit completions table to track when habits are completed
export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Each habit can only be completed once per day
    unq: unique().on(table.habitId, table.date),
  };
});

// Insert schemas
export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
  createdAt: true,
});

// Types
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;

// Stats type for the frontend
export type HabitStats = {
  completionRate: number;
  completionRateChange: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  totalCompletionsChange: number;
};
