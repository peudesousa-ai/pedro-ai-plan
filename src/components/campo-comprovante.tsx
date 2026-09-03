"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Área de anexo de comprovante: arrastar-e-soltar ou toque para escolher,
 * com preview de imagem e indicação de PDF. Só seleciona — quem envia é o
 * formulário pai, na hora de salvar.
 */
export function CampoComprovante({
  arquivo,
  aoMudar,
}: {
  arquivo: File | null;
  aoMudar: (arquivo: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (arquivo && arquivo.type.startsWith("image/")) {
      const url = URL.createObjectURL(arquivo);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [arquivo]);

  const aoSoltar = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setArrastando(false);
      const solto = e.dataTransfer.files?.[0];
      if (solto) aoMudar(solto);
    },
    [aoMudar]
  );

  if (arquivo) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Prévia do comprovante"
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : (
          <FileText className="h-10 w-10 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{arquivo.name}</p>
          <p className="text-xs text-muted-foreground">
            {(arquivo.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => aoMudar(null)}
          aria-label="Remover comprovante"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={aoSoltar}
      className={cn(
        "flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors",
        arrastando ? "border-primary bg-accent" : "hover:border-primary/60"
      )}
    >
      <ImagePlus className="h-6 w-6" />
      <span>
        <span className="font-medium text-foreground">Anexar comprovante</span>
        <br />
        foto do PIX ou recibo (imagem ou PDF)
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => {
          const escolhido = e.target.files?.[0];
          if (escolhido) aoMudar(escolhido);
          e.target.value = "";
        }}
      />
    </button>
  );
}
