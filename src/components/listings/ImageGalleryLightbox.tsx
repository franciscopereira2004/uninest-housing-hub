import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { ListingImage } from "@/types";

interface Props {
  images: ListingImage[];
  open: boolean;
  initialIndex: number;
  alt: string;
  onOpenChange: (open: boolean) => void;
}

export function ImageGalleryLightbox({ images, open, initialIndex, alt, onOpenChange }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    startIndex: initialIndex
  });
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(initialIndex, true);
      setCurrent(initialIndex);
    }
  }, [open, initialIndex, emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col outline-none">
          <DialogPrimitive.Title className="sr-only">Galeria de imagens</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Use as setas do teclado ou os botões para navegar.
          </DialogPrimitive.Description>

          <div className="flex h-14 shrink-0 items-center justify-between px-4 text-white sm:px-8">
            <span className="text-sm font-medium">
              {current + 1} / {images.length}
            </span>
            <DialogPrimitive.Close
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <div ref={emblaRef} className="h-full overflow-hidden">
              <div className="flex h-full">
                {images.map((img, i) => (
                  <div
                    key={img.url + i}
                    className="flex h-full min-w-0 flex-[0_0_100%] items-center justify-center p-4 sm:p-8"
                  >
                    <img
                      src={img.url}
                      alt={`${alt} — foto ${i + 1}`}
                      className="max-h-full max-w-full select-none object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Foto seguinte"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex shrink-0 justify-center gap-2 pb-4 sm:pb-6">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Ir para foto ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
