"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf";

export function MediaUploader({ projectId }: { projectId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<{ busy: boolean; message?: string; error?: string }>({ busy: false });

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setStatus({ busy: true, message: `Uploading ${list.length} file${list.length > 1 ? "s" : ""}…` });
    const errors: string[] = [];
    for (const file of list) {
      const body = new FormData();
      body.set("projectId", projectId);
      body.set("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          errors.push(`${file.name}: ${data.error ?? "upload failed"}`);
        }
      } catch {
        errors.push(`${file.name}: network error`);
      }
    }
    setStatus({ busy: false, error: errors.join(" "), message: errors.length ? undefined : "Uploaded." });
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition",
          dragging ? "border-ink bg-iris-lavender/10" : "border-paper-line bg-paper",
        )}
      >
        <span aria-hidden className="iris-bg mb-4 h-10 w-10 rounded-full" />
        <p className="font-medium">Drop artwork, video, audio or a pitch PDF</p>
        <p className="mt-1 text-sm text-ink-muted">JPG, PNG, WebP, GIF, MP4, WebM, MP3, WAV or PDF · up to 15 MB each</p>
        <label className="mt-5 inline-flex h-10 cursor-pointer items-center rounded-full bg-ink px-5 text-sm font-medium text-white focus-within:ring-4 focus-within:ring-iris-lavender/60">
          {status.busy ? "Uploading…" : "Choose files"}
          <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" disabled={status.busy} onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>
      <div aria-live="polite" className="mt-3 text-sm">
        {status.busy && <p className="text-ink-muted">{status.message}</p>}
        {!status.busy && status.error && <p className="text-rose-700">{status.error}</p>}
        {!status.busy && !status.error && status.message && <p className="text-emerald-700">{status.message}</p>}
      </div>
      <p className="mt-2 text-xs text-ink-faint">Only upload work you own or have permission to use. Uploading does not transfer any rights to IPPLY.</p>
    </div>
  );
}
