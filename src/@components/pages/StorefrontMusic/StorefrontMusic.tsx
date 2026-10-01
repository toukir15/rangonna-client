"use client";

import { useEffect, useRef, useState } from "react";
import { ENV } from "@/@config/env.config";

type Song = { _id?: string; title: string; src: string };

const STORAGE_KEY = "rangonaa-music";

const shuffle = (list: Song[]) => {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

type SavedMusic = {
  src?: string;
  title?: string;
  time?: number;
  paused?: boolean;
  reloads?: number;
};

const readSaved = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") as SavedMusic | null;
  } catch {
    return null;
  }
};

const writeSaved = (value: {
  src: string;
  title: string;
  time: number;
  paused: boolean;
  reloads?: number;
}) => {
  try {
    const prev = readSaved();
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        reloads: prev?.reloads ?? 0,
        ...value,
      })
    );
  } catch {
    /* ignore quota */
  }
};

let reloadCountedThisDocument = false;

const takeDocumentReload = () => {
  if (reloadCountedThisDocument) return false;
  reloadCountedThisDocument = true;
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    return entry?.type === "reload";
  } catch {
    return false;
  }
};

export default function StorefrontMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const song = songs[index];

  useEffect(() => {
    const endpoint = ENV.ApiEndpoint?.trim();
    if (!endpoint) return;

    fetch(`${endpoint.replace(/\/$/, "")}/storefront-music`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const playable = (Array.isArray(body?.data) ? body.data : []).filter(
          (item: Song) => item?.src
        ) as Song[];
        if (!playable.length) return;

        const saved = readSaved();
        let reloads = Number(saved?.reloads) || 0;
        const reloaded = takeDocumentReload();
        if (reloaded) reloads += 1;
        const changeSong = reloaded && reloads >= 2 && playable.length > 1;
        if (changeSong) reloads = 0;

        let ordered = shuffle(playable);
        const pool =
          changeSong && saved?.src
            ? ordered.filter((item) => item.src !== saved.src)
            : [];
        if (pool.length) {
          const next = pool[Math.floor(Math.random() * pool.length)];
          ordered = [next, ...ordered.filter((item) => item.src !== next.src)];
          writeSaved({
            src: next.src,
            title: next.title,
            time: 0,
            paused: false,
            reloads,
          });
        } else if (saved?.src) {
          const savedIndex = ordered.findIndex((item) => item.src === saved.src);
          if (savedIndex > 0) {
            const [picked] = ordered.splice(savedIndex, 1);
            ordered.unshift(picked);
          }
          const sameSong = ordered[0].src === saved.src;
          writeSaved({
            src: ordered[0].src,
            title: ordered[0].title,
            time: sameSong ? Number(saved.time) || 0 : 0,
            paused: false,
            reloads,
          });
        } else {
          writeSaved({
            src: ordered[0].src,
            title: ordered[0].title,
            time: 0,
            paused: false,
            reloads,
          });
        }
        userPausedRef.current = false;
        setSongs(ordered);
        setIndex(0);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.src) return;

    let stopped = false;
    let didSeek = false;
    userPausedRef.current = false;
    audio.volume = 0.6;
    audio.loop = songs.length < 2;
    audio.autoplay = true;

    const persist = () => {
      writeSaved({
        src: song.src,
        title: song.title,
        time: audio.currentTime || 0,
        paused: userPausedRef.current,
      });
    };

    const seekAfterStart = () => {
      if (didSeek || stopped) return;
      didSeek = true;
      const saved = readSaved();
      const time = Number(saved?.time);
      if (saved?.src !== song.src || time <= 1) return;
      if (Math.abs(audio.currentTime - time) <= 1) return;
      const resume = () => {
        audio.removeEventListener("seeked", resume);
        if (stopped || userPausedRef.current || !audio.paused) return;
        void audio.play().catch(() => {
          audio.muted = true;
          void audio.play().catch(() => undefined);
        });
      };
      audio.addEventListener("seeked", resume);
      try {
        audio.currentTime = time;
      } catch {
        audio.removeEventListener("seeked", resume);
      }
    };

    const ensurePlaying = async () => {
      if (stopped || userPausedRef.current || !audio.paused) {
        if (!audio.paused && !stopped) setPlaying(true);
        return;
      }
      try {
        audio.muted = false;
        await audio.play();
        if (!stopped) setPlaying(true);
      } catch (err) {
        if (stopped || userPausedRef.current) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        audio.muted = true;
        try {
          await audio.play();
          if (!stopped) setPlaying(true);
        } catch {
          if (!stopped) setPlaying(false);
        }
      }
    };

    const onPlaying = () => {
      if (stopped) return;
      setPlaying(true);
      seekAfterStart();
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", persist);
    const kick = window.setTimeout(() => void ensurePlaying(), 0);

    return () => {
      stopped = true;
      window.clearTimeout(kick);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", persist);
    };
  }, [song?.src, song?.title, songs.length]);

  useEffect(() => {
    const unlock = (event: Event) => {
      const audio = audioRef.current;
      const target = event.target as Node | null;
      if (target instanceof Element && target.closest("[data-rangonaa-player]")) {
        return;
      }
      if (!audio?.src || userPausedRef.current) return;
      audio.muted = false;
      void audio.play().then(() => setPlaying(true)).catch(() => undefined);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  const nextSong = () => {
    userPausedRef.current = false;
    if (songs.length < 2) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      void audio.play().then(() => setPlaying(true)).catch(() => undefined);
      return;
    }
    setIndex((current) => (current + 1) % songs.length);
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    if (audio.paused) {
      userPausedRef.current = false;
      audio.muted = false;
      void audio.play().then(() => {
        setPlaying(true);
        writeSaved({
          src: song.src,
          title: song.title,
          time: audio.currentTime || 0,
          paused: false,
        });
      }).catch(() => undefined);
      return;
    }
    userPausedRef.current = true;
    audio.pause();
    setPlaying(false);
    writeSaved({
      src: song.src,
      title: song.title,
      time: audio.currentTime || 0,
      paused: true,
    });
  };

  return (
    <div
      data-rangonaa-player=""
      className={`fixed bottom-20 right-4 z-[80] lg:bottom-6 ${song ? "" : "pointer-events-none"}`}
    >
      <audio
        ref={audioRef}
        src={song?.src}
        autoPlay
        playsInline
        preload="auto"
        onEnded={nextSong}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          if (userPausedRef.current) setPlaying(false);
        }}
      />
      {song ? (
        <button
          type="button"
          aria-label={playing ? "Pause music" : "Play music"}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#9b1b30] text-[11px] text-white shadow-lg"
          onClick={toggle}
        >
          {playing ? "II" : "▶"}
        </button>
      ) : null}
    </div>
  );
}
