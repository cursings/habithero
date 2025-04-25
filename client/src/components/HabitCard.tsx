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
    <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral transition-all hover:shadow-md">
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium text-lg">{habit.name}</h3>
          <p className="text-sm text-neutral-dark/70">{habit.frequency}</p>
        </div>
        <div>
          <button
            onClick={onToggleCompletion}
            disabled={isPending}
            className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
              isCompletedToday 
                ? "bg-secondary text-white" 
                : "bg-white border border-neutral text-neutral-dark"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isCompletedToday ? (
              <CheckIcon className="h-6 w-6" />
            ) : (
              <span>Done</span>
            )}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Progress this week</span>
          <span className="text-sm text-neutral-dark/70">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-neutral rounded-full">
          <div 
            className="h-2 bg-primary rounded-full" 
            style={{ width: `${weeklyProgress}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-3 flex justify-between">
        {streak > 0 && (
          <div className="flex items-center">
            <FlameIcon className="h-5 w-5 text-accent" />
            <span className="ml-1 text-sm font-medium text-accent">
              {streak} day streak
            </span>
          </div>
        )}
        <span className="text-xs text-neutral-dark/70">
          {lastCompleted !== "Never" && `Last completed: ${lastCompleted}`}
        </span>
      </div>
    </div>
  );
}
