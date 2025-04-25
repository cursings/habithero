import { Habit } from "@shared/schema";
import { format } from "date-fns";
import { CheckIcon, FlameIcon } from "lucide-react";

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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border transition-all hover:shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{habit.name}</h3>
          <p className="text-sm text-muted-foreground">{habit.frequency}</p>
        </div>
        <button
          onClick={onToggleCompletion}
          disabled={isPending}
          className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
            isCompletedToday 
              ? "bg-primary text-white" 
              : "bg-secondary text-primary"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isCompletedToday ? "Mark as not completed" : "Mark as completed"}
        >
          {isCompletedToday ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <span className="text-xs font-medium">Done</span>
          )}
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-muted-foreground">Weekly progress</span>
          <span className="text-xs font-bold">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-2 bg-primary rounded-full" 
            style={{ width: `${weeklyProgress}%` }}
          ></div>
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
    </div>
  );
}
