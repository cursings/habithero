import { Habit } from "@shared/schema";
import { format } from "date-fns";
import { CheckIcon, Trash2Icon } from "lucide-react";
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
    <div className="bg-slate-900 rounded-xl p-5 shadow-md border border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-white">{habit.name}</h3>
          <p className="text-xs text-gray-400">{habit.frequency}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-300"
          aria-label="Delete habit"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4">
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
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-gray-400">
          {streak > 0 ? (
            <span>{streak} day streak</span>
          ) : (
            <span>0 day streak</span>
          )}
        </div>
        
        <Button
          onClick={onToggleCompletion}
          disabled={isPending}
          size="sm"
          className={isCompletedToday ? 
            "bg-purple-600 hover:bg-purple-700 text-white" : 
            "bg-transparent border border-purple-600 text-purple-500 hover:bg-purple-500/10"
          }
        >
          {isCompletedToday ? (
            <><CheckIcon className="h-3.5 w-3.5 mr-1.5" /> Complete</>
          ) : (
            "Complete"
          )}
        </Button>
      </div>
    </div>
  );
}
