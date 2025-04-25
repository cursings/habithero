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
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-border dark:border-gray-700 transition-colors hover:shadow-md dark:text-gray-100"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg dark:text-white">{habit.name}</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-300">{habit.frequency}</p>
        </div>
        <Button
          onClick={onToggleCompletion}
          disabled={isPending}
          variant={isCompletedToday ? "default" : "secondary"}
          size="icon"
          className="w-10 h-10 rounded-full"
          aria-label={isCompletedToday ? "Mark as not completed" : "Mark as completed"}
        >
          {isCompletedToday ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <div className="w-4 h-4 border-2 border-primary dark:border-white rounded-full" />
          )}
        </Button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-foreground dark:text-gray-300">Weekly progress</span>
          <span className="text-xs font-bold dark:text-white">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-2 bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${weeklyProgress || 0}%` }}
          />
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        {streak > 0 ? (
          <div className="flex items-center px-3 py-1 bg-secondary/50 dark:bg-gray-700 rounded-full">
            <FlameIcon className="h-4 w-4 text-primary dark:text-orange-400" />
            <span className="ml-1 text-xs font-bold dark:text-white">
              {streak} day streak
            </span>
          </div>
        ) : (
          <div></div>  
        )}
        
        {isCompletedToday && (
          <span className="text-xs text-secondary-foreground dark:text-white font-medium px-3 py-1 bg-secondary/50 dark:bg-gray-700 rounded-full">
            Completed
          </span>
        )}
      </div>
    </motion.div>
  );
}
