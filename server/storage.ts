import { 
  habits, 
  Habit, 
  InsertHabit,
  habitCompletions,
  HabitCompletion,
  InsertHabitCompletion,
  HabitStats
} from "@shared/schema";
import { format, subDays } from "date-fns";

// Interface for storage operations
export interface IStorage {
  // Habit operations
  getAllHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Completion operations
  getAllCompletions(): Promise<HabitCompletion[]>;
  getCompletionsByHabitId(habitId: number): Promise<HabitCompletion[]>;
  getCompletionsByDate(date: string): Promise<HabitCompletion[]>;
  createCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  deleteCompletion(habitId: number, date: string): Promise<boolean>;
  
  // Stats operations
  getStats(): Promise<HabitStats>;
}

export class MemStorage implements IStorage {
  private habits: Map<number, Habit>;
  private habitCompletions: Map<number, HabitCompletion>;
  private habitIdCounter: number;
  private completionIdCounter: number;

  constructor() {
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.habitIdCounter = 1;
    this.completionIdCounter = 1;
  }

  // Habit operations
  async getAllHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values());
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const id = this.habitIdCounter++;
    const newHabit: Habit = {
      id,
      name: habit.name,
      frequency: habit.frequency,
      reminderTime: habit.reminderTime,
      createdAt: new Date(),
    };
    this.habits.set(id, newHabit);
    return newHabit;
  }

  async updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined> {
    const existingHabit = this.habits.get(id);
    if (!existingHabit) return undefined;

    const updatedHabit = {
      ...existingHabit,
      ...habit,
    };

    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const exists = this.habits.has(id);
    if (exists) {
      this.habits.delete(id);
      // Also delete all completions for this habit
      for (const [completionId, completion] of this.habitCompletions.entries()) {
        if (completion.habitId === id) {
          this.habitCompletions.delete(completionId);
        }
      }
      return true;
    }
    return false;
  }

  // Completion operations
  async getAllCompletions(): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values());
  }

  async getCompletionsByHabitId(habitId: number): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(
      completion => completion.habitId === habitId
    );
  }

  async getCompletionsByDate(date: string): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(
      completion => completion.date === date
    );
  }

  async createCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    // Check if there's already a completion for this habit on this date
    const existing = Array.from(this.habitCompletions.values()).find(
      c => c.habitId === completion.habitId && c.date === completion.date
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.completionIdCounter++;
    const newCompletion: HabitCompletion = {
      id,
      habitId: completion.habitId,
      date: completion.date,
      createdAt: new Date(),
    };
    
    this.habitCompletions.set(id, newCompletion);
    return newCompletion;
  }

  async deleteCompletion(habitId: number, date: string): Promise<boolean> {
    // Find the completion to delete
    for (const [id, completion] of this.habitCompletions.entries()) {
      if (completion.habitId === habitId && completion.date === date) {
        this.habitCompletions.delete(id);
        return true;
      }
    }
    return false;
  }

  // Stats operations
  async getStats(): Promise<HabitStats> {
    const completions = Array.from(this.habitCompletions.values());
    const today = new Date();
    
    // Get completions in the last 30 days
    const thirtyDaysAgo = subDays(today, 30);
    const sixtyDaysAgo = subDays(today, 60);
    
    const recentCompletions = completions.filter(
      completion => new Date(completion.date) >= thirtyDaysAgo
    );
    
    const previousPeriodCompletions = completions.filter(
      completion => 
        new Date(completion.date) >= sixtyDaysAgo && 
        new Date(completion.date) < thirtyDaysAgo
    );
    
    // Calculate completion rate (completed days / total possible days)
    const totalHabits = await this.getAllHabits();
    const totalPossibleCompletions = totalHabits.length * 30; // Assuming daily habits for simplicity
    
    const completionRate = totalPossibleCompletions > 0
      ? Math.round((recentCompletions.length / totalPossibleCompletions) * 100)
      : 0;
    
    const previousCompletionRate = totalPossibleCompletions > 0
      ? Math.round((previousPeriodCompletions.length / totalPossibleCompletions) * 100)
      : 0;
    
    // Calculate streaks
    // This is a simplified implementation - a real one would be more complex
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Get the current streak
    const todayStr = format(today, "yyyy-MM-dd");
    const todayCompletions = completions.filter(c => c.date === todayStr);
    
    if (todayCompletions.length > 0) {
      currentStreak = 1;
      
      // Count backward from yesterday
      let checkDate = subDays(today, 1);
      
      while (true) {
        const dateStr = format(checkDate, "yyyy-MM-dd");
        const dateCompletions = completions.filter(c => c.date === dateStr);
        
        if (dateCompletions.length > 0) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }
    
    // For longest streak, we'll just use a simplified calculation
    longestStreak = Math.max(currentStreak, 7); // Just for demo purposes
    
    return {
      completionRate,
      completionRateChange: completionRate - previousCompletionRate,
      currentStreak,
      longestStreak,
      totalCompletions: recentCompletions.length,
      totalCompletionsChange: recentCompletions.length - previousPeriodCompletions.length
    };
  }
}

export const storage = new MemStorage();
