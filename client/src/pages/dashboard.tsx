import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitModal } from "@/components/AddHabitModal";
import { PlusIcon, TrophyIcon, TargetIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const {
    habits,
    isLoadingHabits,
    isAddHabitModalOpen,
    setIsAddHabitModalOpen,
    addHabit,
    isPendingAddHabit,
    toggleCompletion,
    isPendingToggleCompletion,
    isHabitCompletedToday,
    getHabitCurrentStreak,
    getHabitWeeklyProgress,
    getLastCompletedText,
    stats
  } = useHabits();

  // Removed celebration animation as requested

  // Handler for toggling habit completion
  const handleToggleCompletion = (habitId: number) => {
    // Get today's date in the format expected by the API
    const today = format(new Date(), "yyyy-MM-dd");
    
    // Check if the habit is currently completed today
    const currentlyCompleted = isHabitCompletedToday(habitId);
    
    // Toggle to the opposite state
    console.log(`Toggling habit ${habitId} from ${currentlyCompleted ? "completed" : "not completed"} to ${!currentlyCompleted ? "completed" : "not completed"}`);
    
    // Use setTimeout to ensure React has time to process the click event fully
    setTimeout(() => {
      // Call the toggle function with the new state
      toggleCompletion({
        habitId,
        date: today,
        completed: !currentlyCompleted
      });
    }, 10);
  };

  return (
    <div className="pb-20 max-w-3xl mx-auto">
      {/* App Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Habit Tracker</h1>
          <p className="text-sm text-muted-foreground dark:text-gray-300">Track your daily habits and build consistency</p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddHabitModalOpen(true)}
          className="bg-primary rounded-full gap-1"
          data-add-habit-button
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 rounded-xl bg-secondary/50 dark:bg-gray-800 border-none dark:border dark:border-gray-700">
          <div className="flex flex-col items-center">
            <TrophyIcon className="h-5 w-5 text-primary dark:text-purple-400 mb-1" />
            <p className="text-xs text-muted-foreground dark:text-gray-300">Current Streak</p>
            <p className="text-xl font-bold dark:text-white">{stats.currentStreak} days</p>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-secondary/50 dark:bg-gray-800 border-none dark:border dark:border-gray-700">
          <div className="flex flex-col items-center">
            <TargetIcon className="h-5 w-5 text-primary dark:text-purple-400 mb-1" />
            <p className="text-xs text-muted-foreground dark:text-gray-300">Completion Rate</p>
            <p className="text-xl font-bold dark:text-white">{stats.completionRate}%</p>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-secondary/50 dark:bg-gray-800 border-none dark:border dark:border-gray-700">
          <div className="flex flex-col items-center">
            <CalendarIcon className="h-5 w-5 text-primary dark:text-purple-400 mb-1" />
            <p className="text-xs text-muted-foreground dark:text-gray-300">Total Habits</p>
            <p className="text-xl font-bold dark:text-white">{habits ? habits.length : 0}</p>
          </div>
        </Card>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {isLoadingHabits ? (
          // Loading state
          <div className="text-center py-8 dark:text-white">Loading habits...</div>
        ) : habits && habits.length > 0 ? (
          // Map through habits
          habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompletedToday={isHabitCompletedToday(habit.id)}
              streak={getHabitCurrentStreak(habit.id)}
              weeklyProgress={getHabitWeeklyProgress(habit.id)}
              lastCompleted={getLastCompletedText(habit.id)}
              onToggleCompletion={() => handleToggleCompletion(habit.id)}
              isPending={isPendingToggleCompletion}
            />
          ))
        ) : (
          // Empty state
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-neutral dark:border-gray-700 dark:text-white">
            <div className="w-16 h-16 bg-secondary/50 dark:bg-gray-700 flex items-center justify-center rounded-full mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-primary dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold dark:text-white">No habits yet</h3>
            <p className="mt-2 text-muted-foreground dark:text-gray-300">
              Start adding habits to track your progress
            </p>
            <Button
              className="mt-6 bg-primary rounded-full text-white"
              onClick={() => setIsAddHabitModalOpen(true)}
              data-add-habit-button
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Habit
            </Button>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onAddHabit={addHabit}
        isPending={isPendingAddHabit}
      />
      
      {/* Celebration Animation removed as requested */}
    </div>
  );
}
