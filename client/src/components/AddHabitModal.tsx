import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsertHabit } from "@shared/schema";
import { XIcon } from "lucide-react";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">Add New Habit</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Drink 2L of water"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={frequency === "Daily" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFrequency("Daily")}
                >
                  Daily
                </Button>
                <Button
                  type="button"
                  variant={frequency === "Weekly" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFrequency("Weekly")}
                >
                  Weekly
                </Button>
                <Button
                  type="button"
                  variant={frequency === "Custom" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setFrequency("Custom")}
                >
                  Custom
                </Button>
              </div>
            </div>
            
            {frequency === "Custom" && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={customDays.includes(day) ? "default" : "outline"}
                      onClick={() => toggleCustomDay(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reminder">Reminder (Optional)</Label>
              <Input
                id="reminder"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!habitName.trim() || isPending}>
              {isPending ? "Adding..." : "Add Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
