import { LayoutDashboardIcon, CalendarIcon, BarChartIcon, SettingsIcon, PlusIcon } from 'lucide-react';
import { Link } from "wouter";
import { useHabits } from "@/hooks/use-habits";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const { setIsAddHabitModalOpen } = useHabits();
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => setIsAddHabitModalOpen(true)}
        className="md:hidden fixed bottom-20 right-6 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-20"
      >
        <PlusIcon className="h-8 w-8" />
      </button>
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral flex justify-around p-2 z-10">
        <Link href="/">
          <a 
            onClick={() => handleTabChange('dashboard')} 
            className={`flex flex-col items-center py-1 px-3 ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-neutral-dark/70'
            }`}
          >
            <LayoutDashboardIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/calendar">
          <a 
            onClick={() => handleTabChange('calendar')} 
            className={`flex flex-col items-center py-1 px-3 ${
              activeTab === 'calendar' ? 'text-primary' : 'text-neutral-dark/70'
            }`}
          >
            <CalendarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Calendar</span>
          </a>
        </Link>
        <Link href="/stats">
          <a 
            onClick={() => handleTabChange('stats')} 
            className={`flex flex-col items-center py-1 px-3 ${
              activeTab === 'stats' ? 'text-primary' : 'text-neutral-dark/70'
            }`}
          >
            <BarChartIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Stats</span>
          </a>
        </Link>
        <Link href="/settings">
          <a 
            onClick={() => handleTabChange('settings')} 
            className={`flex flex-col items-center py-1 px-3 ${
              activeTab === 'settings' ? 'text-primary' : 'text-neutral-dark/70'
            }`}
          >
            <SettingsIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </nav>
    </>
  );
}
