import { NavLink, Navigate, Outlet } from "react-router-dom";
import { Building2, Clock, Flag, Loader2, UserCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOpenReports } from "@/hooks/use-open-reports";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

const navItems: Array<{ to: string; label: string; icon: typeof Users; enabled: boolean; end?: boolean }> = [
  { to: "/admin/listings/pending", label: "Pendentes", icon: Clock, enabled: true },
  { to: "/admin/listings", label: "Todos os anúncios", icon: Building2, enabled: true, end: true },
  { to: "/admin/users", label: "Utilizadores", icon: Users, enabled: true },
  { to: "/admin/reports", label: "Denúncias", icon: Flag, enabled: true },
  { to: "/admin/profile", label: "Perfil", icon: UserCircle, enabled: true }
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const openReports = useOpenReports();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden md:h-[calc(100vh-4rem)]">
        <aside className="hidden h-full w-72 shrink-0 border-r border-border/70 bg-background/95 md:flex md:flex-col">
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map(({ to, label, icon: Icon, enabled, end }) => {
              const showBadge = enabled && to === "/admin/reports" && openReports > 0;
              return enabled ? (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4 transition-transform group-hover:scale-105" />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-white"
                      aria-label={`${openReports} denúncias por rever`}
                    >
                      {openReports > 99 ? "99+" : openReports}
                    </span>
                  )}
                </NavLink>
              ) : (
                <div
                  key={to}
                  className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/70"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Em breve
                  </span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-border/70 p-4 text-xs text-muted-foreground">
            <div className="rounded-xl border border-border/70 bg-muted/30 p-3">
              <div className="font-medium text-foreground">{user.name}</div>
              <div className="mt-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Administrador
              </div>
              <div className="mt-2 truncate">{user.email}</div>
            </div>
          </div>
        </aside>

        <main className="h-full min-h-0 flex-1 overflow-y-auto overscroll-y-none p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
