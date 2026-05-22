import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { changeMyPassword, type ChangePasswordPayload } from "@/lib/api/profile";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function PasswordSection() {
  const [state, setState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changeMyPassword(payload),
    onSuccess: () => {
      toast.success("Password atualizada.");
      setState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao alterar password."))
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.newPassword.length < 6) {
      toast.error("A nova password tem de ter pelo menos 6 caracteres.");
      return;
    }
    if (state.newPassword !== state.confirmPassword) {
      toast.error("A confirmação não coincide com a nova password.");
      return;
    }
    mutation.mutate({
      currentPassword: state.currentPassword,
      newPassword: state.newPassword
    });
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <div>
        <h3 className="font-display text-lg font-semibold">Alterar password</h3>
        <p className="text-sm text-muted-foreground">
          Usa pelo menos 6 caracteres. Vais precisar da password atual para confirmar.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Password atual</Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            value={state.currentPassword}
            onChange={(e) => setState((s) => ({ ...s, currentPassword: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={state.newPassword}
              onChange={(e) => setState((s) => ({ ...s, newPassword: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={state.confirmPassword}
              onChange={(e) => setState((s) => ({ ...s, confirmPassword: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Alterar password
          </Button>
        </div>
      </form>
    </section>
  );
}
