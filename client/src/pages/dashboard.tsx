import { useState, useEffect } from "react";
import { useHabits } from "@/hooks/use-habits";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitModal } from "@/components/AddHabitModal";
import { PlusIcon, TrophyIcon, TargetIcon, CalendarIcon, PartyPopper, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();
  const [showCelebration, setShowCelebration] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  // Check if all habits are completed
  useEffect(() => {
    if (!habits || habits.length === 0) return;
    
    const allHabitsCompleted = habits.every(habit => isHabitCompletedToday(habit.id));
    
    if (allHabitsCompleted && !allCompleted && habits.length > 0) {
      setShowCelebration(true);
      setAllCompleted(true);
      
      // Show success toast
      toast({
        title: "Congratulations! 🎉",
        description: "You've completed all your habits for today!",
        variant: "default"
      });
      
      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
    } else if (!allHabitsCompleted) {
      setAllCompleted(false);
    }
  }, [habits, isHabitCompletedToday]);

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
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="text-xl font-bold">{stats.currentStreak} days</p>
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
      
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.5 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut" 
              }}
            >
              <div className="bg-primary/90 text-primary-foreground p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ 
                    repeat: 2,
                    duration: 1
                  }}
                >
                  <PartyPopper className="h-16 w-16 text-yellow-300" />
                </motion.div>
                <motion.h2 
                  className="text-2xl font-bold mt-4 text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: 1, duration: 0.5 }}
                >
                  All Done!
                </motion.h2>
                <p className="text-white/90 mt-2 text-center">You've completed all your habits today!</p>
                <motion.div
                  className="mt-4 bg-white rounded-full p-2"
                  animate={{ 
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    repeat: 3,
                    duration: 0.5,
                    repeatType: "reverse" 
                  }}
                >
                  <ThumbsUp className="h-6 w-6 text-primary" />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Confetti */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ 
                  top: "50%",
                  left: "50%",
                  opacity: 1
                }}
                animate={{ 
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1,
                  ease: "easeOut"
                }}
              >
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ 
                    backgroundColor: ['#FF5E5B', '#D8D8F6', '#7FC29B', '#FFDB5C'][Math.floor(Math.random() * 4)]
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
