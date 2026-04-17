import { Link, useLocation } from "react-router-dom";
import { Home, LogIn, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Início", icon: Home },
  { to: "/search", label: "Pesquisar", icon: Search },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
            <span className="font-display text-lg font-bold">U</span>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            UniNest
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-smooth",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                Olá, <span className="font-medium text-foreground">{user.name.split(" ")[0]}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
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
