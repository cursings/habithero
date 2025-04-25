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

  // Use a faster refetch interval and disable stale time to make updates more immediate
  const { data: habits = [], isLoading: isLoadingHabits } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
    staleTime: 0,
    refetchInterval: 0, // No automatic refetching
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'always',
  });

  // Log habits whenever they change
  useEffect(() => {
    console.log("Current habits:", habits);
  }, [habits]);

  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<HabitCompletion[]>({
    queryKey: ["/api/completions"],
    staleTime: 0,
    refetchInterval: 0, // No automatic refetching
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'always',
  });

  const addHabitMutation = useMutation({
    mutationFn: async (habit: InsertHabit) => {
      console.log("Adding habit:", habit);
      
      // Create an optimistic Habit for immediate UI update
      // Using type assertion to override type checking since we just need it for UI
      const optimisticHabit = {
        id: Date.now(), // Temporary ID
        name: habit.name,
        frequency: habit.frequency,
        reminderTime: habit.reminderTime || null,
        createdAt: new Date().toISOString()
      } as unknown as Habit;
      
      // Immediately update the habits list
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        return [...oldData, optimisticHabit];
      });
      
      // Make the actual API call
      const response = await apiRequest("POST", "/api/habits", habit);
      const newHabit = await response.json();
      return newHabit as Habit;
    },
    onSuccess: async (newHabit) => {
      console.log("Habit added successfully:", newHabit);
      
      // Update the habits list with the real habit (replacing our optimistic one)
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        // Remove our temporary habit and add the real one
        const filteredData = oldData.filter(h => typeof h.id !== 'number' || h.id < 9000000000);
        return [...filteredData, newHabit];
      });
      
      // Silently update in the background
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      setIsAddHabitModalOpen(false);
    },
    onError: (error) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.refetchQueries({ queryKey: ["/api/habits"] });
      
      toast({
        title: "Error",
        description: `Failed to add habit: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleCompletionMutation = useMutation({
    mutationFn: async (data: { habitId: number; date: string; completed: boolean }) => {
      // Before making any API calls, update the local state optimistically
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Optimistically update completions
      queryClient.setQueryData<HabitCompletion[]>(["/api/completions"], (oldCompletions = []) => {
        if (!data.completed) {
          // If unmarking, remove the completion from the cache
          return oldCompletions.filter(
            c => !(c.habitId === data.habitId && c.date === today)
          );
        } else {
          // If marking as completed, add a new completion to the cache
          const newCompletion = {
            id: Date.now(), // Temporary ID
            habitId: data.habitId,
            date: today,
            createdAt: new Date()
          };
          return [...oldCompletions, newCompletion as unknown as HabitCompletion];
        }
      });
      
      // Also update stats optimistically
      queryClient.setQueryData<HabitStats>(["/api/stats"], (oldStats = {
        completionRate: 0,
        completionRateChange: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        totalCompletionsChange: 0
      }) => {
        const delta = data.completed ? 1 : -1;
        return {
          ...oldStats,
          completionRate: Math.max(0, oldStats.completionRate + (delta * 5)),
          totalCompletions: Math.max(0, oldStats.totalCompletions + delta)
        };
      });
      
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
      console.log("Toggle completion success");
      
      // Silently update the queries in the background
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // No need to refetch immediately since we've already updated the UI optimistically
    },
    onError: (error) => {
      // On error, invalidate all queries to get back to the correct state
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
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
      console.log(`Deleting habit ${habitId}`);
      
      // Optimistically update the habits cache
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        return oldData.filter(habit => habit.id !== habitId);
      });
      
      // Also update completions optimistically
      queryClient.setQueryData<HabitCompletion[]>(["/api/completions"], (oldCompletions = []) => {
        return oldCompletions.filter(c => c.habitId !== habitId);
      });
      
      // Make the actual API call
      return await apiRequest("DELETE", `/api/habits/${habitId}`);
    },
    onSuccess: (_, habitId) => {
      console.log(`Successfully deleted habit ${habitId}`);
      
      // Silently update data in background
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      // On error, revert our optimistic updates
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Force refetch to correct data
      queryClient.refetchQueries({ queryKey: ["/api/habits"] });
      queryClient.refetchQueries({ queryKey: ["/api/completions"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats"] });
      
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
    refetchInterval: 0, // No automatic refetching
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'always'
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
