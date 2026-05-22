import { Link } from "react-router-dom";
import { Heart, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/ListingCard";
import { StatusBadge } from "@/components/listings/StatusBadge";
import { useFavourites } from "@/hooks/use-favourites";

export default function SavedListings() {
  const { favourites, isLoading } = useFavourites();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Anúncios guardados</h2>
        <p className="text-sm text-muted-foreground">
          Os anúncios que marcaste com o coração aparecem aqui.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-[360px] animate-pulse rounded-2xl border bg-muted/50" />
          ))}
        </div>
      ) : favourites.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/40 p-12 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-display text-lg font-semibold">Ainda não guardaste nenhum anúncio</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Carrega no coração de qualquer anúncio para o guardares aqui.
          </p>
          <Button asChild className="mt-4">
            <Link to="/search">
              <SearchIcon className="h-4 w-4" /> Pesquisar alojamentos
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favourites.map((f) => (
            <div key={f.favouriteId} className="relative">
              <ListingCard listing={f.listing} />
              {f.listing.status !== "approved" && (
                <div className="absolute left-3 bottom-3 z-10 flex items-center gap-2 rounded-full bg-background/95 px-2 py-1 shadow-soft">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Estado:
                  </span>
                  <StatusBadge status={f.listing.status} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
