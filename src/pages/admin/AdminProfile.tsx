import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { PasswordSection } from "@/components/profile/PasswordSection";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { fetchMe, updateMe, type UpdateProfilePayload } from "@/lib/api/profile";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe
  });

  const [state, setState] = useState({
    name: "",
    phone: ""
  });

  useEffect(() => {
    if (!me) return;
    setState({
      name: me.name ?? "",
      phone: me.phone ?? ""
    });
  }, [me]);

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: async () => {
      toast.success("Perfil atualizado.");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      await refreshUser();
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao guardar perfil."))
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateProfilePayload = {
      name: state.name.trim() || undefined,
      phone: state.phone.trim() || undefined
    };
    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Edita os teus dados pessoais e a foto de perfil.
        </p>
      </div>

      <AvatarUploader name={me?.name ?? ""} avatarUrl={me?.avatarUrl} />

      <form onSubmit={submit} className="space-y-6">
      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Dados pessoais</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={state.name}
              minLength={2}
              onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={me?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telemóvel</Label>
            <Input
              id="phone"
              value={state.phone}
              onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
              placeholder="+351 ..."
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar alterações
        </Button>
      </div>
      </form>

      <PasswordSection />
    </div>
  );
}
