import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, LogIn, LogOut, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Início", icon: Home },
  { to: "/search", label: "Pesquisar", icon: Search },
];

const roleLabelMap = {
  student: "Estudante",
  landlord: "Senhorio",
  admin: "Administrador",
} as const;

const dashboardPathByRole = {
  student: "/student",
  landlord: "/landlord",
  admin: "/admin",
} as const;

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const firstName = user?.name.split(" ")[0];
  const roleLabel = user ? roleLabelMap[user.role] : null;

  const initials =
    user?.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") ?? "U";

  const dashboardPath = user ? dashboardPathByRole[user.role] : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 shadow-sm backdrop-blur-xl">
      <div className="container flex h-20 flex-col justify-center gap-2 py-2 md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 md:py-0">
        <div className="flex items-center justify-between md:justify-self-start">
          <a href="/" className="group flex items-center gap-2 self-start md:self-auto">
            <img
              src={logo}
              alt="UniNest logo"
              className="h-9 w-auto max-w-[150px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </a>

          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-rose-200/70 bg-rose-50/70 px-3 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-900/40"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            ) : (
              <Button asChild variant="accent" size="sm" className="rounded-full px-3">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>

        <nav className="flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1 md:w-auto md:justify-self-center md:overflow-visible md:bg-transparent md:p-0">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                  active
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-background/90 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {dashboardPath && (
            <Link
              to={dashboardPath}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                pathname.startsWith(dashboardPath)
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-background/90 hover:text-foreground",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:justify-self-end md:flex">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm sm:flex">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user.avatarUrl} alt={`Avatar de ${user.name}`} />
                  <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  Olá, <span className="font-semibold text-foreground">{firstName}</span>
                </span>
                {roleLabel && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {roleLabel}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-rose-200/70 bg-rose-50/70 px-3 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-900/40"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Link>
              </Button>
              <Button asChild variant="accent" size="sm">
                <Link to="/register">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Criar conta</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
