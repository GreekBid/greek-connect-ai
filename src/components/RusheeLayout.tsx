import { ReactNode, useEffect, useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Calendar, MessageSquare, Brain, User, LogOut, StickyNote, FileText, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRusheeUnreadCounts } from "@/hooks/useUnreadCounts";
import { supabase } from "@/integrations/supabase/client";

const getNav = (searchLabel: string) => [
  { title: "Home", url: "/rushee", icon: LayoutDashboard, badgeKey: null },
  { title: "Events", url: "/rushee/events", icon: Calendar, badgeKey: "events" as const },
  { title: "Messages", url: "/rushee/messages", icon: MessageSquare, badgeKey: "messages" as const },
  { title: "My Notes", url: "/rushee/notes", icon: StickyNote, badgeKey: null },
  { title: "Bid Status", url: "/rushee/bid-status", icon: FileText, badgeKey: "bids" as const },
  { title: "AI Coach", url: "/rushee/ai-coach", icon: Brain, badgeKey: null },
  { title: searchLabel, url: "/rushee/search", icon: Search, badgeKey: null },
  { title: "My Profile", url: "/rushee/profile", icon: User, badgeKey: null },
  { title: "Settings", url: "/rushee/settings", icon: Settings, badgeKey: null },
];

function RusheeSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();
  const counts = useRusheeUnreadCounts();
  const [gender, setGender] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("gender")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setGender((data as any)?.gender || "");
      });
  }, [user]);

  const searchLabel = gender === "female" ? "Search Sororities" : "Search Fraternities";
  const nav = getNav(searchLabel);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <a href="/" className="p-4 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm font-display">G</span>
          </div>
          {!collapsed && <span className="text-lg font-display font-bold text-foreground">GreekBid</span>}
        </a>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const count = item.badgeKey ? counts[item.badgeKey] : 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end={item.url === "/rushee"} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-primary font-medium">
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
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function RusheeLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RusheeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-background">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground font-body">My Rush</span>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
