import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DEFAULT_LOGINS = {
  admin: { email: "admin@uninest.local", password: "ChangeMe123!" },
  landlord: { email: "landlord@uninest.local", password: "ChangeMe123!" },
  student: { email: "student@uninest.local", password: "ChangeMe123!" }
} as const;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fillCredentials = (type: keyof typeof DEFAULT_LOGINS) => {
    setEmail(DEFAULT_LOGINS[type].email);
    setPassword(DEFAULT_LOGINS[type].password);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success("Bem-vindo de volta!");
      if (loggedUser.role === "admin") navigate("/admin");
      else if (loggedUser.role === "landlord") navigate("/landlord");
      else navigate("/student");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container flex justify-center py-16 md:py-24">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Entrar na tua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acede ao teu painel UniNest.
          </p>

          <div className="mt-4 rounded-xl border border-dashed bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Contas de demonstração</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Palavra-passe comum: <span className="font-medium">ChangeMe123!</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => fillCredentials("admin")}>
                Admin
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fillCredentials("landlord")}>
                Senhorio
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => fillCredentials("student")}>
                Estudante
              </Button>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="o.teu@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "A entrar..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não tens conta?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Login;
