import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addFavourite,
  listFavourites,
  removeFavourite,
  type FavouriteListing
} from "@/lib/api/favourites";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const QUERY_KEY = ["favourites", "me"] as const;

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function useFavourites() {
  const { user } = useAuth();
  const enabled = user?.role === "student";

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: listFavourites,
    enabled
  });

  const idSet = useMemo(
    () => new Set((query.data ?? []).map((f: FavouriteListing) => f.listing.id)),
    [query.data]
  );

  return {
    favourites: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    idSet,
    isStudent: enabled
  };
}

export function useToggleFavourite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      listingId,
      isFavourite
    }: {
      listingId: string;
      isFavourite: boolean;
    }) => {
      if (isFavourite) {
        await removeFavourite(listingId);
      } else {
        await addFavourite(listingId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao atualizar favoritos."))
  });

  return {
    toggle: (listingId: string, isFavourite: boolean) => {
      if (!user || user.role !== "student") {
        toast.info("Cria conta como estudante para guardar anúncios.");
        return;
      }
      mutation.mutate({ listingId, isFavourite });
    },
    isPending: mutation.isPending
  };
}
