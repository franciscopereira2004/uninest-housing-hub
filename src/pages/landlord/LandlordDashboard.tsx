import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Building2, CheckCircle2, Clock, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listMyListings } from "@/lib/api/landlord-listings";

export default function LandlordDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["landlord", "listings"],
    queryFn: listMyListings
  });

  const listings = data ?? [];
  const counts = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
    suspended: listings.filter((l) => l.status === "suspended").length
  };
  const totalViews = listings.reduce((acc, l) => acc + (l.viewsCount ?? 0), 0);

  const cards = [
    { icon: Building2, label: "Anúncios", value: counts.total, tone: "text-primary" },
    { icon: CheckCircle2, label: "Aprovados", value: counts.approved, tone: "text-emerald-600" },
    { icon: Clock, label: "Pendentes", value: counts.pending, tone: "text-amber-600" },
    { icon: AlertCircle, label: "Rejeitados", value: counts.rejected, tone: "text-rose-600" },
    { icon: Eye, label: "Visualizações", value: totalViews, tone: "text-indigo-600" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Bem-vindo ao teu painel</h2>
          <p className="text-sm text-muted-foreground">
            Gere os teus anúncios e acompanha o estado de moderação.
          </p>
        </div>
        <Button asChild>
          <Link to="/landlord/listings/new" className="gap-2">
            <Plus className="h-4 w-4" /> Criar anúncio
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="rounded-xl border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
              <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold">
              {isLoading ? <Skeleton className="h-7 w-12" /> : value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-soft">
        <h3 className="font-display text-lg font-semibold">Como funciona a moderação</h3>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>1. Cria o anúncio com fotografias e detalhes do alojamento.</li>
          <li>2. A equipa UniNest revê o anúncio e aprova ou pede ajustes.</li>
          <li>3. Quando aprovado, o anúncio fica visível para estudantes em todo o país.</li>
        </ol>
      </div>
    </div>
  );
}
