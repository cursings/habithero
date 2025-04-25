import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { PlusIcon } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Stats from "@/pages/stats";
import Settings from "@/pages/settings";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import NotFound from "@/pages/not-found";

// Floating Action Button for mobile users
function FloatingActionButton() {
  return (
    <button
      onClick={() => {
        const dashboardComponent = document.querySelector('[data-add-habit-button]');
        if (dashboardComponent) {
          (dashboardComponent as HTMLButtonElement).click();
        }
      }}
      className="md:hidden fixed right-6 bottom-24 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50"
      aria-label="Add new habit"
    >
      <PlusIcon className="h-7 w-7" />
    </button>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Get stored route or default to dashboard
    const storedTab = localStorage.getItem("activeTab");
    return storedTab || "dashboard";
  });

  useEffect(() => {
    // Store active tab in localStorage
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <Switch>
            <Route path="/">
              <Dashboard setActiveTab={setActiveTab} />
            </Route>
            <Route path="/calendar">
              <Calendar />
            </Route>
            <Route path="/stats">
              <Stats />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </main>
        
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <FloatingActionButton />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
