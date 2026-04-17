import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getCities, getListings } from "@/data/listings";
import type { SearchFilters } from "@/types";

const Search = () => {
  const [params, setParams] = useSearchParams();
  const cities = getCities();

  const filters: SearchFilters = useMemo(
    () => ({
      city: params.get("city") || undefined,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      type: (params.get("type") as SearchFilters["type"]) || "any",
      internet: params.get("internet") === "1",
      furnished: params.get("furnished") === "1",
      privateBathroom: params.get("privateBathroom") === "1",
      availableFrom: params.get("availableFrom") || undefined,
    }),
    [params],
  );

  const results = getListings(filters);

  const update = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    setParams(next, { replace: true });
  };

  const reset = () => setParams(new URLSearchParams(), { replace: true });

  return (
    <PublicLayout>
      <section className="container py-10 md:py-14">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            Pesquisa de alojamentos
          </h1>
          <p className="mt-2 text-muted-foreground">
            {results.length} {results.length === 1 ? "resultado" : "resultados"}
            {filters.city ? ` em ${filters.city}` : ""}.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters */}
          <aside className="h-fit rounded-2xl border bg-card p-6 shadow-soft lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <SlidersHorizontal className="h-4 w-4" /> Filtros
              </h2>
              <Button variant="ghost" size="sm" onClick={reset}>
                Limpar
              </Button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="f-city">Cidade</Label>
                <Input
                  id="f-city"
                  list="f-cities"
                  defaultValue={filters.city || ""}
                  onChange={(e) => update({ city: e.target.value || undefined })}
                  placeholder="Qualquer"
                />
                <datalist id="f-cities">
                  {cities.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="f-min">Preço min.</Label>
                  <Input
                    id="f-min"
                    type="number"
                    defaultValue={filters.minPrice ?? ""}
                    onChange={(e) => update({ minPrice: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="f-max">Preço max.</Label>
                  <Input
                    id="f-max"
                    type="number"
                    defaultValue={filters.maxPrice ?? ""}
                    onChange={(e) => update({ maxPrice: e.target.value || undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de imóvel</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["any", "apartment", "house", "studio"] as const).map((t) => {
                    const active = filters.type === t;
                    const labels = { any: "Todos", apartment: "Apart.", house: "Casa", studio: "Studio" } as const;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => update({ type: t === "any" ? undefined : t })}
                        className={`rounded-lg border px-3 py-2 text-sm transition-smooth ${
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {labels[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="f-from">Disponível a partir de</Label>
                <Input
                  id="f-from"
                  type="date"
                  defaultValue={filters.availableFrom || ""}
                  onChange={(e) => update({ availableFrom: e.target.value || undefined })}
                />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { key: "internet", label: "Internet incluída" },
                  { key: "furnished", label: "Mobilado" },
                  { key: "privateBathroom", label: "Casa de banho privada" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-3 text-sm">
                    <Checkbox
                      checked={Boolean(filters[key as keyof SearchFilters])}
                      onCheckedChange={(v) => update({ [key]: v ? "1" : undefined })}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/40 p-16 text-center">
                <h3 className="font-display text-xl font-semibold">Sem resultados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tenta alargar os filtros ou pesquisar noutra cidade.
                </p>
                <Button onClick={reset} className="mt-4" variant="soft">
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Search;
