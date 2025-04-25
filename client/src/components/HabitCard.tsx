import { Habit } from "@shared/schema";
import { format } from "date-fns";
import { CheckIcon, FlameIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      className="bg-white dark:bg-card rounded-xl p-5 shadow-sm border border-border transition-colors hover:shadow-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{habit.name}</h3>
          <p className="text-sm text-muted-foreground">{habit.frequency}</p>
        </div>
        <motion.button
          onClick={onToggleCompletion}
          disabled={isPending}
          whileTap={{ scale: 0.9 }}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-all ${
            isCompletedToday 
              ? "bg-primary text-white" 
              : "bg-secondary text-primary"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isCompletedToday ? "Mark as not completed" : "Mark as completed"}
        >
          <AnimatePresence mode="wait">
            {isCompletedToday ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckIcon className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="circle"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-5 h-5 border-2 border-primary rounded-full"
              />
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-foreground">Weekly progress</span>
          <span className="text-xs font-bold">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-2 bg-primary rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${weeklyProgress}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          />
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        {streak > 0 ? (
          <div className="flex items-center px-3 py-1 bg-secondary/50 rounded-full">
            <FlameIcon className="h-4 w-4 text-primary" />
            <span className="ml-1 text-xs font-bold">
              {streak} day streak
            </span>
          </div>
        ) : (
          <div></div>  
        )}
        
        {isCompletedToday && (
          <span className="text-xs text-secondary-foreground font-medium px-3 py-1 bg-secondary/50 rounded-full">
            Completed
          </span>
        )}
      </div>
    </motion.div>
  );
}
