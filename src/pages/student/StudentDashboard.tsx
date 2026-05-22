import { Link } from "react-router-dom";
import { Heart, MessageSquare, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavourites } from "@/hooks/use-favourites";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { favourites, isLoading } = useFavourites();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Olá, {user?.name.split(" ")[0]} 👋</h2>
        <p className="text-sm text-muted-foreground">
          Encontra o teu próximo alojamento e acompanha aqui os que guardaste.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Guardados</span>
            <Heart className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 font-display text-2xl font-semibold">
            {isLoading ? <Skeleton className="h-7 w-12" /> : favourites.length}
          </div>
          <Button asChild variant="ghost" size="sm" className="mt-3 px-0">
            <Link to="/student/saved">Ver lista →</Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Mensagens</span>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 font-display text-2xl font-semibold text-muted-foreground">—</div>
          <p className="mt-1 text-xs text-muted-foreground">Disponível em breve.</p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Pesquisar</span>
            <SearchIcon className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Descobre quartos, studios e apartamentos perto da tua universidade.
          </p>
          <Button asChild size="sm" className="mt-3">
            <Link to="/search">Pesquisar agora</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="font-display text-lg font-semibold">Dicas de segurança</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Só anúncios aprovados pela equipa UniNest aparecem na pesquisa.</li>
          <li>• Contacta sempre os senhorios pelo sistema de mensagens interno.</li>
          <li>• Se algo te parecer suspeito, usa o botão "Denunciar anúncio".</li>
        </ul>
      </div>
    </div>
  );
}
