import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilesPage from "./pages/dashboard/ProfilesPage";
import EventsPage from "./pages/dashboard/EventsPage";
import RankingsPage from "./pages/dashboard/RankingsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import AICoachPage from "./pages/dashboard/AICoachPage";
import BidsPage from "./pages/dashboard/BidsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
          <Route path="/dashboard/profiles" element={<DashboardLayout><ProfilesPage /></DashboardLayout>} />
          <Route path="/dashboard/events" element={<DashboardLayout><EventsPage /></DashboardLayout>} />
          <Route path="/dashboard/rankings" element={<DashboardLayout><RankingsPage /></DashboardLayout>} />
          <Route path="/dashboard/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
          <Route path="/dashboard/messages" element={<DashboardLayout><MessagesPage /></DashboardLayout>} />
          <Route path="/dashboard/ai-coach" element={<DashboardLayout><AICoachPage /></DashboardLayout>} />
          <Route path="/dashboard/bids" element={<DashboardLayout><BidsPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
