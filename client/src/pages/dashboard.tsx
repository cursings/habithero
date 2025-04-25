import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitModal } from "@/components/AddHabitModal";
import { PlusIcon, TrophyIcon, TargetIcon, CalendarIcon, CheckIcon } from "lucide-react";
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
    <div className="pb-20 max-w-5xl mx-auto">
      {/* App Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center">
            <CheckIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-purple-300">Habit Tracker</h1>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAddHabitModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full gap-1"
          data-add-habit-button
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4 rounded-lg bg-slate-900 border border-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-900/30 p-2 mr-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <CheckIcon className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Habits</p>
              <p className="text-xl font-bold text-white">{habits ? habits.length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-lg bg-slate-900 border border-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-green-900/30 p-2 mr-3">
              <div className="h-8 w-8 rounded-full bg-green-600/20 flex items-center justify-center">
                <TargetIcon className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Completion</p>
              <p className="text-xl font-bold text-white">{stats.completionRate}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-lg bg-slate-900 border border-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-900/30 p-2 mr-3">
              <div className="h-8 w-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                <TrophyIcon className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Best Streak</p>
              <p className="text-xl font-bold text-white">{stats.longestStreak} days</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-lg bg-slate-900 border border-gray-800">
          <div className="flex items-center">
            <div className="rounded-full bg-amber-900/30 p-2 mr-3">
              <div className="h-8 w-8 rounded-full bg-amber-600/20 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Current Streak</p>
              <p className="text-xl font-bold text-white">{stats.currentStreak} days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Habits List */}
      <div>
        {isLoadingHabits ? (
          // Loading state
          <div className="text-center py-8 dark:text-white">Loading habits...</div>
        ) : habits && habits.length > 0 ? (
          // Display habits in a 2-column grid layout
          <div className="grid grid-cols-2 gap-4">
            {habits.map(habit => (
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
            ))}
          </div>
        ) : (
          // Empty state
          <div className="bg-slate-900 rounded-lg p-8 text-center border border-gray-800">
            <div className="w-16 h-16 bg-purple-900/30 flex items-center justify-center rounded-full mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">No habits yet</h3>
            <p className="mt-2 text-gray-400">
              Start adding habits to track your progress
            </p>
            <Button
              className="mt-6 bg-purple-600 hover:bg-purple-700 rounded-full text-white"
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
