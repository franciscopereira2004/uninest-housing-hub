import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Search as SearchIcon,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ListingCard } from "@/components/listings/ListingCard";
import { getCities, getListings } from "@/data/listings";
import heroImg from "@/assets/hero-room.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const featured = getListings().slice(0, 4);
  const cities = getCities();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Quarto de estudante luminoso e acolhedor"
            width={1536}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl animate-fade-in-up text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma de gestão de arrendamento estudantil
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-6xl">
              Encontra o teu próximo lar enquanto estudas.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/90 md:text-xl">
              Quartos verificados, contratos digitais e gestão de rendas — tudo
              num só lugar, para estudantes e senhorios.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={onSearch}
            className="relative mt-10 grid max-w-3xl gap-3 rounded-2xl bg-background p-3 shadow-glow md:grid-cols-[1fr_180px_auto] md:items-center md:gap-2"
          >
            <div className="flex items-center gap-3 px-2">
              <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <Input
                list="cities"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade — ex: Porto, Lisboa, Coimbra"
                className="border-0 px-0 text-base shadow-none focus-visible:ring-0"
              />
              <datalist id="cities">
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="flex items-center gap-2 border-t px-2 md:border-l md:border-t-0">
              <span className="text-sm text-muted-foreground">Até</span>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="800€"
                className="border-0 px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full md:w-auto">
              Pesquisar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">
            Pensado para os dois lados
          </h2>
          <p className="mt-3 text-muted-foreground">
            UniNest simplifica todo o ciclo do arrendamento estudantil — desde a
            pesquisa até ao último mês de renda.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border bg-card p-8 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">Para estudantes</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "Pesquisa com filtros por cidade, preço e comodidades",
                "Candidaturas com acompanhamento em tempo real",
                "Contratos e documentos sempre acessíveis",
                "Histórico de pagamentos transparente",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border bg-card p-8 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">Para senhorios</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                "Gestão centralizada de imóveis e quartos",
                "Receção e aprovação de candidaturas",
                "Contratos, rendas e despesas num só dashboard",
                "Comunicação direta com inquilinos",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Anúncios verificados", desc: "Imóveis e senhorios validados pela equipa." },
            { icon: FileText, title: "Contratos digitais", desc: "Assinatura e arquivo seguro de documentos." },
            { icon: Wallet, title: "Pagamentos claros", desc: "Acompanha rendas pagas e pendentes em tempo real." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h4 className="mt-3 font-semibold">{title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="container pb-20 md:pb-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Alojamentos em destaque
            </h2>
            <p className="mt-2 text-muted-foreground">
              Uma seleção de quartos e studios prontos a habitar.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link to="/search">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline">
            <Link to="/search">Ver todos os alojamentos</Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-brand p-10 text-primary-foreground md:p-16">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Pronto para começar?
              </h2>
              <p className="mt-3 max-w-xl text-primary-foreground/90">
                Cria a tua conta em menos de um minuto. Sem custos para
                estudantes — paga apenas pela renda do teu novo quarto.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Button asChild variant="hero" size="lg">
                <Link to="/register?role=student">Sou estudante</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/register?role=landlord">Sou senhorio</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
