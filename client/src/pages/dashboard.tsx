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

  // Handler for toggling habit completion
  const handleToggleCompletion = (habitId: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const completed = !isHabitCompletedToday(habitId);
    
    toggleCompletion({
      habitId,
      date: today,
      completed
    });
  };

  return (
    <div className="pb-20 max-w-3xl mx-auto">
      {/* App Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <p className="text-sm text-muted-foreground">Track your daily habits and build consistency</p>
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
        <Card className="p-4 rounded-xl bg-secondary/50 border-none">
          <div className="flex flex-col items-center">
            <TrophyIcon className="h-5 w-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Longest Streak</p>
            <p className="text-xl font-bold">{stats.longestStreak} days</p>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-secondary/50 border-none">
          <div className="flex flex-col items-center">
            <TargetIcon className="h-5 w-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-xl font-bold">{stats.completionRate}%</p>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-secondary/50 border-none">
          <div className="flex flex-col items-center">
            <CalendarIcon className="h-5 w-5 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Habits</p>
            <p className="text-xl font-bold">{habits ? habits.length : 0}</p>
          </div>
        </Card>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {isLoadingHabits ? (
          // Loading state
          <div className="text-center py-8">Loading habits...</div>
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
          <div className="bg-white rounded-xl p-8 text-center border border-neutral">
            <div className="w-16 h-16 bg-secondary/50 flex items-center justify-center rounded-full mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">No habits yet</h3>
            <p className="mt-2 text-muted-foreground">
              Start adding habits to track your progress
            </p>
            <Button
              className="mt-6 bg-primary rounded-full"
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
    </div>
  );
}
