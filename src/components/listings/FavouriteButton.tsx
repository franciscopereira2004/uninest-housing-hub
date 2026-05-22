import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavourites, useToggleFavourite } from "@/hooks/use-favourites";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  listingId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function FavouriteButton({ listingId, variant = "icon", className }: Props) {
  const { user } = useAuth();
  const { idSet, isStudent } = useFavourites();
  const { toggle, isPending } = useToggleFavourite();

  // Hide for landlords/admins entirely; show for anonymous (they get a login prompt)
  if (user && user.role !== "student") return null;

  const active = isStudent && idSet.has(listingId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(listingId, active);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Remover dos favoritos" : "Guardar nos favoritos"}
        aria-pressed={active}
        disabled={isPending}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/95 text-foreground shadow-soft transition hover:scale-105",
          active && "text-rose-500",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4", active && "fill-current")} />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={cn("h-4 w-4", active && "fill-current")} />}
      {active ? "Guardado" : "Guardar"}
    </Button>
  );
}
