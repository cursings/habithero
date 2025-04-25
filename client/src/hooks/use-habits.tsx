import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Habit, HabitCompletion, InsertHabit, HabitStats } from "@shared/schema";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function useHabits() {
  const { toast } = useToast();
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);

  const { data: habits = [], isLoading: isLoadingHabits } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    // Increase stale time to avoid unnecessary refetches
    staleTime: 0,
    // Reduce refetch interval to ensure fresh data
    refetchInterval: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Log habits whenever they change
  useEffect(() => {
    console.log("Current habits:", habits);
  }, [habits]);

  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<HabitCompletion[]>({
    queryKey: ["/api/completions"],
    staleTime: 0,
    refetchInterval: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const addHabitMutation = useMutation({
    mutationFn: (habit: InsertHabit) => {
      return apiRequest("POST", "/api/habits", habit);
    },
    onSuccess: (data) => {
      console.log("Habit added successfully:", data);
      
      // Force immediate refetch of all data
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Wait for refetch to complete
      Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/habits"] }),
        queryClient.refetchQueries({ queryKey: ["/api/completions"] }),
        queryClient.refetchQueries({ queryKey: ["/api/stats"] })
      ]).then(() => {
        console.log("All data refetched successfully");
      });
      
      toast({
        title: "Success",
        description: "Habit added successfully",
      });
      setIsAddHabitModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add habit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: (data: { habitId: number; date: string; completed: boolean }) => {
      if (data.completed) {
        return apiRequest("POST", "/api/completions", {
          habitId: data.habitId,
          date: data.date,
        });
      } else {
        return apiRequest("DELETE", `/api/completions/${data.habitId}/${data.date}`);
      }
    },
    onSuccess: () => {
      // Force immediate refetch of all data
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Wait for refetch to complete
      Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/habits"] }),
        queryClient.refetchQueries({ queryKey: ["/api/completions"] }),
        queryClient.refetchQueries({ queryKey: ["/api/stats"] })
      ]).then(() => {
        console.log("All data refetched successfully after toggle");
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update habit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { data: stats = {
    completionRate: 0, 
    completionRateChange: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalCompletionsChange: 0
  }, isLoading: isLoadingStats } = useQuery<HabitStats>({
    queryKey: ["/api/stats"],
    staleTime: 0,
    refetchInterval: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const isHabitCompletedToday = (habitId: number): boolean => {
    const today = format(new Date(), "yyyy-MM-dd");
    return completions.some(
      (completion) => 
        completion.habitId === habitId && 
        completion.date === today
    );
  };

  const getHabitCurrentStreak = (habitId: number): number => {
    // Find the habit completions and sort by date
    const habitCompletions = completions
      .filter(completion => completion.habitId === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Check if the habit was completed today
    const today = format(new Date(), "yyyy-MM-dd");
    const wasCompletedToday = habitCompletions.some(completion => completion.date === today);
    
    if (habitCompletions.length === 0 || (!wasCompletedToday && habitCompletions[0].date !== today)) {
      return 0;
    }
    
    let streak = 1;
    let currentDate = wasCompletedToday ? today : habitCompletions[0].date;
    
    for (let i = 1; i < 100; i++) { // Limit to prevent infinite loops
      const prevDate = format(subDays(new Date(currentDate), 1), "yyyy-MM-dd");
      const completedOnPrevDate = habitCompletions.some(
        completion => completion.date === prevDate
      );
      
      if (completedOnPrevDate) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getHabitWeeklyProgress = (habitId: number): number => {
    // Calculate completion percentage for the last 7 days
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      dates.push(format(subDays(today, i), "yyyy-MM-dd"));
    }
    
    const habitCompletions = completions.filter(
      completion => completion.habitId === habitId && dates.includes(completion.date)
    );
    
    return Math.round((habitCompletions.length / 7) * 100);
  };

  const getLastCompletedText = (habitId: number): string => {
    const habitCompletions = completions
      .filter(completion => completion.habitId === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitCompletions.length === 0) {
      return "Never";
    }
    
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    
    if (habitCompletions[0].date === today) {
      return "Today";
    } else if (habitCompletions[0].date === yesterday) {
      return "Yesterday";
    } else {
      // Calculate days ago
      const diffTime = Math.abs(new Date().getTime() - new Date(habitCompletions[0].date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  return {
    habits,
    completions,
    stats,
    isLoadingHabits,
    isLoadingCompletions,
    isLoadingStats,
    isAddHabitModalOpen,
    setIsAddHabitModalOpen,
    addHabit: addHabitMutation.mutate,
    isPendingAddHabit: addHabitMutation.isPending,
    toggleCompletion: toggleCompletionMutation.mutate,
    isPendingToggleCompletion: toggleCompletionMutation.isPending,
    isHabitCompletedToday,
    getHabitCurrentStreak,
    getHabitWeeklyProgress,
    getLastCompletedText
  };
}
