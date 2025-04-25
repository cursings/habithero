import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [dailyReminders, setDailyReminders] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("••••••••");

  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data is being exported as CSV",
    });
  };

  const handleConnectCalendar = () => {
    toast({
      title: "Not available",
      description: "Calendar integration is not available yet",
    });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Daily Reminders</h4>
                  <p className="text-sm text-neutral-dark/70">
                    Receive a daily reminder to complete your habits
                  </p>
                </div>
                <Switch 
                  checked={dailyReminders}
                  onCheckedChange={setDailyReminders}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Report</h4>
                  <p className="text-sm text-neutral-dark/70">
                    Get a weekly summary of your habit progress
                  </p>
                </div>
                <Switch 
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                />
              </div>
              
              <div className="border-t border-neutral pt-4">
                <h4 className="font-medium mb-2">Reminder Time</h4>
                <Select defaultValue={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Data Export */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Data & Exports</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-neutral-dark/70 mb-3">
                  Download your habit tracking data
                </p>
                <Button variant="outline" onClick={handleExportData}>
                  Export as CSV
                </Button>
              </div>
              
              <div className="border-t border-neutral pt-4">
                <h4 className="font-medium">Calendar Integration</h4>
                <p className="text-sm text-neutral-dark/70 mb-3">
                  Connect with your calendar app
                </p>
                <Button variant="outline" onClick={handleConnectCalendar}>
                  <CalendarIcon className="h-5 w-5 mr-2 text-neutral-dark/70" />
                  Connect Google Calendar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Account</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="border-t border-neutral pt-4">
                <Button onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
