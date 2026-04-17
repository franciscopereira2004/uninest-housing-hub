import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  CheckCircle2,
  MapPin,
  Sofa,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { getListing, getProperty, getRoom } from "@/data/listings";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const listing = id ? getListing(id) : undefined;
  const property = listing ? getProperty(listing.propertyId) : undefined;
  const room = listing ? getRoom(listing.roomId) : undefined;

  if (!listing || !property || !room) {
    return (
      <PublicLayout>
        <section className="container py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Anúncio não encontrado</h1>
          <p className="mt-2 text-muted-foreground">O anúncio que procuras pode já não estar disponível.</p>
          <Button asChild className="mt-6" variant="soft">
            <Link to="/search">Voltar à pesquisa</Link>
          </Button>
        </section>
      </PublicLayout>
    );
  }

  const apply = () => {
    if (!user) {
      toast.info("Cria conta como estudante para te candidatares.");
      return;
    }
    if (user.role !== "student") {
      toast.error("Apenas estudantes podem enviar candidaturas.");
      return;
    }
    toast.success("Candidatura enviada! O senhorio será notificado.");
  };

  return (
    <PublicLayout>
      <section className="container py-8 md:py-12">
        <Link
          to="/search"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à pesquisa
        </Link>

        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold md:text-4xl">
            {listing.title}
          </h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.address}, {property.postalCode} {property.city}
          </p>
        </header>

        {/* Gallery */}
        <div className="grid gap-3 overflow-hidden rounded-2xl md:grid-cols-3 md:grid-rows-2">
          <div className="md:col-span-2 md:row-span-2">
            <img
              src={property.images[0]}
              alt={listing.title}
              loading="lazy"
              width={1024}
              height={768}
              className="h-full max-h-[520px] w-full object-cover"
            />
          </div>
          {property.images.slice(1, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${listing.title} - foto ${i + 2}`}
              loading="lazy"
              width={1024}
              height={768}
              className="hidden h-full max-h-[256px] w-full object-cover md:block"
            />
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <article className="space-y-10">
            <section>
              <h2 className="font-display text-xl font-semibold">Sobre o quarto</h2>
              <p className="mt-3 text-muted-foreground">{room.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: Bed, label: "Tipo", value: property.type === "studio" ? "Studio" : property.type === "house" ? "Casa" : "Apartamento" },
                  { icon: Bath, label: "WC", value: room.privateBathroom ? "Privado" : "Partilhado" },
                  { icon: Sofa, label: "Mobília", value: room.furnished ? "Sim" : "Não" },
                  { icon: Wifi, label: "Internet", value: property.internetIncluded ? "Incluída" : "Não incl." },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border bg-card p-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <dt className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-0.5 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Sobre o imóvel</h2>
              <p className="mt-3 text-muted-foreground">{property.description}</p>

              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {room.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Regras da casa</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.rules.map((r) => (
                  <li key={r} className="rounded-full bg-muted px-3 py-1.5 text-sm">
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          </article>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold">{room.price}€</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Caução: {room.deposit}€
              </p>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Disponível
                  </span>
                  <span className="font-medium">{fmtDate(room.availableFrom)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                    Disponível
                  </span>
                </div>
              </div>

              <Button className="mt-6 w-full" size="lg" variant="accent" onClick={apply}>
                Enviar candidatura
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Sem custos para te candidatares.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
};

export default ListingDetail;
