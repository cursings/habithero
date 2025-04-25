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
    staleTime: 0, // Always treat data as stale
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'always' // Always attempt network requests
  });

  // Log habits whenever they change
  useEffect(() => {
    console.log("Current habits:", habits);
  }, [habits]);

  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<HabitCompletion[]>({
    queryKey: ["/api/completions"],
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'always'
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
      
      // Immediately update the cache with the new habit
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        return [...oldData, newHabit];
      });
      
      // Force immediate refetch of all data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/habits"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/completions"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] })
      ]);
      
      // Ensure immediate refresh of data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/habits"] }),
        queryClient.refetchQueries({ queryKey: ["/api/stats"] }),
        queryClient.refetchQueries({ queryKey: ["/api/completions"] })
      ]);
      
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
    mutationFn: async (data: { habitId: number; date: string; completed: boolean }) => {
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
      console.log("Toggle completion success, updating cache");
      
      // Force immediate refetch - no optimistic updates to avoid type errors
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/completions"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] })
      ]);
      
      // Ensure immediate refresh of data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/habits"] }),
        queryClient.refetchQueries({ queryKey: ["/api/stats"] }),
        queryClient.refetchQueries({ queryKey: ["/api/completions"] })
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
  
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      return await apiRequest("DELETE", `/api/habits/${habitId}`);
    },
    onSuccess: async (_, habitId) => {
      console.log(`Deleting habit ${habitId} from cache`);
      
      // Optimistically update the UI by removing the habit from cache
      queryClient.setQueryData<Habit[]>(["/api/habits"], (oldData = []) => {
        return oldData.filter(habit => habit.id !== habitId);
      });
      
      // Also invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/habits"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/completions"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] })
      ]);
      
      // Ensure immediate refresh of data
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/habits"] }),
        queryClient.refetchQueries({ queryKey: ["/api/stats"] }),
        queryClient.refetchQueries({ queryKey: ["/api/completions"] })
      ]);
      
      toast({
        title: "Success",
        description: "Habit deleted successfully",
      });
    },
    onError: (error) => {
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
    refetchInterval: 5000,
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
