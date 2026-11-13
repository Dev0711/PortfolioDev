"use client";

import { Check, Copy, FileText, Film, Loader2, RefreshCw, Search, Upload } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { ConfirmDelete, EmptyState, Modal, useSyncedState } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import { deleteMedia, listMedia, registerMedia, touchMedia, updateMediaAlt } from "@/lib/admin/actions/media";
import { MEDIA_BUCKET } from "@/lib/env";
import { ALLOWED_MEDIA_TYPES, validateMediaFile } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/lib/types";
import { cn, formatBytes, slugify } from "@/lib/utils";

export type MediaKind = "image" | "video" | "document";

export function kindOf(mime: string): MediaKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

/** Upload one file to Storage, then register it in the media table. */
async function uploadFile(file: File): Promise<MediaAsset> {
  const problem = validateMediaFile(file);
  if (problem) throw new Error(`${file.name}: ${problem}`);

  const dot = file.name.lastIndexOf(".");
  const extension = dot > -1 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  const base = slugify(dot > -1 ? file.name.slice(0, dot) : file.name) || "file";
  const path = `${kindOf(file.type)}s/${crypto.randomUUID().slice(0, 8)}-${base}.${extension}`;

  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (error) throw new Error(`${file.name}: ${error.message}`);

  const result = await registerMedia({ path, name: file.name, mime_type: file.type, size_bytes: file.size });
  if (!result.ok || !result.data) throw new Error(result.ok ? "Upload could not be recorded." : result.error);
  return result.data;
}

/**
 * Media library grid. Used full-page in Admin → Media, and inside the picker
 * dialog (with `onSelect`) wherever a form needs an image, video or PDF.
 */
export function MediaLibrary({
  initial,
  accept,
  onSelect,
  multiple = false,
}: {
  initial?: MediaAsset[];
  /** Restrict what can be selected/shown, e.g. ["image"]. */
  accept?: MediaKind[];
  onSelect?: (assets: MediaAsset[]) => void;
  multiple?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MediaKind | "all">("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [detail, setDetail] = useState<MediaAsset | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Picker mode: load the library on open (the Media page passes it in).
  useEffect(() => {
    if (initial) return;
    let alive = true;
    listMedia().then((result) => {
      if (!alive) return;
      if (result.ok) setAssets(result.data ?? []);
      else toast.error(result.error);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [initial]);

  async function upload(files: File[]) {
    if (files.length === 0) return;
    setUploading(files.length);
    const added: MediaAsset[] = [];
    for (const file of files) {
      try {
        added.push(await uploadFile(file));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
      setUploading((n) => n - 1);
    }
    setUploading(0);
    if (added.length > 0) {
      setAssets((current) => [...added, ...current.filter((a) => !added.some((n) => n.id === a.id))]);
      toast.success(`${added.length} file${added.length === 1 ? "" : "s"} uploaded`);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload([...event.dataTransfer.files]);
  }

  const visible = assets.filter((asset) => {
    const kind = kindOf(asset.mime_type);
    if (accept && !accept.includes(kind)) return false;
    if (filter !== "all" && kind !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || asset.name.toLowerCase().includes(q) || asset.alt.toLowerCase().includes(q);
  });

  function toggle(asset: MediaAsset) {
    if (!onSelect) {
      setDetail(asset);
      return;
    }
    if (!multiple) {
      onSelect([asset]);
      return;
    }
    setPicked((current) => (current.includes(asset.id) ? current.filter((id) => id !== asset.id) : [...current, asset.id]));
  }

  const kinds: (MediaKind | "all")[] = ["all", ...(accept ?? (["image", "video", "document"] as MediaKind[]))];

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-signal bg-signal/5" : "border-line-strong",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_MEDIA_TYPES.join(",")}
          className="sr-only"
          aria-label="Upload files"
          onChange={(event) => {
            void upload([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="outline" disabled={uploading > 0} onClick={() => inputRef.current?.click()}>
          {uploading > 0 ? <Loader2 className="animate-spin" /> : <Upload />}
          {uploading > 0 ? `Uploading ${uploading}…` : "Upload files"}
        </Button>
        <p className="text-xs text-ink-faint">
          or drag and drop · images up to 8 MB · MP4/WebM up to 50 MB · PDF up to 10 MB
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by type" className="flex gap-1">
          {kinds.length > 2
            ? kinds.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={filter === kind}
                  onClick={() => setFilter(kind)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs capitalize transition-colors",
                    filter === kind ? "bg-surface-2 text-ink" : "text-ink-dim hover:text-ink",
                  )}
                >
                  {kind === "all" ? "All" : `${kind}s`}
                </button>
              ))
            : null}
        </div>
        <label className="relative flex items-center">
          <span className="sr-only">Search media</span>
          <Search aria-hidden className="pointer-events-none absolute left-2.5 size-3.5 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search files"
            className="field-input !w-56 !pl-8"
          />
        </label>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-16 text-ink-faint">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title={assets.length === 0 ? "No files yet" : "Nothing matches"}
            body={assets.length === 0 ? "Upload images, videos or a résumé PDF to use them across the site." : undefined}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((asset) => {
              const selected = picked.includes(asset.id);
              return (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => toggle(asset)}
                    aria-pressed={onSelect && multiple ? selected : undefined}
                    className={cn(
                      "group relative block w-full overflow-hidden rounded-lg border bg-base text-left transition-colors",
                      selected ? "border-signal ring-2 ring-signal/30" : "border-line hover:border-line-strong",
                    )}
                  >
                    <Thumb asset={asset} />
                    <span className="block truncate px-2.5 pt-2 text-xs">{asset.name}</span>
                    <span className="block px-2.5 pb-2 text-[0.6875rem] text-ink-faint">{formatBytes(asset.size_bytes)}</span>
                    {selected ? (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-signal text-background">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {onSelect && multiple ? (
        <div className="sticky bottom-0 mt-5 flex items-center justify-between border-t border-line bg-popover py-3">
          <p className="text-xs text-ink-dim">{picked.length} selected</p>
          <Button
            type="button"
            disabled={picked.length === 0}
            onClick={() => onSelect(assets.filter((asset) => picked.includes(asset.id)))}
          >
            Add selected
          </Button>
        </div>
      ) : null}

      <AssetDetail
        asset={detail}
        onClose={() => setDetail(null)}
        onChanged={(next) => {
          setAssets((current) => current.map((a) => (a.id === next.id ? next : a)));
          setDetail(next);
        }}
        onDeleted={(id) => {
          setAssets((current) => current.filter((a) => a.id !== id));
          setDetail(null);
        }}
      />
    </div>
  );
}

export function Thumb({ asset, className }: { asset: Pick<MediaAsset, "url" | "mime_type" | "alt" | "name">; className?: string }) {
  const kind = kindOf(asset.mime_type);
  return (
    <span className={cn("relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-2", className)}>
      {kind === "image" ? (
        // Plain <img>: admin thumbnails do not need the optimisation pipeline.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.url} alt={asset.alt || asset.name} loading="lazy" className="h-full w-full object-cover" />
      ) : kind === "video" ? (
        <>
          <video src={asset.url} muted preload="metadata" className="h-full w-full object-cover" />
          <Film className="absolute size-6 text-ink drop-shadow" aria-hidden />
        </>
      ) : (
        <FileText className="size-7 text-ink-faint" aria-hidden />
      )}
    </span>
  );
}

function AssetDetail({
  asset,
  onClose,
  onChanged,
  onDeleted,
}: {
  asset: MediaAsset | null;
  onClose: () => void;
  onChanged: (asset: MediaAsset) => void;
  onDeleted: (id: string) => void;
}) {
  const [alt, setAlt] = useSyncedState(asset?.alt ?? "");
  const [busy, setBusy] = useState(false);
  const replaceRef = useRef<HTMLInputElement>(null);


  if (!asset) return <Modal open={false} onClose={onClose} title="Asset">{null}</Modal>;

  async function saveAlt() {
    if (!asset) return;
    setBusy(true);
    const result = await updateMediaAlt(asset.id, alt);
    setBusy(false);
    if (!result.ok) return void toast.error(result.error);
    toast.success("Description saved");
    onChanged({ ...asset, alt: alt.trim() });
  }

  /** Replace the file in place: same path and URL, so every reference updates. */
  async function replace(file: File) {
    if (!asset) return;
    if (file.type !== asset.mime_type) {
      return void toast.error(`Replacement must be the same type (${asset.mime_type}).`);
    }
    const problem = validateMediaFile(file);
    if (problem) return void toast.error(problem);

    setBusy(true);
    const { error } = await createClient()
      .storage.from(MEDIA_BUCKET)
      .update(asset.path, file, { contentType: file.type, cacheControl: "3600", upsert: true });
    if (error) {
      setBusy(false);
      return void toast.error(error.message);
    }
    const result = await touchMedia(asset.id, file.size, file.name);
    setBusy(false);
    if (!result.ok) return void toast.error(result.error);
    toast.success(result.message ?? "File replaced");
    onChanged({ ...asset, size_bytes: file.size, name: file.name });
  }

  async function remove() {
    if (!asset) return;
    setBusy(true);
    const result = await deleteMedia(asset.id);
    setBusy(false);
    if (!result.ok) return void toast.error(result.error);
    toast.success("Asset deleted");
    onDeleted(asset.id);
  }

  return (
    <Modal open onClose={onClose} title={asset.name} description={`${asset.mime_type} · ${formatBytes(asset.size_bytes)}`} size="lg">
      <div className="grid gap-6 md:grid-cols-2">
        <Thumb asset={asset} className="rounded-lg border border-line" />
        <div className="space-y-4">
          <div>
            <label htmlFor="asset-alt" className="mb-1.5 block text-xs font-medium text-ink-dim">
              Description (alt text)
            </label>
            <textarea
              id="asset-alt"
              rows={3}
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              className="field-input"
              placeholder="Describe the image for people who cannot see it"
            />
            <Button type="button" size="sm" variant="outline" className="mt-2" disabled={busy || alt === asset.alt} onClick={saveAlt}>
              Save description
            </Button>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-dim">Public URL</p>
            <div className="flex gap-2">
              <input readOnly value={asset.url} aria-label="Public URL" className="field-input font-mono !text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copy URL"
                onClick={() => navigator.clipboard.writeText(asset.url).then(() => toast.success("URL copied"))}
              >
                <Copy />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <input
              ref={replaceRef}
              type="file"
              accept={asset.mime_type}
              className="sr-only"
              aria-label="Replacement file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void replace(file);
                event.target.value = "";
              }}
            />
            <Button type="button" variant="outline" disabled={busy} onClick={() => replaceRef.current?.click()}>
              {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Replace file
            </Button>
            <ConfirmDelete
              title={`Delete ${asset.name}?`}
              description="Files that are still used on the site cannot be deleted."
              onConfirm={remove}
              pending={busy}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Form field that opens the library as a picker ────────────────────────── */

export function MediaField({
  value,
  onChange,
  accept = ["image"],
  label,
}: {
  value: string | null;
  onChange: (url: string | null, asset?: MediaAsset) => void;
  accept?: MediaKind[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const isVideo = !!value && /\.(mp4|webm)(\?|$)/i.test(value);
  const isPdf = !!value && /\.pdf(\?|$)/i.test(value);

  return (
    <div>
      <div className="flex items-center gap-3 rounded-lg border border-line bg-base/40 p-2.5">
        <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-2">
          {value ? (
            isVideo ? (
              <video src={value} muted preload="metadata" className="h-full w-full object-cover" />
            ) : isPdf ? (
              <FileText className="size-6 text-ink-faint" aria-hidden />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <span className="text-[0.6875rem] text-ink-faint">None</span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[0.6875rem] text-ink-dim">{value ? value.split("/").pop() : `No ${label.toLowerCase()} selected`}</p>
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              {value ? "Replace" : "Choose"}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={`Choose ${label.toLowerCase()}`} size="xl">
        {open ? (
          <MediaLibrary
            accept={accept}
            onSelect={([asset]) => {
              onChange(asset.url, asset);
              setOpen(false);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
