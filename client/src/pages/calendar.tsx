import { useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { CalendarHeatmap } from "@/components/ui/calendar-heatmap";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const { habits, completions, isLoadingHabits, isLoadingCompletions } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Calendar View</h2>
      
      {isLoadingHabits || isLoadingCompletions ? (
        <div className="text-center py-8">Loading calendar data...</div>
      ) : (
        <>
          <CalendarHeatmap 
            completions={completions} 
            selectedHabitId={selectedHabitId} 
          />
          
          {/* Habit Selection */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Filter by Habit</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedHabitId === null ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setSelectedHabitId(null)}
              >
                All Habits
              </Button>
              
              {habits.map(habit => (
                <Button
                  key={habit.id}
                  variant={selectedHabitId === habit.id ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setSelectedHabitId(habit.id)}
                >
                  {habit.name}
                </Button>
              ))}
              
              {habits.length === 0 && (
                <p className="text-neutral-dark/70 text-sm">
                  No habits to display. Add a habit to see it on the calendar.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
