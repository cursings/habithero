import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsertHabit } from "@shared/schema";
import { XIcon, AlarmClock, CalendarIcon, Check } from "lucide-react";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: InsertHabit) => void;
  isPending: boolean;
}

export function AddHabitModal({ isOpen, onClose, onAddHabit, isPending }: AddHabitModalProps) {
  const [habitName, setHabitName] = useState("");
  const [frequency, setFrequency] = useState<string>("Daily");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState("");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habitName.trim()) return;
    
    let frequencyValue = frequency;
    if (frequency === "Custom" && customDays.length > 0) {
      frequencyValue = customDays.join(", ");
    }
    
    console.log("Adding habit:", {
      name: habitName,
      frequency: frequencyValue,
      reminderTime: reminderTime || null
    });
    
    onAddHabit({
      name: habitName,
      frequency: frequencyValue,
      reminderTime: reminderTime || null
    });
  };

  const toggleCustomDay = (day: string) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  const handleClose = () => {
    // Reset form
    setHabitName("");
    setFrequency("Daily");
    setCustomDays([]);
    setReminderTime("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground p-4">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-bold">New Habit</DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleClose} className="text-primary-foreground hover:bg-primary/80">
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="habit-name" className="text-sm font-medium">What habit do you want to track?</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Morning meditation"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
                className="rounded-lg border-border focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                <Label className="text-sm font-medium">How often?</Label>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={`rounded-lg border-border ${frequency === "Daily" ? "bg-secondary text-primary border-primary" : ""}`}
                  onClick={() => setFrequency("Daily")}
                >
                  {frequency === "Daily" && <Check className="h-4 w-4 mr-1" />}
                  Daily
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`rounded-lg border-border ${frequency === "Weekly" ? "bg-secondary text-primary border-primary" : ""}`}
                  onClick={() => setFrequency("Weekly")}
                >
                  {frequency === "Weekly" && <Check className="h-4 w-4 mr-1" />}
                  Weekly
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`rounded-lg border-border ${frequency === "Custom" ? "bg-secondary text-primary border-primary" : ""}`}
                  onClick={() => setFrequency("Custom")}
                >
                  {frequency === "Custom" && <Check className="h-4 w-4 mr-1" />}
                  Custom
                </Button>
              </div>
            </div>
            
            {frequency === "Custom" && (
              <div className="space-y-2 border border-border p-3 rounded-xl bg-secondary/30">
                <Label className="text-sm font-medium">Which days?</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {days.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`rounded-lg ${customDays.includes(day) ? "bg-primary text-primary-foreground" : "bg-background"}`}
                      onClick={() => toggleCustomDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center">
                <AlarmClock className="h-5 w-5 text-primary mr-2" />
                <Label htmlFor="reminder" className="text-sm font-medium">Set a reminder? (Optional)</Label>
              </div>
              <Input
                id="reminder"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-lg border-border"
              />
              <p className="text-xs text-muted-foreground">We'll send you a notification at this time</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleClose}
              className="flex-1 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!habitName.trim() || isPending}
              className="flex-1 bg-primary text-primary-foreground rounded-lg"
            >
              {isPending ? "Adding..." : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
