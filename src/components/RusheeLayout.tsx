import { ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Brain,
  User,
  LogOut,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { title: "Home", url: "/rushee", icon: LayoutDashboard },
  { title: "Events", url: "/rushee/events", icon: Calendar },
  { title: "Messages", url: "/rushee/messages", icon: MessageSquare },
  { title: "My Notes", url: "/rushee/notes", icon: StickyNote },
  { title: "AI Coach", url: "/rushee/ai-coach", icon: Brain },
  { title: "My Profile", url: "/rushee/profile", icon: User },
];

function RusheeSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <a href="/" className="p-4 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm font-display">R</span>
          </div>
          {!collapsed && <span className="text-lg font-display font-bold text-foreground">RushFlow</span>}
        </a>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/rushee"} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
