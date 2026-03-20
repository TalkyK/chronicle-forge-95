import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Library,
  Sparkles,
  Users,
  Lock,
  Settings,
  HelpCircle,
  LogOut,
  Wand2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { title: "Library", url: "/catalog", icon: Library },
  { title: "Active Spells", url: "#", icon: Sparkles },
  { title: "Party Chat", url: "#", icon: Users },
  { title: "The Vault", url: "#", icon: Lock },
  { title: "Settings", url: "#", icon: Settings },
];

const SheetSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-display text-sm tracking-wider text-sidebar-foreground">
              Grimoire
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* User Profile */}
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
              <Avatar className="h-9 w-9 border border-primary/30">
                <AvatarFallback className="bg-primary/20 text-primary font-heading text-xs">
                  OA
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading text-sidebar-foreground truncate">
                  Ordem dos Arcanos
                </p>
                <p className="text-xs text-muted-foreground font-body truncate">
                  Grand Archive Master
                </p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="font-heading text-xs tracking-wider text-muted-foreground uppercase">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-body transition-colors ${
                        location.pathname === item.url
                          ? "bg-sidebar-accent text-primary"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="px-4 mt-4">
            <Button variant="rpg" size="lg" className="w-full gap-2" asChild>
              <Link to="/sheets/new?type=RPG">
                <Wand2 className="w-4 h-4" />
                Summon New Ally
              </Link>
            </Button>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="mb-3" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-body text-muted-foreground hover:text-sidebar-foreground w-full">
                <HelpCircle className="w-4 h-4" />
                {!collapsed && <span>Support</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-body text-muted-foreground hover:text-destructive w-full">
                <LogOut className="w-4 h-4" />
                {!collapsed && <span>Logout</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SheetSidebar;
