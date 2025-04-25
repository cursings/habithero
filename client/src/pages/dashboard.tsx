import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitModal } from "@/components/AddHabitModal";
import { PlusIcon, ClipboardListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    getLastCompletedText
  } = useHabits();

  const [viewMode, setViewMode] = useState("Today");
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");

  // Simple function to calculate average weekly progress
  const calculateOverallProgress = () => {
    if (habits.length === 0) return 0;
    
    const totalProgress = habits.reduce((sum, habit) => {
      return sum + getHabitWeeklyProgress(habit.id);
    }, 0);
    
    return Math.round(totalProgress / habits.length);
  };

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
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClipboardListIcon className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold ml-2">Habit Tracker</h1>
        </div>
        <Button
          size="icon"
          onClick={() => setIsAddHabitModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-semibold">Today's Habits</h2>
        <div className="mt-3 md:mt-0 flex items-center">
          <span className="text-sm mr-2">View:</span>
          <Select defaultValue={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="All Habits">All Habits</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Display */}
      <Card className="p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-neutral-dark/70">{formattedDate}</span>
            <h3 className="text-lg font-medium">Today</h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-accent">Weekly Progress</span>
            <div className="w-32 h-2 bg-neutral rounded-full mt-1">
              <div 
                className="h-2 bg-accent rounded-full" 
                style={{ width: `${calculateOverallProgress()}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1 text-neutral-dark/70">
              {calculateOverallProgress()}% complete
            </span>
          </div>
        </div>
      </Card>

      {/* Habits List */}
      <div className="space-y-4">
        {isLoadingHabits ? (
          // Loading state
          <div className="text-center py-8">Loading habits...</div>
        ) : habits.length > 0 ? (
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
          <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral text-center">
            <ClipboardListIcon className="h-12 w-12 mx-auto text-neutral-dark/30" />
            <h3 className="mt-4 text-lg font-medium">No habits yet</h3>
            <p className="mt-1 text-neutral-dark/70">
              Start adding habits to track your progress
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsAddHabitModalOpen(true)}
            >
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
    </>
  );
}
