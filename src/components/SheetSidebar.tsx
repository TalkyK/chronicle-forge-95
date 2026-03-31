import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Library, HelpCircle, LogOut, Wand2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

const mainNav = [
  { title: "Biblioteca", url: "/catalog", icon: Library },
];

const SheetSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const currentType = (() => {
    const sp = new URLSearchParams(location.search);
    const type = (sp.get("type") ?? "").toUpperCase();
    if (type === "RPG" || type === "STORY") return type as "RPG" | "STORY";
    // Rota standalone da ficha (sem querystring)
    if (location.pathname === "/rpg-sheet") return "RPG" as const;
    return null;
  })();

  const targetType = currentType === "RPG" ? "STORY" : "RPG";
  const buttonVariant = targetType === "RPG" ? "rpg" : "story";
  const buttonTo = `/sheets/new?type=${targetType}`;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: "Sessão encerrada", description: "Você saiu da conta com sucesso." });
      navigate("/login");
    } catch {
      toast({
        variant: "destructive",
        title: "Falha ao sair",
        description: "Não foi possível encerrar a sessão agora.",
      });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-display text-sm tracking-wider text-sidebar-foreground">
              ROLL & TALE
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {/* Cabeçalho (padrão) */}
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
                <p className="text-[11px] text-muted-foreground font-body truncate">
                  Grande Mestre do Arquivo
                </p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size={collapsed ? "default" : "lg"}
                    className={
                      !collapsed
                        ? "mx-4 mt-1 border-l-4 border-primary bg-transparent text-primary font-heading tracking-wide hover:bg-sidebar-accent hover:text-primary"
                        : ""
                    }
                  >
                    <Link to={item.url}>
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
            <Button variant={buttonVariant} size="lg" className="w-full gap-2" asChild>
              <Link to={buttonTo}>
                <Wand2 className="w-4 h-4" />
                Girar a Moeda
              </Link>
            </Button>

          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 overflow-x-hidden">
        <Separator className="mb-3" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/settings?panel=conta"
                className="flex items-center gap-2 px-3 py-2 text-sm font-body text-muted-foreground hover:text-sidebar-foreground w-full"
              >
                <HelpCircle className="w-4 h-4" />
                {!collapsed && <span>Support</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-body text-muted-foreground hover:text-destructive w-full"
              >
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
