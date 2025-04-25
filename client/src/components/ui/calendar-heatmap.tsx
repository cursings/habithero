import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { HabitCompletion } from "@shared/schema";
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  addMonths, 
  subMonths,
  isSameDay,
  startOfWeek,
  addDays
} from "date-fns";

interface CalendarHeatmapProps {
  completions: HabitCompletion[];
  selectedHabitId: number | null;
}

export function CalendarHeatmap({ completions, selectedHabitId }: CalendarHeatmapProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    
    // Create an array of 42 days (6 weeks) to ensure a complete calendar grid
    const daysArray = [];
    for (let i = 0; i < 42; i++) {
      daysArray.push(addDays(calendarStart, i));
    }
    
    return daysArray;
  }, [currentMonth]);
  
  // Use more unique day identifiers to avoid duplicate keys
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const getHabitDotsForDay = (date: Date) => {
    // Filter completions for the selected date and habit (if a habit is selected)
    const dateStr = format(date, "yyyy-MM-dd");
    
    const dayCompletions = completions.filter(completion => {
      if (selectedHabitId) {
        return completion.date === dateStr && completion.habitId === selectedHabitId;
      }
      return completion.date === dateStr;
    });
    
    return dayCompletions;
  };
  
  const getDateClass = (date: Date) => {
    const today = new Date();
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    
    if (isSameDay(date, today)) {
      return "bg-primary/10 border-primary";
    }
    if (!isCurrentMonth) {
      return "opacity-30";
    }
    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral p-4 md:p-6">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {/* Days of Week */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-medium p-2">
            {day.charAt(0)}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((day, i) => (
          <div key={i} className="aspect-square border border-neutral rounded-md p-1">
            <div className={`h-full rounded-md border flex flex-col ${getDateClass(day)}`}>
              <span className="text-xs p-1">
                {format(day, "d")}
              </span>
              <div className="flex flex-wrap gap-1 p-1">
                {getHabitDotsForDay(day).map((completion) => (
                  <div 
                    key={`${completion.id}-${completion.habitId}-${completion.date}`}
                    className="w-2 h-2 rounded-full bg-secondary"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-secondary mr-1"></div>
          <span className="text-sm">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-md bg-primary/10 border border-primary mr-1"></div>
          <span className="text-sm">Current Day</span>
        </div>
      </div>
    </div>
  );
}
