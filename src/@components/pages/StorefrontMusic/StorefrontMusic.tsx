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

const readSaved = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null") as {
      src?: string;
      title?: string;
      time?: number;
      paused?: boolean;
    } | null;
  } catch {
    return null;
  }
};

const writeSaved = (value: {
  src: string;
  title: string;
  time: number;
  paused: boolean;
}) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota */
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
        const ordered = shuffle(playable);
        const savedIndex = saved?.src
          ? ordered.findIndex((item) => item.src === saved.src)
          : -1;
        if (savedIndex > 0) {
          const [picked] = ordered.splice(savedIndex, 1);
          ordered.unshift(picked);
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

    const saved = readSaved();
    if (audio.getAttribute("src") !== song.src) {
      audio.src = song.src;
    }
    audio.volume = 0.6;
    audio.loop = songs.length < 2;

    const applySavedTime = () => {
      if (saved?.src === song.src && Number(saved.time) > 1) {
        try {
          audio.currentTime = Number(saved.time);
        } catch {
          /* ignore seek */
        }
      }
    };

    const persist = () => {
      writeSaved({
        src: song.src,
        title: song.title,
        time: audio.currentTime || 0,
        paused: userPausedRef.current,
      });
    };

    const start = async () => {
      applySavedTime();
      if (userPausedRef.current) {
        setPlaying(false);
        return;
      }
      audio.muted = false;
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        audio.muted = true;
        try {
          await audio.play();
          setPlaying(true);
        } catch {
          setPlaying(false);
        }
      }
    };

    audio.addEventListener("loadedmetadata", applySavedTime);
    audio.addEventListener("timeupdate", persist);
    void start();

    return () => {
      audio.removeEventListener("loadedmetadata", applySavedTime);
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

  if (!song) return <audio ref={audioRef} hidden playsInline preload="auto" />;

  return (
    <div
      data-rangonaa-player=""
      className="fixed bottom-20 right-4 z-[80] lg:bottom-6"
    >
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        preload="auto"
        onEnded={nextSong}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          if (!audioRef.current?.ended) setPlaying(false);
        }}
      />
      <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-2 shadow-xl">
        <button
          type="button"
          aria-label={playing ? "Pause music" : "Play music"}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#9b1b30] text-white"
          onClick={toggle}
        >
          {playing ? "II" : "▶"}
        </button>
        <div className="pr-3">
          <p className="max-w-40 truncate text-sm font-semibold text-[#3a2418]">
            {song.title}
          </p>
          <p className="text-[11px] text-[#3a2418]/60">
            {playing ? "Now playing" : "Tap to play"}
          </p>
        </div>
      </div>
    </div>
  );
}
