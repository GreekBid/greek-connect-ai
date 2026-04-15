import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, LogOut, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupportFooter from "@/components/SupportFooter";

const adminNav = [
  { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <a href="/" className="p-4 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <img src="/logo.png" alt="GreekBid" className="h-8 w-auto shrink-0" />
        </a>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-primary font-medium">
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
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 gap-4 bg-background">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground font-body">Platform Administration</span>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <SupportFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
