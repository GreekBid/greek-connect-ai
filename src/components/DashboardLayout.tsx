import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, Star, BarChart3, MessageSquare, Brain, ClipboardList, Settings, LogOut, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChapterUnreadCounts } from "@/hooks/useUnreadCounts";
import SupportFooter from "@/components/SupportFooter";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, badgeKey: null },
  { title: "Rushee Profiles", url: "/dashboard/profiles", icon: Users, badgeKey: null },
  { title: "Events", url: "/dashboard/events", icon: Calendar, badgeKey: null },
  { title: "Rankings", url: "/dashboard/rankings", icon: Star, badgeKey: null },
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare, badgeKey: null },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, badgeKey: null },
];

const toolsNav = [
  { title: "AI Coach", url: "/dashboard/ai-coach", icon: Brain, badgeKey: null },
  { title: "Bid Management", url: "/dashboard/bids", icon: ClipboardList, badgeKey: "pendingBids" as const },
  { title: "Members", url: "/dashboard/members", icon: UserPlus, badgeKey: null },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, badgeKey: null },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const location = useLocation();
  const counts = useChapterUnreadCounts();

  const renderNavItems = (items: typeof mainNav) =>
    items.map((item) => {
      const count = item.badgeKey ? (counts as any)[item.badgeKey] : 0;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink to={item.url} end={item.url === "/dashboard"} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium">
              <div className="relative mr-2">
                <item.icon className="h-4 w-4" />
                {count > 0 && collapsed && (
                  <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.title}</span>
                  {count > 0 && (
                    <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center">
                      {count}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <a href="/" className="p-4 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <img src="/logo.png" alt="GreekBid" className="h-14 w-auto shrink-0" />
        </a>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItems(toolsNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-background">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground font-body">Chapter Dashboard</span>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <SupportFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
