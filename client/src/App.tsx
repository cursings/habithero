import { useState } from "react";
import { 
  PlusIcon, 
  CheckCircle2, 
  Trophy, 
  CalendarCheck, 
  BarChart2, 
  Trash2,
  CheckIcon,
  FrownIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Components
import { Button } from "@/components/ui/button";
import { AddHabitModal } from "@/components/AddHabitModal";
import { Card } from "@/components/ui/card";

// Hooks
import { useHabits } from "@/hooks/use-habits";
import { queryClient } from "@/lib/queryClient";
import { Habit, HabitCompletion } from "@shared/schema";

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

  // Handler for toggling habit completion with optimistic updates for instant reactivity
  const handleToggleCompletion = (habitId: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const currentlyCompleted = isHabitCompletedToday(habitId);
    
    // Calculate the updated weekly progress immediately
    const currentProgress = getHabitWeeklyProgress(habitId);
    const newProgress = !currentlyCompleted 
      ? Math.min(100, currentProgress + Math.round(100 / 7)) // Add progress if marking complete
      : Math.max(0, currentProgress - Math.round(100 / 7));  // Subtract progress if unmarking
      
    // Calculate the updated streak immediately
    const currentStreak = getHabitCurrentStreak(habitId);
    const newStreak = !currentlyCompleted 
      ? currentStreak + 1 // Increment streak if marking complete
      : Math.max(0, currentStreak - 1); // Decrement streak if unmarking
    
    // Optimistically update completions in the cache
    queryClient.setQueryData<HabitCompletion[]>(['/api/completions'], (oldCompletions = []) => {
      if (currentlyCompleted) {
        // If currently completed, remove the completion from cache
        return oldCompletions.filter(
          c => !(c.habitId === habitId && c.date === today)
        );
      } else {
        // If not completed, add a new completion to cache
        // Create a new object with the right shape and cast it for UI updates only
        const newCompletion = {
          id: Date.now(), // Temporary ID that will be replaced on server response
          habitId,
          date: today,
          createdAt: new Date().toISOString()
        };
        return [...oldCompletions, newCompletion as unknown as HabitCompletion];
      }
    });
    
    // Also optimistically update the stats immediately
    queryClient.setQueryData<any>(['/api/stats'], (oldStats = {
      completionRate: 0,
      completionRateChange: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      totalCompletionsChange: 0
    }) => {
      const oldCompletionCount = oldStats.totalCompletions || 0;
      const delta = currentlyCompleted ? -1 : 1; // Subtract if unmarking, add if marking
      
      return {
        ...oldStats,
        completionRate: Math.max(0, (oldStats.completionRate || 0) + (delta * 10)), // Approximate change
        totalCompletions: Math.max(0, oldCompletionCount + delta)
      };
    });
    
    // The actual API call happens in the background
    toggleCompletion({
      habitId,
      date: today,
      completed: !currentlyCompleted
    });
  };
  
  // Handler for deleting a habit with optimistic updates
  const handleDeleteHabit = (habitId: number) => {
    // Optimistically update the UI before the server response
    queryClient.setQueryData<Habit[]>(['/api/habits'], (oldHabits = []) => {
      console.log("Deleting habit", habitId, "from cache");
      return oldHabits.filter(h => h.id !== habitId);
    });
    
    // Perform the actual deletion
    deleteHabit(habitId);
  };

  return (
    <div className="min-h-screen bg-pattern transition-all duration-500 relative">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 pb-20">
          {/* Habits List */}
          <section>
            <div>
              <AnimatePresence mode="popLayout">
                {isLoadingHabits ? (
                  <div className="habit-grid" key="loading">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-700 animate-pulse">
                        <div className="flex justify-between">
                          <div className="w-1/3 h-6 bg-gray-700 rounded"></div>
                          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="mt-4 w-full h-2 bg-gray-700 rounded-full"></div>
                        <div className="mt-3 flex justify-between">
                          <div className="w-24 h-6 bg-gray-700 rounded-full"></div>
                          <div className="w-32 h-6 bg-gray-700 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : habits && habits.length > 0 ? (
                  <div className="flex flex-col" key="habits-list">
                    <div className="habit-grid">
                      {habits.map(habit => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ 
                            opacity: 0, 
                            scale: 0.8, 
                            x: -30,
                            rotate: -5,
                            transition: { duration: 0.3, ease: "easeInOut" }
                          }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <div className="bg-gray-800 rounded-xl p-5 shadow border border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10 hover:border-gray-600">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-primary">{habit.name}</h3>
                                <p className="text-sm text-gray-400">{habit.frequency}</p>
                              </div>
                              <div className="flex gap-2 items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-gray-500 hover:text-red-400 h-8 w-8 transition-colors"
                                  onClick={() => handleDeleteHabit(habit.id)}
                                  disabled={isPendingDeleteHabit}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-400">Weekly progress</span>
                                <span className="text-xs font-medium text-gray-300">{getHabitWeeklyProgress(habit.id) || 0}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden shadow">
                                <div 
                                  className="h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out shadow min-w-[4px]"
                                  style={{ width: `${Math.max(getHabitWeeklyProgress(habit.id) || 0, 1)}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-xs text-gray-400">
                                {getHabitCurrentStreak(habit.id) > 0 ? (
                                  <span>{getHabitCurrentStreak(habit.id)} day streak</span>
                                ) : (
                                  <span>0 day streak</span>
                                )}
                              </div>
                              
                              <Button
                                onClick={() => handleToggleCompletion(habit.id)}
                                disabled={isPendingToggleCompletion}
                                size="sm"
                                className={isHabitCompletedToday(habit.id) ? 
                                  "bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600 transition-all duration-200" : 
                                  "bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200"
                                }
                              >
                                {isHabitCompletedToday(habit.id) ? (
                                  <><CheckIcon className="h-3.5 w-3.5 mr-1.5 text-gray-300" /> Completed</>
                                ) : (
                                  "Complete"
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Add Habit Button - positioned at the bottom */}
                    <div className="flex justify-center mt-8 mb-4">
                      <Button
                        onClick={() => setIsAddHabitModalOpen(true)}
                        className="gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 px-6 py-3"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Habit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    key="no-habits"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700"
                  >
                    <div className="w-16 h-16 bg-gray-700 flex items-center justify-center rounded-full mx-auto mb-4">
                      <FrownIcon className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">No habits yet</h3>
                    <p className="mt-2 text-gray-400">
                      Start by adding your first habit to track
                    </p>
                    <Button
                      className="mt-6 gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 px-6"
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

      </div>
  );
}

export default App;