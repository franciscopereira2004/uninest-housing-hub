import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();

  const initialRole = (params.get("role") as UserRole) || "student";
  const [role, setRole] = useState<UserRole>(
    initialRole === "landlord" ? "landlord" : "student",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = params.get("role");
    if (r === "landlord" || r === "student") setRole(r);
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, role, phone });
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="container flex justify-center py-16 md:py-24">
        <div className="w-full max-w-xl rounded-2xl border bg-card p-8 shadow-card">
          <h1 className="font-display text-2xl font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolhe o teu perfil e começa em segundos.
          </p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {(
              [
                { value: "student", label: "Estudante", desc: "Procuro alojamento", icon: GraduationCap },
                { value: "landlord", label: "Senhorio", desc: "Quero anunciar", icon: Building2 },
              ] as const
            ).map(({ value, label, desc, icon: Icon }) => {
              const active = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-smooth",
                    active
                      ? "border-primary bg-primary-soft ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telemóvel (opcional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+351 ..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "A criar conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tens conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Register;
