import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_MB,
  uploadListingImage
} from "@/lib/api/uploads";
import type { Listing, PropertyType } from "@/types";
import type { ListingPayload } from "@/lib/api/landlord-listings";

const MAX_IMAGES = 10;
const MIN_IMAGES = 3;

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "room", label: "Quarto" },
  { value: "apartment", label: "Apartamento" },
  { value: "studio", label: "Studio" },
  { value: "shared_house", label: "Casa partilhada" }
];

interface Props {
  initial?: Listing;
  loading: boolean;
  submitLabel: string;
  onSubmit: (payload: ListingPayload) => void;
}

function defaultFor(initial?: Listing) {
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    propertyType: initial?.propertyType ?? "room",
    city: initial?.city ?? "",
    address: initial?.address ?? "",
    nearbyUniversity: initial?.nearbyUniversity ?? "",
    distanceToUniversity: initial?.distanceToUniversity ?? 1,
    monthlyPrice: initial?.monthlyPrice ?? 350,
    depositAmount: initial?.depositAmount ?? 350,
    billsIncluded: initial?.billsIncluded ?? false,
    availableFrom: initial?.availableFrom ?? new Date().toISOString().slice(0, 10),
    minimumStay: initial?.minimumStay ?? 9,
    maxTenants: initial?.maxTenants ?? 1,
    bedrooms: initial?.bedrooms ?? 1,
    bathrooms: initial?.bathrooms ?? 1,
    furnished: initial?.furnished ?? true,
    internetIncluded: initial?.internetIncluded ?? true,
    contractAvailable: initial?.contractAvailable ?? true,
    houseRulesText: (initial?.houseRules ?? []).join("\n"),
    amenitiesText: (initial?.amenities ?? []).join("\n"),
    images: (initial?.images ?? []).map((i) => i.url) as string[]
  };
}

export function ListingForm({ initial, loading, submitLabel, onSubmit }: Props) {
  const [state, setState] = useState(() => defaultFor(initial));

  useEffect(() => {
    setState(defaultFor(initial));
  }, [initial]);

  const set = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const images = state.images.map((url, order) => ({ url, order }));

    if (images.length < MIN_IMAGES) {
      toast.error(`Adiciona pelo menos ${MIN_IMAGES} imagens.`);
      return;
    }

    const payload: ListingPayload = {
      title: state.title.trim(),
      description: state.description.trim(),
      propertyType: state.propertyType as PropertyType,
      city: state.city.trim(),
      address: state.address.trim(),
      nearbyUniversity: state.nearbyUniversity.trim(),
      distanceToUniversity: Number(state.distanceToUniversity),
      monthlyPrice: Number(state.monthlyPrice),
      depositAmount: Number(state.depositAmount),
      billsIncluded: state.billsIncluded,
      availableFrom: state.availableFrom,
      minimumStay: Number(state.minimumStay),
      maxTenants: Number(state.maxTenants),
      bedrooms: Number(state.bedrooms),
      bathrooms: Number(state.bathrooms),
      furnished: state.furnished,
      internetIncluded: state.internetIncluded,
      contractAvailable: state.contractAvailable,
      houseRules: state.houseRulesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      amenities: state.amenitiesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      images
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Informação principal</h3>
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            required
            minLength={5}
            value={state.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex: Quarto luminoso perto da Universidade"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            required
            minLength={20}
            rows={5}
            value={state.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Descreve o quarto, a casa, o ambiente e quem procura..."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de imóvel</Label>
            <Select
              value={state.propertyType}
              onValueChange={(v) => set("propertyType", v as PropertyType)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableFrom">Disponível a partir de</Label>
            <Input
              id="availableFrom"
              type="date"
              required
              value={state.availableFrom}
              onChange={(e) => set("availableFrom", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Localização</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" required value={state.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input
              id="address"
              required
              value={state.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="university">Universidade próxima</Label>
            <Input
              id="university"
              required
              value={state.nearbyUniversity}
              onChange={(e) => set("nearbyUniversity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distance">Distância (km)</Label>
            <Input
              id="distance"
              type="number"
              step={0.1}
              min={0}
              required
              value={state.distanceToUniversity}
              onChange={(e) => set("distanceToUniversity", Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Valores e estadia</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Preço mensal (€)</Label>
            <Input
              id="price"
              type="number"
              min={1}
              required
              value={state.monthlyPrice}
              onChange={(e) => set("monthlyPrice", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit">Caução (€)</Label>
            <Input
              id="deposit"
              type="number"
              min={0}
              required
              value={state.depositAmount}
              onChange={(e) => set("depositAmount", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStay">Estadia mín. (meses)</Label>
            <Input
              id="minStay"
              type="number"
              min={1}
              required
              value={state.minimumStay}
              onChange={(e) => set("minimumStay", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTenants">Inquilinos máx.</Label>
            <Input
              id="maxTenants"
              type="number"
              min={1}
              required
              value={state.maxTenants}
              onChange={(e) => set("maxTenants", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Quartos</Label>
            <Input
              id="bedrooms"
              type="number"
              min={0}
              required
              value={state.bedrooms}
              onChange={(e) => set("bedrooms", Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Casas de banho</Label>
            <Input
              id="bathrooms"
              type="number"
              min={0}
              required
              value={state.bathrooms}
              onChange={(e) => set("bathrooms", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox
              checked={state.billsIncluded}
              onCheckedChange={(v) => set("billsIncluded", Boolean(v))}
            />
            Despesas incluídas
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox
              checked={state.furnished}
              onCheckedChange={(v) => set("furnished", Boolean(v))}
            />
            Mobilado
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox
              checked={state.internetIncluded}
              onCheckedChange={(v) => set("internetIncluded", Boolean(v))}
            />
            Internet incluída
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <Checkbox
              checked={state.contractAvailable}
              onCheckedChange={(v) => set("contractAvailable", Boolean(v))}
            />
            Contrato disponível
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Detalhes</h3>
        <div className="space-y-2">
          <Label htmlFor="amenities">Comodidades (uma por linha)</Label>
          <Textarea
            id="amenities"
            rows={4}
            value={state.amenitiesText}
            onChange={(e) => set("amenitiesText", e.target.value)}
            placeholder={"Ex:\nAquecimento central\nMáquina de lavar"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rules">Regras da casa (uma por linha)</Label>
          <Textarea
            id="rules"
            rows={4}
            value={state.houseRulesText}
            onChange={(e) => set("houseRulesText", e.target.value)}
            placeholder={"Ex:\nSem fumar\nSilêncio depois das 22h"}
          />
        </div>
        <div className="space-y-2">
          <Label>Imagens (mínimo {MIN_IMAGES}, máximo {MAX_IMAGES})</Label>
          <ImageUploader
            value={state.images}
            onChange={(images) => set("images", images)}
          />
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface ImageUploaderProps {
  value: string[];
  onChange: (next: string[]) => void;
}

function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const slotsLeft = MAX_IMAGES - value.length;
    if (slotsLeft <= 0) {
      toast.error(`Já tens o máximo de ${MAX_IMAGES} imagens.`);
      return;
    }
    const toUpload = files.slice(0, slotsLeft);
    if (files.length > slotsLeft) {
      toast.info(`Só foram aceites as primeiras ${slotsLeft} imagens (limite ${MAX_IMAGES}).`);
    }

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      try {
        const { url } = await uploadListingImage(file);
        uploaded.push(url);
      } catch (err) {
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Erro ao carregar imagem.";
        toast.error(`${file.name}: ${message}`);
      }
    }
    setUploading(false);
    if (uploaded.length > 0) {
      onChange([...value, ...uploaded]);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const canAddMore = value.length < MAX_IMAGES;
  const need = Math.max(0, MIN_IMAGES - value.length);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
          >
            <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-background/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground shadow-soft">
                Capa
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remover foto"
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                A carregar...
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                Adicionar
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length}/{MAX_IMAGES} fotos · JPG, PNG ou WEBP até {MAX_IMAGE_SIZE_MB}MB cada
        {need > 0 ? ` · faltam ${need} para submeter` : ""}
      </p>
    </div>
  );
}
