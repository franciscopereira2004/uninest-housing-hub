import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/40">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground">
              <span className="font-display text-lg font-bold">U</span>
            </div>
            <span className="font-display text-xl font-semibold">UniNest</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A plataforma que liga estudantes e senhorios de forma simples,
            transparente e segura.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Estudantes</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/search" className="hover:text-foreground">Pesquisar quartos</Link></li>
            <li><Link to="/register?role=student" className="hover:text-foreground">Criar conta</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Entrar</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Senhorios</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/register?role=landlord" className="hover:text-foreground">Anunciar imóvel</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Aceder à conta</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">Suporte</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>ajuda@uninest.pt</li>
            <li>+351 220 000 000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} UniNest. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
