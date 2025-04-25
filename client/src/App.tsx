import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Stats from "@/pages/stats";
import Settings from "@/pages/settings";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import NotFound from "@/pages/not-found";

function App() {
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
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-light text-neutral-dark">
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
  );
}

export default App;
