import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Flag, Lock, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";

const Safety = () => {
  return (
    <PublicLayout>
      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Confiança e segurança
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold md:text-5xl">
            Procura um lar sem te preocupares com burlas.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Construímos o UniNest com camadas de proteção pensadas para o aluguer estudantil.
            Vai abaixo o que fazemos por ti — e o que tu podes fazer para reduzir riscos.
          </p>
        </div>
      </section>

      <section className="container pb-12">
        <h2 className="font-display text-2xl font-semibold">O que fazemos por ti</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: CheckCircle2,
              title: "Moderação prévia",
              desc: "Nenhum anúncio fica público sem passar por revisão manual da equipa."
            },
            {
              icon: MessageSquare,
              title: "Mensagens internas",
              desc: "Comunicação entre estudantes e senhorios acontece dentro da plataforma — nunca expomos email ou telefone."
            },
            {
              icon: Flag,
              title: "Denúncias 1-clique",
              desc: "Vês algo estranho? Denuncia em segundos e a equipa revê com prioridade."
            },
            {
              icon: Lock,
              title: "Contas verificadas",
              desc: "Cada conta exige email válido. Contas suspeitas são bloqueadas pela equipa."
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

      <section className="container pb-12">
        <h2 className="font-display text-2xl font-semibold">Cuidados a ter</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            "Nunca envies dinheiro antes de visitar o imóvel ou assinar contrato.",
            "Desconfia de preços muito abaixo do mercado para a zona.",
            "Confirma a identidade do senhorio numa visita presencial.",
            "Pede sempre contrato de arrendamento por escrito.",
            "Não partilhes dados sensíveis (NIF, IBAN, cópia de cartão de cidadão) por mensagem.",
            "Reporta qualquer pedido fora da plataforma — UniNest nunca pede pagamento para 'reservar'."
          ].map((tip) => (
            <div
              key={tip}
              className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm shadow-soft"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <div className="rounded-3xl border bg-card p-8 text-center shadow-soft md:p-12">
          <h2 className="font-display text-2xl font-semibold">Vês algo suspeito?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Em cada página de anúncio há um botão "Denunciar anúncio". No chat com um senhorio há
            também a opção de denunciar comportamento. Todas as denúncias são anónimas para a parte
            denunciada.
          </p>
          <Button asChild className="mt-5">
            <Link to="/search">Voltar à pesquisa</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Safety;
