import { useRef, useState, type ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { updateMe } from "@/lib/api/profile";
import { uploadAvatar } from "@/lib/api/uploads";

interface AvatarUploaderProps {
  name: string;
  avatarUrl?: string;
  onUpdated?: () => void | Promise<void>;
}

export function AvatarUploader({ name, avatarUrl, onUpdated }: AvatarUploaderProps) {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;

    setIsUploading(true);
    try {
      const { url } = await uploadAvatar(selected);
      await updateMe({ avatarUrl: url });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await refreshUser();
      await onUpdated?.();
      toast.success("Avatar atualizado.");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Não foi possível atualizar o avatar.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6">
      <h3 className="font-display text-lg font-semibold">Foto de perfil</h3>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border border-border">
          <AvatarImage src={avatarUrl} alt={`Avatar de ${name}`} />
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            Alterar avatar
          </Button>
          <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP.</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />
    </section>
  );
}
