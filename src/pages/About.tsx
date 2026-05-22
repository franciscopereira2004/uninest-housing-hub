import { Link } from "react-router-dom";
import { Building2, GraduationCap, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";

const About = () => {
  return (
    <PublicLayout>
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Sobre o UniNest
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold md:text-5xl">
            Alojamento estudantil sem complicações.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            O UniNest é um marketplace dedicado exclusivamente a estudantes universitários.
            Conectamos estudantes a senhorios através de anúncios revistos e aprovados antes de
            irem para o público — para que a tua procura seja simples, transparente e segura.
          </p>
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "Pensado para estudantes",
              desc: "Filtra por universidade, distância, despesas incluídas, número de quartos e mais."
            },
            {
              icon: Building2,
              title: "Apoio aos senhorios",
              desc: "Senhorios publicam, gerem e respondem a estudantes a partir de um painel próprio."
            },
            {
              icon: ShieldCheck,
              title: "Moderação humana",
              desc: "Cada anúncio passa por revisão antes de ficar visível ao público."
            },
            {
              icon: MessageSquare,
              title: "Comunicação interna",
              desc: "Sistema de mensagens em tempo real — sem expor email ou telefone."
            },
            {
              icon: Sparkles,
              title: "Sem custos para estudantes",
              desc: "Pesquisa, candidatura e conversa: tudo gratuito para quem está a estudar."
            },
            {
              icon: ShieldCheck,
              title: "Denúncias rápidas",
              desc: "Anúncios suspeitos ou comportamento inapropriado podem ser reportados num clique."
            }
          ].map(({ icon: Icon, title, desc }) => (
            <article key={title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center text-primary-foreground md:p-16">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">Junta-te ao UniNest</h2>
          <p className="mt-3 text-primary-foreground/90">
            Estudantes começam a pesquisa em segundos. Senhorios publicam o primeiro anúncio em
            menos de 5 minutos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/register?role=student">Sou estudante</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/register?role=landlord">Sou senhorio</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;
