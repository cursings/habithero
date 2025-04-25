import { useHabits } from "@/hooks/use-habits";
import { Card, CardContent } from "@/components/ui/card";
import { FlameIcon, TrendingUpIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Stats() {
  const { 
    habits, 
    isLoadingHabits, 
    isLoadingStats, 
    getHabitWeeklyProgress,
    getHabitCurrentStreak,
    stats
  } = useHabits();

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Mock data for the weekly overview - in a real app this would come from the backend
  const weeklyData = {
    "Mon": 65,
    "Tue": 80, 
    "Wed": 90, 
    "Thu": 50, 
    "Fri": 75, 
    "Sat": 40, 
    "Sun": 60
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Your Statistics</h2>
      
      {isLoadingHabits || isLoadingStats ? (
        <div className="text-center py-8">Loading statistics...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Completion Rate */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-neutral-dark/70">Completion Rate</h3>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-3xl font-semibold">
                    {stats?.completionRate || 0}%
                  </div>
                  <div className="text-secondary text-sm font-medium">
                    ↑ {stats?.completionRateChange || 0}%
                  </div>
                </div>
                <div className="mt-2">
                  <Progress value={stats?.completionRate || 0} className="h-1.5" />
                </div>
                <div className="mt-2 text-xs text-neutral-dark/70">Last 30 days</div>
              </CardContent>
            </Card>
            
            {/* Current Streak */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-neutral-dark/70">Current Streak</h3>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-3xl font-semibold text-accent">
                    {stats?.currentStreak || 0} days
                  </div>
                  <div className="flex items-center text-accent">
                    <FlameIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  Keep it up! Your best: {stats?.longestStreak || 0} days
                </div>
              </CardContent>
            </Card>
            
            {/* Total Completions */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-neutral-dark/70">Total Completions</h3>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-3xl font-semibold">
                    {stats?.totalCompletions || 0}
                  </div>
                  <div className="text-primary text-sm font-medium">
                    ↑ {stats?.totalCompletionsChange || 0}
                  </div>
                </div>
                <div className="mt-2 text-xs text-neutral-dark/70">Last 30 days</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Habit Performance */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Habit Performance</h3>
              {habits.length > 0 ? (
                <div className="space-y-4">
                  {habits.map(habit => {
                    const progress = getHabitWeeklyProgress(habit.id);
                    return (
                      <div key={habit.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{habit.name}</span>
                          <span className="text-sm">{progress}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className="h-2"
                          // Different colors based on progress
                          color={
                            progress > 75 
                              ? "bg-secondary" 
                              : progress > 40 
                                ? "bg-primary" 
                                : "bg-destructive"
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-neutral-dark/70 text-center py-4">
                  No habits to display performance data.
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Weekly Overview */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Weekly Overview</h3>
              <div className="flex justify-between items-end h-32">
                {weekDays.map(day => (
                  <div key={day} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-primary rounded-t-sm" 
                      style={{ height: `${weeklyData[day as keyof typeof weeklyData]}%` }}
                    ></div>
                    <span className="text-xs mt-1">{day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
