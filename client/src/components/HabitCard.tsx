import { Habit } from "@shared/schema";
import { format } from "date-fns";
import { CheckIcon, FlameIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  streak: number;
  weeklyProgress: number;
  lastCompleted: string;
  onToggleCompletion: () => void;
  isPending: boolean;
}

export function HabitCard({ 
  habit, 
  isCompletedToday, 
  streak, 
  weeklyProgress, 
  lastCompleted,
  onToggleCompletion,
  isPending
}: HabitCardProps) {
  return (
    <motion.div 
      className="bg-slate-900 rounded-lg p-4 shadow-md border border-gray-800 transition-colors hover:border-gray-700 dark:text-gray-100 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-base text-gray-100">{habit.name}</h3>
          <p className="text-xs text-gray-400">{habit.frequency}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-300"
            aria-label="Delete habit"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          
          <Button
            onClick={onToggleCompletion}
            disabled={isPending}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full ${isCompletedToday ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700 border-none shadow-inner shadow-purple-900/50' : 'bg-slate-700 border border-purple-600 hover:bg-slate-600'}`}
            aria-label={isCompletedToday ? "Mark as not completed" : "Mark as completed"}
          >
            {isCompletedToday ? (
              <CheckIcon className="h-4 w-4 text-white" />
            ) : null}
          </Button>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">Weekly progress</span>
          <span className="text-xs font-medium text-gray-300">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${weeklyProgress || 0}%` }}
          />
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Last completed: {lastCompleted}
      </div>
    </motion.div>
  );
}
