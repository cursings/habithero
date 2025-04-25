import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { format } from "date-fns";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getAllHabits();
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  // Get a single habit
  app.get("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.getHabit(id);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(habit);
    } catch (error) {
      console.error("Error fetching habit:", error);
      res.status(500).json({ message: "Failed to fetch habit" });
    }
  });

  // Create a new habit
  app.post("/api/habits", async (req, res) => {
    try {
      const parsedBody = insertHabitSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid habit data", errors: parsedBody.error });
      }
      
      const newHabit = await storage.createHabit(parsedBody.data);
      res.status(201).json(newHabit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  // Update a habit
  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsedBody = insertHabitSchema.partial().safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid habit data", errors: parsedBody.error });
      }
      
      const updatedHabit = await storage.updateHabit(id, parsedBody.data);
      
      if (!updatedHabit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json(updatedHabit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(500).json({ message: "Failed to update habit" });
    }
  });

  // Delete a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHabit(id);
      
      if (!success) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Get all completions
  app.get("/api/completions", async (req, res) => {
    try {
      const completions = await storage.getAllCompletions();
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Get completions by habit ID
  app.get("/api/completions/habit/:habitId", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const completions = await storage.getCompletionsByHabitId(habitId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Get completions by date
  app.get("/api/completions/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const completions = await storage.getCompletionsByDate(date);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions:", error);
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  // Create a completion (mark habit as done)
  app.post("/api/completions", async (req, res) => {
    try {
      const parsedBody = insertHabitCompletionSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        return res.status(400).json({ message: "Invalid completion data", errors: parsedBody.error });
      }
      
      // Validate that the habit exists
      const habit = await storage.getHabit(parsedBody.data.habitId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      const completion = await storage.createCompletion(parsedBody.data);
      res.status(201).json(completion);
    } catch (error) {
      console.error("Error creating completion:", error);
      res.status(500).json({ message: "Failed to create completion" });
    }
  });

  // Delete a completion (mark habit as not done)
  app.delete("/api/completions/:habitId/:date", async (req, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const { date } = req.params;
      
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const success = await storage.deleteCompletion(habitId, date);
      
      if (!success) {
        return res.status(404).json({ message: "Completion not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting completion:", error);
      res.status(500).json({ message: "Failed to delete completion" });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get today's habits
  app.get("/api/today", async (req, res) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const completions = await storage.getCompletionsByDate(today);
      const habits = await storage.getAllHabits();
      
      const todayData = habits.map(habit => {
        const isCompleted = completions.some(c => c.habitId === habit.id);
        return {
          ...habit,
          completed: isCompleted
        };
      });
      
      res.json(todayData);
    } catch (error) {
      console.error("Error fetching today's habits:", error);
      res.status(500).json({ message: "Failed to fetch today's habits" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
