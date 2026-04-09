import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PendingApprovalGate from "./components/PendingApprovalGate";
import AdminViewSwitcher from "./components/AdminViewSwitcher";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilesPage from "./pages/dashboard/ProfilesPage";
import EventsPage from "./pages/dashboard/EventsPage";
import RankingsPage from "./pages/dashboard/RankingsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import AICoachPage from "./pages/dashboard/AICoachPage";
import BidsPage from "./pages/dashboard/BidsPage";
import MembersPage from "./pages/dashboard/MembersPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import RusheeLayout from "./components/RusheeLayout";
import RusheeHome from "./pages/rushee/RusheeHome";
import RusheeProfile from "./pages/rushee/RusheeProfile";
import RusheeNotes from "./pages/rushee/RusheeNotes";
import RusheeEvents from "./pages/rushee/RusheeEvents";
import RusheeMessages from "./pages/rushee/RusheeMessages";
import RusheeAICoach from "./pages/rushee/RusheeAICoach";
import RusheeBidStatus from "./pages/rushee/RusheeBidStatus";
import RusheeSettings from "./pages/rushee/RusheeSettings";
import RusheeSearchChapters from "./pages/rushee/RusheeSearchChapters";
import UnsubscribePage from "./pages/UnsubscribePage";

const queryClient = new QueryClient();

function AuthRedirect() {
  return <Landing />;
}

const ChapterRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole="chapter">
    <PendingApprovalGate>
      <DashboardLayout>{children}</DashboardLayout>
    </PendingApprovalGate>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />

            {/* Admin route */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="chapter">
                <AdminLayout><AdminDashboard /></AdminLayout>
              </ProtectedRoute>
            } />

            {/* Chapter routes */}
            <Route path="/dashboard" element={<ChapterRoute><DashboardHome /></ChapterRoute>} />
            <Route path="/dashboard/profiles" element={<ChapterRoute><ProfilesPage /></ChapterRoute>} />
            <Route path="/dashboard/events" element={<ChapterRoute><EventsPage /></ChapterRoute>} />
            <Route path="/dashboard/rankings" element={<ChapterRoute><RankingsPage /></ChapterRoute>} />
            <Route path="/dashboard/analytics" element={<ChapterRoute><AnalyticsPage /></ChapterRoute>} />
            <Route path="/dashboard/messages" element={<ChapterRoute><MessagesPage /></ChapterRoute>} />
            <Route path="/dashboard/ai-coach" element={<ChapterRoute><AICoachPage /></ChapterRoute>} />
            <Route path="/dashboard/bids" element={<ChapterRoute><BidsPage /></ChapterRoute>} />
            <Route path="/dashboard/members" element={<ChapterRoute><MembersPage /></ChapterRoute>} />
            <Route path="/dashboard/settings" element={<ChapterRoute><SettingsPage /></ChapterRoute>} />

            {/* Rushee routes */}
            <Route path="/rushee" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeHome /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/profile" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeProfile /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/notes" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeNotes /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/events" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeEvents /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/messages" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeMessages /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/ai-coach" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeAICoach /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/bid-status" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeBidStatus /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/search" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeSearchChapters /></RusheeLayout></ProtectedRoute>} />
            <Route path="/rushee/settings" element={<ProtectedRoute requiredRole="rushee"><RusheeLayout><RusheeSettings /></RusheeLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <AdminViewSwitcher />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
