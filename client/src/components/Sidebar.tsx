import { Button } from "@/components/ui/button";
import { PlusIcon, LayoutDashboardIcon, CalendarIcon, BarChartIcon, SettingsIcon, ClipboardListIcon } from 'lucide-react';
import { Link } from "wouter";
import { useHabits } from "@/hooks/use-habits";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { setIsAddHabitModalOpen } = useHabits();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral p-4 h-screen sticky top-0">
      <div className="flex items-center mb-8 mt-2">
        <ClipboardListIcon className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-semibold ml-2">Habit Tracker</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <div 
                onClick={() => handleTabChange('dashboard')} 
                className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-neutral-light'
                }`}
              >
                <LayoutDashboardIcon className="h-5 w-5 mr-2" />
                Dashboard
              </div>
            </Link>
          </li>
          <li>
            <Link href="/calendar">
              <div 
                onClick={() => handleTabChange('calendar')} 
                className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'calendar' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-neutral-light'
                }`}
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar
              </div>
            </Link>
          </li>
          <li>
            <Link href="/stats">
              <div 
                onClick={() => handleTabChange('stats')} 
                className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'stats' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-neutral-light'
                }`}
              >
                <BarChartIcon className="h-5 w-5 mr-2" />
                Stats
              </div>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <div 
                onClick={() => handleTabChange('settings')} 
                className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-neutral-light'
                }`}
              >
                <SettingsIcon className="h-5 w-5 mr-2" />
                Settings
              </div>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-neutral">
        <Button 
          className="w-full flex items-center justify-center" 
          onClick={() => setIsAddHabitModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Habit
        </Button>
      </div>
    </aside>
  );
}
