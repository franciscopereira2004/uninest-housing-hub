import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type CreateUserPayload,
  type SortDirection,
  type UpdateUserPayload,
  type UserSortField
} from "@/lib/api/admin-users";
import type { User, UserRole } from "@/types";

type DialogMode = "create" | "edit" | "delete" | null;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "student", label: "Estudante" },
  { value: "landlord", label: "Senhorio" },
  { value: "admin", label: "Administrador" }
];

const ROLE_LABEL: Record<UserRole, string> = {
  student: "Estudante",
  landlord: "Senhorio",
  admin: "Administrador"
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  } catch {
    return value;
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [sortBy, setSortBy] = useState<UserSortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const queryKey = useMemo(
    () => ["admin", "users", { search: debouncedSearch, role: roleFilter, sortBy, sortDir }] as const,
    [debouncedSearch, roleFilter, sortBy, sortDir]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      listUsers({
        search: debouncedSearch || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        sortBy,
        sortDir
      })
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      toast.success("Utilizador criado.");
      closeDialog();
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao criar utilizador."))
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      toast.success("Utilizador atualizado.");
      closeDialog();
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao atualizar utilizador."))
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("Utilizador eliminado.");
      closeDialog();
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Erro ao eliminar utilizador."))
  });

  const openCreate = () => {
    setSelectedUser(null);
    setDialogMode("create");
  };

  const openEdit = (target: User) => {
    setSelectedUser(target);
    setDialogMode("edit");
  };

  const openDelete = (target: User) => {
    setSelectedUser(target);
    setDialogMode("delete");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedUser(null);
  };

  const toggleSort = (field: UserSortField) => {
    if (sortBy === field) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const renderSortIcon = (field: UserSortField) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  const users = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Utilizadores</h2>
          <p className="text-sm text-muted-foreground">
            Gere as contas com acesso à plataforma.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Criar utilizador
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou email"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Filtrar por role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os roles</SelectItem>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Nome" field="name" sortBy={sortBy} renderIcon={renderSortIcon} onSort={toggleSort} />
              <SortableHead label="Email" field="email" sortBy={sortBy} renderIcon={renderSortIcon} onSort={toggleSort} />
              <SortableHead label="Role" field="role" sortBy={sortBy} renderIcon={renderSortIcon} onSort={toggleSort} />
              <SortableHead label="Criado em" field="createdAt" sortBy={sortBy} renderIcon={renderSortIcon} onSort={toggleSort} />
              <TableHead className="w-12 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                  {getErrorMessage(error, "Erro ao carregar utilizadores.")}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhum utilizador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {ROLE_LABEL[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Ações">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            disabled={isSelf}
                            onClick={() => !isSelf && openDelete(u)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog
        open={dialogMode === "create"}
        onOpenChange={(open) => !open && closeDialog()}
        loading={createMutation.isPending}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />

      <EditUserDialog
        open={dialogMode === "edit"}
        user={selectedUser}
        onOpenChange={(open) => !open && closeDialog()}
        loading={updateMutation.isPending}
        onSubmit={(payload) => {
          if (selectedUser) updateMutation.mutate({ id: selectedUser.id, payload });
        }}
      />

      <DeleteUserDialog
        open={dialogMode === "delete"}
        user={selectedUser}
        onOpenChange={(open) => !open && closeDialog()}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (selectedUser) deleteMutation.mutate(selectedUser.id);
        }}
      />
    </div>
  );
}

interface SortableHeadProps {
  label: string;
  field: UserSortField;
  sortBy: UserSortField;
  renderIcon: (field: UserSortField) => JSX.Element;
  onSort: (field: UserSortField) => void;
}

function SortableHead({ label, field, renderIcon, onSort }: SortableHeadProps) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
      >
        {label}
        {renderIcon(field)}
      </button>
    </TableHead>
  );
}

interface CreateUserDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateUserPayload) => void;
}

function CreateUserDialog({ open, loading, onOpenChange, onSubmit }: CreateUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("student");
      setPhone("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      password,
      role,
      phone: phone.trim() ? phone.trim() : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar utilizador</DialogTitle>
          <DialogDescription>
            Define os dados de acesso. A password pode ser alterada pelo utilizador depois.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">Nome</Label>
            <Input id="create-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">Password</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="create-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-phone">Telefone (opcional)</Label>
            <Input id="create-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpdateUserPayload) => void;
}

function EditUserDialog({ open, user, loading, onOpenChange, onSubmit }: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPhone(user.phone ?? "");
    }
  }, [open, user]);

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateUserPayload = {};
    if (name !== user.name) payload.name = name;
    if (email.toLowerCase() !== user.email.toLowerCase()) payload.email = email;
    if (role !== user.role) payload.role = role;
    const trimmedPhone = phone.trim();
    if (trimmedPhone !== (user.phone ?? "")) {
      payload.phone = trimmedPhone || undefined;
    }
    if (Object.keys(payload).length === 0) {
      toast.info("Nada para atualizar.");
      return;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar utilizador</DialogTitle>
          <DialogDescription>Atualiza os dados de {user.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Telefone</Label>
            <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteUserDialogProps {
  open: boolean;
  user: User | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

function DeleteUserDialog({ open, user, loading, onOpenChange, onConfirm }: DeleteUserDialogProps) {
  const { user: currentUser } = useAuth();
  const isSelf = user?.id === currentUser?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar utilizador</DialogTitle>
          <DialogDescription>
            {user ? (
              <>
                Tens a certeza que queres eliminar <span className="font-medium">{user.name}</span>?
                Esta ação é permanente.
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading || isSelf}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
