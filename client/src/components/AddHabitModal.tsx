import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InsertHabit } from "@shared/schema";
import { XIcon, AlarmClock, CalendarIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
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
              <Label htmlFor="habit-name" className="text-sm font-medium dark:text-white">What habit do you want to track?</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Morning meditation"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
                className="rounded-lg border-border dark:border-gray-600 focus-visible:ring-primary"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-primary dark:text-purple-400 mr-2" />
                <Label className="text-sm font-medium dark:text-white">How often?</Label>
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
            
            <AnimatePresence>
              {frequency === "Custom" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 border border-border dark:border-gray-600 p-3 rounded-xl bg-secondary/30 dark:bg-gray-700 overflow-hidden"
                >
                  <Label className="text-sm font-medium dark:text-white">Which days?</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {days.map((day, index) => (
                      <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className={`rounded-lg ${customDays.includes(day) ? "bg-primary text-primary-foreground" : "bg-background"}`}
                          onClick={() => toggleCustomDay(day)}
                        >
                          {customDays.includes(day) && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mr-1"
                            >
                              <Check className="h-3 w-3" />
                            </motion.span>
                          )}
                          {day}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <AlarmClock className="h-5 w-5 text-primary dark:text-purple-400 mr-2" />
                <Label htmlFor="reminder" className="text-sm font-medium dark:text-white">Set a reminder? (Optional)</Label>
              </div>
              <Input
                id="reminder"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="rounded-lg border-border dark:border-gray-600"
              />
              <p className="text-xs text-muted-foreground dark:text-gray-300">We'll send you a notification at this time</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex space-x-2">
            <motion.div className="flex-1" whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleClose}
                className="w-full rounded-lg"
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div 
              className="flex-1" 
              whileHover={{ scale: 0.98 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="submit" 
                disabled={!habitName.trim() || isPending}
                className="w-full bg-primary text-primary-foreground rounded-lg"
              >
                {isPending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"
                  />
                ) : null}
                {isPending ? "Adding..." : "Create Habit"}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
