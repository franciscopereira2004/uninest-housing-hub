import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  CheckCircle2,
  Clock,
  FileSignature,
  Flag,
  GraduationCap,
  Loader2,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Receipt,
  Sofa,
  Users,
  Wifi
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { FavouriteButton } from "@/components/listings/FavouriteButton";
import { ImageGalleryLightbox } from "@/components/listings/ImageGalleryLightbox";
import { ContactLandlordDialog } from "@/components/messages/ContactLandlordDialog";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { fetchListing } from "@/data/listings";
import { useAuth } from "@/context/AuthContext";
import type { Listing, ListingStatus } from "@/types";
import { PROPERTY_TYPE_LABELS } from "@/types";
import { toast } from "sonner";

const STATUS_BANNER: Record<
  ListingStatus,
  { tone: "warn" | "info" | "destructive" | "muted"; label: string; message: string } | null
> = {
  approved: null,
  pending: {
    tone: "warn",
    label: "Pendente de aprovação",
    message: "Este anúncio só fica visível ao público depois de ser aprovado por um administrador."
  },
  rejected: {
    tone: "destructive",
    label: "Rejeitado",
    message: "Edita o anúncio para o submeter novamente para aprovação."
  },
  suspended: {
    tone: "muted",
    label: "Suspenso",
    message: "Este anúncio foi suspenso pela equipa UniNest. Contacta o suporte."
  }
};

const TONE_CLASS = {
  warn: "border-amber-300 bg-amber-50 text-amber-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
  destructive: "border-destructive/30 bg-destructive/5 text-destructive",
  muted: "border-border bg-muted text-foreground"
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchListing(id)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch(() => {
        if (!cancelled) setListing(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <section className="container flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </section>
      </PublicLayout>
    );
  }

  if (!listing) {
    return (
      <PublicLayout>
        <section className="container py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Anúncio não encontrado</h1>
          <p className="mt-2 text-muted-foreground">
            O anúncio que procuras pode já não estar disponível.
          </p>
          <Button asChild className="mt-6" variant="soft">
            <Link to="/search">Voltar à pesquisa</Link>
          </Button>
        </section>
      </PublicLayout>
    );
  }

  const cover = listing.images[0]?.url;
  const extras = listing.images.slice(1, 3);
  const isOwner = user?.id === listing.landlordId;
  const banner = STATUS_BANNER[listing.status];

  const contact = () => {
    if (!user) {
      toast.info("Entra na tua conta para contactar o senhorio.");
      navigate("/login");
      return;
    }
    if (user.role !== "student") {
      toast.error("Apenas estudantes podem contactar senhorios.");
      return;
    }
    setContactOpen(true);
  };

  const report = () => {
    if (!user) {
      toast.info("Entra na tua conta para denunciar este anúncio.");
      navigate("/login");
      return;
    }
    setReportOpen(true);
  };

  const facts: Array<{ icon: typeof Bed; label: string; value: string }> = [
    { icon: Bed, label: "Tipo", value: PROPERTY_TYPE_LABELS[listing.propertyType] },
    { icon: Bath, label: "WC", value: String(listing.bathrooms) },
    { icon: Sofa, label: "Mobília", value: listing.furnished ? "Sim" : "Não" },
    { icon: Wifi, label: "Internet", value: listing.internetIncluded ? "Incluída" : "Não incl." },
    { icon: Users, label: "Inquilinos", value: String(listing.maxTenants) },
    { icon: Receipt, label: "Despesas", value: listing.billsIncluded ? "Incluídas" : "À parte" },
    {
      icon: FileSignature,
      label: "Contrato",
      value: listing.contractAvailable ? "Sim" : "Não"
    }
  ];

  return (
    <PublicLayout>
      <section className="container py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to={isOwner ? "/landlord/listings" : "/search"}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {isOwner ? "Voltar aos meus anúncios" : "Voltar à pesquisa"}
          </Link>
          {isOwner && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/landlord/listings/${listing.id}/edit`}>
                <Pencil className="h-4 w-4" />
                Editar anúncio
              </Link>
            </Button>
          )}
        </div>

        {isOwner && banner && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border p-4 text-sm ${TONE_CLASS[banner.tone]}`}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">{banner.label}</p>
              <p className="mt-1">{banner.message}</p>
              {listing.status === "rejected" && listing.rejectionReason && (
                <p className="mt-2 text-xs">
                  <span className="font-medium">Motivo:</span> {listing.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">{listing.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {listing.address}, {listing.city}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            {listing.nearbyUniversity} · {listing.distanceToUniversity} km
          </p>
        </header>

        {cover && (
          <div className="grid gap-3 overflow-hidden rounded-2xl md:grid-cols-3 md:grid-rows-2">
            <button
              type="button"
              onClick={() => setGalleryIndex(0)}
              aria-label="Abrir galeria"
              className="group relative md:col-span-2 md:row-span-2"
            >
              <img
                src={cover}
                alt={listing.title}
                loading="lazy"
                width={1024}
                height={768}
                className="h-full max-h-[520px] w-full object-cover transition group-hover:brightness-95"
              />
              {listing.images.length > 1 && (
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                  Ver {listing.images.length} fotos
                </span>
              )}
            </button>
            {extras.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setGalleryIndex(i + 1)}
                aria-label={`Abrir foto ${i + 2}`}
                className="hidden md:block"
              >
                <img
                  src={img.url}
                  alt={`${listing.title} — foto ${i + 2}`}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full max-h-[256px] w-full object-cover transition hover:brightness-95"
                />
              </button>
            ))}
          </div>
        )}

        <ImageGalleryLightbox
          images={listing.images}
          open={galleryIndex !== null}
          initialIndex={galleryIndex ?? 0}
          alt={listing.title}
          onOpenChange={(open) => !open && setGalleryIndex(null)}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <article className="space-y-10">
            <section>
              <h2 className="font-display text-xl font-semibold">Sobre o alojamento</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{listing.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border bg-card p-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <dt className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {listing.amenities.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Comodidades</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {listing.amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {listing.houseRules.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold">Regras da casa</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {listing.houseRules.map((r) => (
                    <li key={r} className="rounded-full bg-muted px-3 py-1.5 text-sm">
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold">{listing.monthlyPrice}€</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Caução: {listing.depositAmount}€</p>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Disponível
                  </span>
                  <span className="font-medium">{fmtDate(listing.availableFrom)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" /> Estadia mín.
                  </span>
                  <span className="font-medium">{listing.minimumStay} meses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Despesas</span>
                  <span className="font-medium">
                    {listing.billsIncluded ? "Incluídas" : "À parte"}
                  </span>
                </div>
              </div>

              {isOwner ? (
                <Button asChild className="mt-6 w-full" size="lg">
                  <Link to={`/landlord/listings/${listing.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Editar anúncio
                  </Link>
                </Button>
              ) : (
                <>
                  {listing.landlord ? (
                    <div className="mt-6 rounded-xl border bg-muted/40 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-border">
                          <AvatarImage
                            src={listing.landlord.avatarUrl}
                            alt={`Avatar de ${listing.landlord.name}`}
                          />
                          <AvatarFallback className="text-sm font-semibold">
                            {listing.landlord.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((p) => p[0]?.toUpperCase())
                              .join("") || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{listing.landlord.name}</p>
                          {listing.landlord.companyName && (
                            <p className="truncate text-xs text-muted-foreground">
                              {listing.landlord.companyName}
                            </p>
                          )}
                          {listing.landlord.phone && (
                            <a
                              href={`tel:${listing.landlord.phone}`}
                              className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {listing.landlord.phone}
                            </a>
                          )}
                        </div>
                      </div>
                      <Button className="mt-4 w-full" size="lg" variant="accent" onClick={contact}>
                        <MessageSquare className="h-4 w-4" />
                        Contactar senhorio
                      </Button>
                    </div>
                  ) : (
                    <Button className="mt-6 w-full" size="lg" variant="accent" onClick={contact}>
                      <MessageSquare className="h-4 w-4" />
                      Contactar senhorio
                    </Button>
                  )}
                  <FavouriteButton listingId={listing.id} variant="full" className="mt-3 w-full" />
                  <Button className="mt-3 w-full" variant="ghost" onClick={report}>
                    <Flag className="h-4 w-4" />
                    Denunciar anúncio
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Os contactos são feitos pelo sistema de mensagens interno.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      <ContactLandlordDialog
        open={contactOpen}
        listingId={listing.id}
        listingTitle={listing.title}
        onOpenChange={setContactOpen}
      />

      <ReportDialog
        open={reportOpen}
        listingId={listing.id}
        targetLabel={listing.title}
        onOpenChange={setReportOpen}
      />
    </PublicLayout>
  );
};

export default ListingDetail;
