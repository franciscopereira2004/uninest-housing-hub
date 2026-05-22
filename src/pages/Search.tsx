import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard } from "@/components/listings/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchListings, getCities, getUniversities } from "@/data/listings";
import type { Listing, PropertyType, SearchFilters } from "@/types";
import { toast } from "sonner";

const PROPERTY_TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "room", label: "Quarto" },
  { value: "apartment", label: "Apartamento" },
  { value: "studio", label: "Studio" },
  { value: "shared_house", label: "Casa partilhada" }
];

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>(getCities());
  const [universities, setUniversities] = useState<string[]>(getUniversities());

  const filters: SearchFilters = useMemo(() => {
    const typesParam = params.get("types");
    const types = typesParam
      ? (typesParam.split(",").filter(Boolean) as PropertyType[])
      : undefined;
    return {
      keyword: params.get("keyword") || undefined,
      city: params.get("city") || undefined,
      nearbyUniversity: params.get("nearbyUniversity") || undefined,
      minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
      maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
      types,
      internet: params.get("internet") === "1",
      furnished: params.get("furnished") === "1",
      billsIncluded: params.get("billsIncluded") === "1",
      contractAvailable: params.get("contractAvailable") === "1",
      bedrooms: params.get("bedrooms") ? Number(params.get("bedrooms")) : undefined,
      maxDistance: params.get("maxDistance") ? Number(params.get("maxDistance")) : undefined,
      availableFrom: params.get("availableFrom") || undefined,
      sortBy: (params.get("sortBy") as SearchFilters["sortBy"]) || undefined
    };
  }, [params]);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        const data = await fetchListings(filters);
        setResults(data);
        setCities(getCities());
        setUniversities(getUniversities());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar anúncios.");
      } finally {
        setLoading(false);
      }
    };

    void loadResults();
  }, [filters]);

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
            {loading
              ? "A carregar..."
              : `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`}
            {filters.city ? ` em ${filters.city}` : ""}.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
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
                <Label htmlFor="f-keyword">Pesquisar</Label>
                <Input
                  id="f-keyword"
                  defaultValue={filters.keyword || ""}
                  onChange={(e) => update({ keyword: e.target.value || undefined })}
                  placeholder="Palavra-chave"
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="f-university">Universidade</Label>
                <Input
                  id="f-university"
                  list="f-universities"
                  defaultValue={filters.nearbyUniversity || ""}
                  onChange={(e) => update({ nearbyUniversity: e.target.value || undefined })}
                  placeholder="Qualquer"
                />
                <datalist id="f-universities">
                  {universities.map((u) => <option key={u} value={u} />)}
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
                <p className="text-xs text-muted-foreground">
                  Seleciona um ou mais. Vazio = todos.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {PROPERTY_TYPE_OPTIONS.map((opt) => {
                    const selected = filters.types ?? [];
                    const active = selected.includes(opt.value);
                    const toggle = () => {
                      const next = active
                        ? selected.filter((t) => t !== opt.value)
                        : [...selected, opt.value];
                      update({ types: next.length > 0 ? next.join(",") : undefined });
                    };
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={toggle}
                        aria-pressed={active}
                        className={`rounded-lg border px-3 py-2 text-sm transition-smooth ${
                          active
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="f-bedrooms">Quartos mín.</Label>
                  <Input
                    id="f-bedrooms"
                    type="number"
                    min={0}
                    defaultValue={filters.bedrooms ?? ""}
                    onChange={(e) => update({ bedrooms: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="f-distance">Distância (km)</Label>
                  <Input
                    id="f-distance"
                    type="number"
                    min={0}
                    step={0.5}
                    defaultValue={filters.maxDistance ?? ""}
                    onChange={(e) => update({ maxDistance: e.target.value || undefined })}
                  />
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

              <div className="space-y-2">
                <Label htmlFor="f-sort">Ordenar por</Label>
                <select
                  id="f-sort"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={filters.sortBy ?? "recent"}
                  onChange={(e) => update({ sortBy: e.target.value === "recent" ? undefined : e.target.value })}
                >
                  <option value="recent">Mais recentes</option>
                  <option value="priceAsc">Preço crescente</option>
                  <option value="priceDesc">Preço decrescente</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { key: "internet", label: "Internet incluída" },
                  { key: "furnished", label: "Mobilado" },
                  { key: "billsIncluded", label: "Despesas incluídas" },
                  { key: "contractAvailable", label: "Com contrato" }
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

          <div>
            {!loading && results.length === 0 ? (
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
                {loading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-[360px] animate-pulse rounded-2xl border bg-muted/50" />
                    ))
                  : results.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Search;
