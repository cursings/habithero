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

  // Set a minimal stale time and ultra-fast refetch interval for immediate updates
  const { data: habits = [], isLoading: isLoadingHabits } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    staleTime: 0,
    refetchInterval: 50, // Ultra-fast refresh - 50ms for instant response
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Log habits whenever they change
  useEffect(() => {
    console.log("Current habits:", habits);
  }, [habits]);

  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<HabitCompletion[]>({
    queryKey: ["/api/completions"],
    staleTime: 0,
    refetchInterval: 50, // Ultra-fast refresh - 50ms for instant response
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const addHabitMutation = useMutation({
    mutationFn: async (habit: InsertHabit) => {
      console.log("Adding habit:", habit);
      const response = await apiRequest("POST", "/api/habits", habit);
      const newHabit = await response.json();
      return newHabit as Habit;
    },
    onSuccess: async (newHabit) => {
      console.log("Habit added successfully:", newHabit);
      
      // Force immediate update to show the habit without waiting for the refetch interval
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        return [...oldData, newHabit];
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
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
    mutationFn: async (data: { habitId: number; date: string; completed: boolean }) => {
      // Before making the API call, update the cache optimistically for instant UI feedback
      const today = format(new Date(), "yyyy-MM-dd");
      if (data.completed) {
        // Add a completion optimistically
        queryClient.setQueryData<HabitCompletion[]>(["/api/completions"], (oldCompletions = []) => {
          // First check if it already exists to avoid duplicates
          if (oldCompletions.some(c => c.habitId === data.habitId && c.date === today)) {
            return oldCompletions;
          }
          
          // Create temporary completion for immediate UI update
          const tempCompletion = {
            id: Date.now(),
            habitId: data.habitId,
            date: today,
            createdAt: new Date().toISOString()
          };
          
          return [...oldCompletions, tempCompletion as unknown as HabitCompletion];
        });
      } else {
        // Remove completion optimistically
        queryClient.setQueryData<HabitCompletion[]>(["/api/completions"], (oldCompletions = []) => {
          return oldCompletions.filter(c => !(c.habitId === data.habitId && c.date === today));
        });
      }
      
      // Now make the actual API call
      if (data.completed) {
        const response = await apiRequest("POST", "/api/completions", {
          habitId: data.habitId,
          date: data.date,
        });
        return await response.json();
      } else {
        return await apiRequest("DELETE", `/api/completions/${data.habitId}/${data.date}`);
      }
    },
    onSuccess: async () => {
      // Silently refresh data in the background to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      // On error, force refetch to correct any inconsistencies
      queryClient.refetchQueries({ queryKey: ["/api/completions"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Error",
        description: `Failed to update habit: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      // Optimistically update UI before the API call
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        return oldData.filter(habit => habit.id !== habitId);
      });
      
      // Optimistically update completions cache too
      queryClient.setQueryData<HabitCompletion[]>(["/api/completions"], (oldCompletions = []) => {
        return oldCompletions.filter(c => c.habitId !== habitId);
      });
      
      // Make the actual API call
      return await apiRequest("DELETE", `/api/habits/${habitId}`);
    },
    onSuccess: async () => {
      // Silently update in the background
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      // On error, invalidate and force refresh to correct state
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/habits"] });
      
      toast({
        title: "Error",
        description: `Failed to delete habit: ${error.message}`,
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
    refetchInterval: 50, // Ultra-fast refresh - 50ms for instant response
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const isHabitCompletedToday = (habitId: number): boolean => {
    const today = format(new Date(), "yyyy-MM-dd");
    
    // First check if we have any completions data
    if (!completions || completions.length === 0) {
      return false;
    }
    
    // Check if this habit was completed today
    const completed = completions.some(completion => 
      completion.habitId === habitId && 
      completion.date === today
    );
    
    console.log(`Checking if habit ${habitId} is completed today: ${completed}`);
    return completed;
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
    deleteHabit: deleteHabitMutation.mutate,
    isPendingDeleteHabit: deleteHabitMutation.isPending,
    isHabitCompletedToday,
    getHabitCurrentStreak,
    getHabitWeeklyProgress,
    getLastCompletedText
  };
}
