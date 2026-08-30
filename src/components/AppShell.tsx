import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  BrainCircuit,
  FolderOpen,
  ShieldCheck,
  Eye,
  ScrollText,
  BarChart3,
  LogOut,
  Network,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}> = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/dashboard/troubleshooter",
    label: "AI Troubleshooter",
    icon: BrainCircuit,
    badge: "AI",
  },
  {
    to: "/dashboard/cases",
    label: "Cases",
    icon: FolderOpen,
  },
  {
    to: "/dashboard/rule-checker",
    label: "Rule Checker",
    icon: ShieldCheck,
  },
  {
    to: "/dashboard/review",
    label: "Human Review",
    icon: Eye,
  },
  {
    to: "/dashboard/responsible-ai",
    label: "Responsible AI Log",
    icon: ScrollText,
  },
  {
    to: "/dashboard/reports",
    label: "Reports",
    icon: BarChart3,
  },
];

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}) {
  const location = useLocation();
  const isActive =
    to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(to);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="gap-3"
      >
        <NavLink to={to}>
          <Icon className="size-4 shrink-0" />
          <span>{label}</span>
          {badge && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] font-medium tracking-wide uppercase"
            >
              {badge}
            </Badge>
          )}
          {!badge && isActive && (
            <ChevronRight className="ml-auto size-3 opacity-40" />
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        collapsible="icon"
        className="border-r border-border/50"
      >
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
              <Network className="size-4" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h1 className="text-sm font-semibold tracking-tight leading-none">
                NetSage AI
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide uppercase">
                Network Troubleshooter
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
              Modules
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    badge={item.badge}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              Sign out
            </span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            NetSage AI
          </span>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
