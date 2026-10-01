"use client";

import { useEffect, useRef, useState } from "react";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import Icon from "@admin/components/core/Icon/Icon";
import { ToastService } from "@admin/utils/toastr.service";
import { UploadService } from "@admin/@services/apis/Upload/Upload.service";
import { StorefrontMusicService } from "@admin/@services/apis/CustomerFront/StorefrontMusicService/StorefrontMusic.service";

type Song = {
  _id: string;
  title: string;
  src: string;
  is_active: boolean;
};

export default function StorefrontMusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await StorefrontMusicService.list();
      if (res?.success) setSongs(res.data || []);
      else ToastService.error(res?.message || "Could not load songs");
    } catch (err: unknown) {
      ToastService.error(err instanceof Error ? err.message : "Could not load songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const errorText = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    if (err && typeof err === "object" && "message" in err) {
      const message = (err as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    return fallback;
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setSaving(true);
    try {
      const res = await UploadService.uploadFileDirect(file, "storefront-music");
      const url = res?.data?.fileUrl as string | undefined;
      if (!url) {
        ToastService.error(res?.message || "Upload failed");
        return;
      }
      const songTitle =
        title.trim() ||
        file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      const created = await StorefrontMusicService.create({
        title: songTitle,
        src: url,
        is_active: true,
      });
      if (!created?.success) {
        ToastService.error(created?.message || "Could not save song");
        return;
      }
      setTitle("");
      setSrc("");
      ToastService.success("Song saved");
      await load();
    } catch (err: unknown) {
      ToastService.error(errorText(err, "Could not save song"));
    } finally {
      setSaving(false);
    }
  };

  const addSong = async () => {
    if (!title.trim() || !src.trim()) {
      ToastService.error("Title and audio are required");
      return;
    }
    setSaving(true);
    try {
      const res = await StorefrontMusicService.create({
        title: title.trim(),
        src: src.trim(),
        is_active: true,
      });
      if (!res?.success) {
        ToastService.error(res?.message || "Could not add song");
        return;
      }
      setTitle("");
      setSrc("");
      ToastService.success("Song added");
      await load();
    } catch (err: unknown) {
      ToastService.error(errorText(err, "Could not add song"));
    } finally {
      setSaving(false);
    }
  };

  const playSong = (song: Song) => {
    const audio = audioRef.current;
    if (!audio || !song.src) return;

    if (playingId === song._id && !audio.paused) {
      audio.pause();
      setPlayingId(null);
      return;
    }

    if (audio.getAttribute("src") !== song.src) {
      audio.src = song.src;
    }
    audio.volume = 0.6;
    void audio.play().then(() => setPlayingId(song._id)).catch(() => {
      setPlayingId(null);
      ToastService.error("Could not play this song");
    });
  };

  const toggle = async (song: Song) => {
    try {
      const res = await StorefrontMusicService.update(song._id, {
        is_active: !song.is_active,
      });
      if (!res?.success) {
        ToastService.error(res?.message || "Could not update song");
        return;
      }
      setSongs((prev) =>
        prev.map((item) =>
          item._id === song._id ? { ...item, is_active: !item.is_active } : item
        )
      );
    } catch (err: unknown) {
      ToastService.error(err instanceof Error ? err.message : "Could not update song");
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await StorefrontMusicService.remove(id);
      if (!res?.success) {
        ToastService.error(res?.message || "Could not delete song");
        return;
      }
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
      setSongs((prev) => prev.filter((item) => item._id !== id));
      ToastService.success("Song deleted");
    } catch (err: unknown) {
      ToastService.error(err instanceof Error ? err.message : "Could not delete song");
    }
  };

  const activeCount = songs.filter((song) => song.is_active).length;

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 w-full">
        <PageHeader title="Storefront Music" />

        <div className="glass-card mb-4 overflow-hidden rounded-2xl">
          <div className="premium-table-toolbar">
            <div>
              <p className="premium-table-toolbar-title">Add a track</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                A chosen file saves straight into the playlist. Active tracks play at random on the customer site.
              </p>
            </div>
            <span className="premium-table-toolbar-meta">
              {activeCount} playing
            </span>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_0.8fr] md:p-5">
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Title
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Audio URL
                </span>
                <input
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)]"
                  value={src}
                  onChange={(e) => setSrc(e.target.value)}
                  placeholder="https://..."
                />
              </label>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                disabled={saving}
                onClick={() => void addSong()}
              >
                <Icon name="add" size={18} />
                {saving ? "Saving..." : "Add song"}
              </button>
            </div>

            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[color-mix(in_srgb,var(--color-primary)_35%,var(--border))] bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--bg-surface))] px-4 text-center transition hover:border-[var(--color-primary)]">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,white)] text-[var(--color-primary)]">
                <Icon name="upload_file" size={22} />
              </span>
              <span className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                {saving ? "Saving track..." : "Drop an audio file"}
              </span>
              <span className="mt-1 text-xs text-[var(--text-muted)]">
                MP3, M4A, or WAV. It saves as soon as you choose it.
              </span>
              <input
                className="sr-only"
                type="file"
                accept="audio/*"
                disabled={saving}
                onChange={(e) => void onFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <div className="data-table-card glass-card overflow-hidden rounded-2xl">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Playlist</p>
            <span className="premium-table-toolbar-meta">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </span>
          </div>

          {loading ? (
            <p className="px-5 py-10 text-sm text-[var(--text-muted)]">Loading songs...</p>
          ) : songs.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">No songs yet</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Upload a track to start the customer playlist.
              </p>
            </div>
          ) : (
            <>
            <audio
              ref={audioRef}
              hidden
              preload="none"
              onEnded={() => setPlayingId(null)}
            />
            <ul>
              {songs.map((song) => {
                const isPlaying = playingId === song._id;
                return (
                <li
                  key={song._id}
                  className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] px-4 py-3.5 md:px-5"
                >
                  <button
                    type="button"
                    aria-label={isPlaying ? "Pause song" : "Play song"}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--bg-surface))] text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,var(--bg-surface))]"
                    onClick={() => playSong(song)}
                  >
                    <Icon name={isPlaying ? "pause" : "play_arrow"} size={20} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">{song.src}</p>
                  </div>
                  <button
                    type="button"
                    className={`table-role-badge ${song.is_active ? "is-approved" : "is-neutral"}`}
                    onClick={() => void toggle(song)}
                  >
                    {song.is_active ? "Active" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    onClick={() => void remove(song._id)}
                  >
                    <Icon name="delete" size={16} variant="outlined" />
                    Delete
                  </button>
                </li>
                );
              })}
            </ul>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
