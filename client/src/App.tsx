import { useState } from "react";
import { 
  PlusIcon, 
  CheckCircle2, 
  Trophy, 
  CalendarCheck, 
  BarChart2, 
  Trash2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Components
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { AddHabitModal } from "@/components/AddHabitModal";
import { Card } from "@/components/ui/card";

// Hooks
import { useHabits } from "@/hooks/use-habits";

function App() {
  const { 
    habits, 
    isLoadingHabits, 
    isAddHabitModalOpen, 
    setIsAddHabitModalOpen, 
    addHabit, 
    isPendingAddHabit,
    toggleCompletion,
    isPendingToggleCompletion,
    deleteHabit,
    isPendingDeleteHabit,
    isHabitCompletedToday,
    getHabitCurrentStreak,
    getHabitWeeklyProgress,
    getLastCompletedText,
    stats
  } = useHabits();

  // Handler for toggling habit completion
  const handleToggleCompletion = (habitId: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const currentlyCompleted = isHabitCompletedToday(habitId);
    
    // Toggle the completion status
    toggleCompletion({
      habitId,
      date: today,
      completed: !currentlyCompleted
    });
  };
  
  // Handler for deleting a habit
  const handleDeleteHabit = (habitId: number) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(habitId);
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="habit-tracker-theme">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-7 w-7 text-primary dark:text-purple-400" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 dark:from-purple-400 dark:to-indigo-300 text-transparent bg-clip-text">
                Habit Tracker
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                onClick={() => setIsAddHabitModalOpen(true)}
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90 text-white transition-all duration-300 gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Habit</span>
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
          {/* Stats Cards */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4 border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-all rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Habits</p>
                    <p className="text-xl font-bold dark:text-white">{habits?.length || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-all rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <BarChart2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                    <p className="text-xl font-bold dark:text-white">{stats.completionRate}%</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-all rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Best Streak</p>
                    <p className="text-xl font-bold dark:text-white">{stats.longestStreak} days</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-none bg-white dark:bg-gray-800 shadow-sm hover:shadow transition-all rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                    <CalendarCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
                    <p className="text-xl font-bold dark:text-white">{stats.currentStreak} days</p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
          
          {/* Habits List */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
              <span>My Habits</span>
              <span className="ml-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-gray-600 dark:text-gray-300">
                {habits?.length || 0}
              </span>
            </h2>
            
            <div className="space-y-4">
              <AnimatePresence>
                {isLoadingHabits ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
                      <div className="flex justify-between">
                        <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                      <div className="mt-4 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="mt-3 flex justify-between">
                        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                  ))
                ) : habits && habits.length > 0 ? (
                  habits.map(habit => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary">{habit.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{habit.frequency}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 h-8 w-8 transition-colors"
                              onClick={() => handleDeleteHabit(habit.id)}
                              disabled={isPendingDeleteHabit}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleToggleCompletion(habit.id)}
                              disabled={isPendingToggleCompletion}
                              variant={isHabitCompletedToday(habit.id) ? "default" : "outline"}
                              size="icon"
                              className={`rounded-full h-10 w-10 transition-all duration-300 ${
                                isHabitCompletedToday(habit.id) 
                                  ? "bg-green-500 hover:bg-green-600 text-white border-0" 
                                  : "border-2 border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary"
                              }`}
                            >
                              {isHabitCompletedToday(habit.id) ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <div className="h-5 w-5 rounded-full" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Weekly progress</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{getHabitWeeklyProgress(habit.id) || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-2 bg-primary dark:bg-purple-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${getHabitWeeklyProgress(habit.id) || 0}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center flex-wrap gap-2">
                          {getHabitCurrentStreak(habit.id) > 0 && (
                            <div className="flex items-center text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full">
                              <Trophy className="h-3 w-3 mr-1" />
                              {getHabitCurrentStreak(habit.id)} day streak
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                            Last completed: {getLastCompletedText(habit.id)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-full mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-primary dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No habits yet</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      Start by adding your first habit to track
                    </p>
                    <Button
                      className="mt-6 gap-2 rounded-full bg-primary hover:bg-primary/90 text-white"
                      onClick={() => setIsAddHabitModalOpen(true)}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Your First Habit
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
        
        {/* Add Habit Modal */}
        <AddHabitModal
          isOpen={isAddHabitModalOpen}
          onClose={() => setIsAddHabitModalOpen(false)}
          onAddHabit={addHabit}
          isPending={isPendingAddHabit}
        />
        
        {/* Bottom Add Button for Mobile */}
        <div className="md:hidden fixed bottom-8 right-8">
          <Button
            onClick={() => setIsAddHabitModalOpen(true)}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
