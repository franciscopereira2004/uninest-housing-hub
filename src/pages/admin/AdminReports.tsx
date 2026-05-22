import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, PauseCircle, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { listAdminReports, updateReport } from "@/lib/api/reports";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  type ReportListItem,
  type ReportStatus
} from "@/types";

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const STATUS_VARIANT: Record<ReportStatus, "default" | "secondary" | "destructive" | "outline"> = {
  open: "destructive",
  reviewed: "secondary",
  actioned: "default",
  dismissed: "outline"
};

export default function AdminReports() {
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [selected, setSelected] = useState<ReportListItem | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "reports", status],
    queryFn: () => listAdminReports(status === "all" ? undefined : { status })
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      next,
      action
    }: {
      id: string;
      next: ReportStatus;
      action?: "suspend_listing" | "block_user";
    }) => updateReport(id, { status: next, action }),
    onSuccess: () => {
      toast.success("Denúncia atualizada.");
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "reports", "counts"] });
      setSelected(null);
    },
    onError: (err) => toast.error(errorMessage(err, "Erro ao atualizar denúncia."))
  });

  const reports = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Denúncias</h2>
          <p className="text-sm text-muted-foreground">
            Avalia denúncias e aciona moderação quando necessário.
          </p>
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus | "all")}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="reviewed">Revistas</SelectItem>
            <SelectItem value="actioned">Acionadas</SelectItem>
            <SelectItem value="dismissed">Descartadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motivo</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead>Alvo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-32 text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-destructive">
                  {errorMessage(error, "Erro ao carregar denúncias.")}
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Sem denúncias neste estado.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((item) => (
                <TableRow key={item.report.id}>
                  <TableCell className="font-medium">
                    {REPORT_REASON_LABELS[item.report.reason]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.reporter?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.listing ? (
                      <span className="line-clamp-1">{item.listing.title}</span>
                    ) : item.reportedUser ? (
                      `@${item.reportedUser.name}`
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[item.report.status]}>
                      {REPORT_STATUS_LABELS[item.report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(item.report.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(item)}>
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {REPORT_REASON_LABELS[selected.report.reason]}
                </DialogTitle>
                <DialogDescription>
                  Reportada em {formatDateTime(selected.report.createdAt)} por{" "}
                  <span className="font-medium">{selected.reporter?.name ?? "utilizador removido"}</span>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <section className="rounded-md border bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Descrição
                  </p>
                  <p className="mt-1 whitespace-pre-line">{selected.report.description}</p>
                </section>

                {selected.listing && (
                  <section className="rounded-md border p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Anúncio reportado
                    </p>
                    <Link
                      to={`/listing/${selected.listing.id}`}
                      className="mt-1 inline-block font-medium hover:text-primary hover:underline"
                    >
                      {selected.listing.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {selected.listing.city} · estado: {selected.listing.status}
                    </p>
                  </section>
                )}

                {selected.reportedUser && (
                  <section className="rounded-md border p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Utilizador reportado
                    </p>
                    <p className="mt-1 font-medium">{selected.reportedUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.reportedUser.role} · {selected.reportedUser.email}
                    </p>
                  </section>
                )}

                <p className="text-xs text-muted-foreground">
                  Estado atual: <Badge variant={STATUS_VARIANT[selected.report.status]}>{REPORT_STATUS_LABELS[selected.report.status]}</Badge>
                </p>
              </div>

              <DialogFooter className="flex-wrap gap-2">
                <Button
                  variant="ghost"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({ id: selected.report.id, next: "dismissed" })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Descartar
                </Button>
                <Button
                  variant="secondary"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({ id: selected.report.id, next: "reviewed" })
                  }
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar revista
                </Button>
                {selected.listing && (
                  <Button
                    variant="destructive"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selected.report.id,
                        next: "actioned",
                        action: "suspend_listing"
                      })
                    }
                  >
                    <PauseCircle className="h-4 w-4" />
                    Suspender anúncio
                  </Button>
                )}
                {(selected.reportedUser || selected.listing) && (
                  <Button
                    variant="destructive"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selected.report.id,
                        next: "actioned",
                        action: "block_user"
                      })
                    }
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                    Bloquear utilizador
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
