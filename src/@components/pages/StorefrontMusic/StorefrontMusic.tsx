"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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

const FADE_MS = 1000;

type FadeJob = {
  id: number | null;
  settle: ((finished: boolean) => void) | null;
};

const stopFade = (job: FadeJob, finished: boolean) => {
  if (job.id !== null) {
    cancelAnimationFrame(job.id);
    job.id = null;
  }
  const settle = job.settle;
  job.settle = null;
  settle?.(finished);
};

const fadeVolume = (
  audio: HTMLAudioElement,
  target: number,
  job: FadeJob,
  ms = FADE_MS,
) => {
  stopFade(job, false);
  const from = audio.volume;
  if (Math.abs(from - target) < 0.015) {
    audio.volume = target;
    return Promise.resolve(true);
  }
  const start = performance.now();
  return new Promise<boolean>((resolve) => {
    job.settle = resolve;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      audio.volume = from + (target - from) * t;
      if (t < 1) {
        job.id = requestAnimationFrame(step);
        return;
      }
      job.id = null;
      audio.volume = target;
      job.settle = null;
      resolve(true);
    };
    job.id = requestAnimationFrame(step);
  });
};

const isQuietPath = (pathname: string) =>
  /^\/(admin|checkout|payment)(\/|$)/.test(pathname);

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
  const volumeRef = useRef(0.4);
  const overRef = useRef(false);
  const draggingRef = useRef(false);
  const skipClickRef = useRef(false);
  const holdRef = useRef<number | null>(null);
  const fadeJobRef = useRef<FadeJob>({ id: null, settle: null });
  const quietRef = useRef(false);
  const pathname = usePathname() || "";
  const quiet = isQuietPath(pathname);
  quietRef.current = quiet;
  const [songs, setSongs] = useState<Song[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(0.4);

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
    if (!quietRef.current) userPausedRef.current = false;
    audio.volume = 0;
    audio.loop = false;
    audio.autoplay = !quietRef.current;

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

    const fadeIn = () => {
      if (stopped || userPausedRef.current || quietRef.current) return;
      void fadeVolume(audio, volumeRef.current, fadeJobRef.current);
    };

    let tries = 0;
    const ensurePlaying = async () => {
      if (stopped || userPausedRef.current || quietRef.current) return;
      if (!audio.paused && !audio.muted) {
        setPlaying(true);
        fadeIn();
        return;
      }
      try {
        audio.muted = false;
        audio.volume = 0;
        await audio.play();
        if (!stopped) setPlaying(true);
        fadeIn();
      } catch (err) {
        if (stopped || userPausedRef.current) return;
        const name = err instanceof DOMException ? err.name : "";
        if (name === "AbortError" && tries < 3) {
          tries += 1;
          window.setTimeout(() => void ensurePlaying(), 200);
          return;
        }
        audio.muted = true;
        try {
          await audio.play();
          if (!stopped) setPlaying(false);
        } catch {
          if (!stopped) setPlaying(false);
        }
      }
    };

    const onPlaying = () => {
      if (stopped) return;
      setPlaying(!audio.muted);
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
      if (!audio?.src || userPausedRef.current || quietRef.current) return;
      if (!audio.paused && !audio.muted) return;
      audio.muted = false;
      audio.volume = 0;
      void audio.play().then(() => {
        setPlaying(true);
        void fadeVolume(audio, volumeRef.current, fadeJobRef.current);
      }).catch(() => undefined);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("touchstart", unlock, true);
    window.addEventListener("keydown", unlock, true);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
      window.removeEventListener("keydown", unlock, true);
    };
  }, []);

  const advance = () => {
    userPausedRef.current = false;
    const audio = audioRef.current;
    if (songs.length < 2) {
      if (!audio) return;
      audio.currentTime = 0;
      audio.volume = 0;
      void audio.play().then(() => {
        setPlaying(true);
        void fadeVolume(audio, volumeRef.current, fadeJobRef.current);
      }).catch(() => undefined);
      return;
    }
    setIndex((current) => (current + 1) % songs.length);
  };

  const nextSong = () => {
    const audio = audioRef.current;
    if (!audio || audio.paused || audio.ended) {
      advance();
      return;
    }
    void fadeVolume(audio, 0, fadeJobRef.current).then((finished) => {
      if (!finished || userPausedRef.current || quietRef.current) return;
      advance();
    });
  };

  const clearHold = () => {
    if (holdRef.current === null) return;
    window.clearTimeout(holdRef.current);
    holdRef.current = null;
  };

  const changeVolume = (value: number) => {
    stopFade(fadeJobRef.current, false);
    volumeRef.current = value;
    setVolume(value);
    const audio = audioRef.current;
    if (audio) audio.volume = value;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio?.src) return;
    if (quiet) {
      setOpen(false);
      if (audio.paused) {
        setPlaying(false);
        return;
      }
      void fadeVolume(audio, 0, fadeJobRef.current).then((finished) => {
        if (!finished || !quietRef.current) return;
        audio.pause();
        setPlaying(false);
      });
      return;
    }
    if (userPausedRef.current) return;
    audio.muted = false;
    audio.volume = 0;
    void audio.play().then(() => {
      if (quietRef.current || userPausedRef.current) return;
      setPlaying(true);
      void fadeVolume(audio, volumeRef.current, fadeJobRef.current);
    }).catch(() => undefined);
  }, [quiet]);

  useEffect(() => {
    const up = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (!overRef.current) setOpen(false);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      const target = event.target as Node | null;
      if (target instanceof Element && target.closest("[data-rangonaa-player]")) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", close, true);
    return () => window.removeEventListener("pointerdown", close, true);
  }, [open]);

  const toggle = () => {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    const audio = audioRef.current;
    if (!audio || !song) return;
    if (audio.paused || audio.muted) {
      userPausedRef.current = false;
      audio.muted = false;
      audio.volume = 0;
      void audio.play().then(() => {
        setPlaying(true);
        void fadeVolume(audio, volumeRef.current, fadeJobRef.current);
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
    void fadeVolume(audio, 0, fadeJobRef.current).then((finished) => {
      if (!finished || !userPausedRef.current) return;
      audio.pause();
      setPlaying(false);
      writeSaved({
        src: song.src,
        title: song.title,
        time: audio.currentTime || 0,
        paused: true,
      });
    });
  };

  return (
    <div
      data-rangonaa-player=""
      className={`fixed bottom-20 right-4 z-[80] lg:bottom-6 ${song && !quiet ? "" : "pointer-events-none"}`}
    >
      <audio
        ref={audioRef}
        src={song?.src}
        autoPlay
        playsInline
        preload="auto"
        onEnded={advance}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          if (userPausedRef.current) setPlaying(false);
        }}
      />
      {song && !quiet ? (
        <div
          className="flex items-center"
          onMouseEnter={() => {
            overRef.current = true;
            setOpen(true);
          }}
          onMouseLeave={() => {
            overRef.current = false;
            if (!draggingRef.current) setOpen(false);
          }}
          onPointerDown={(event) => {
            if (event.pointerType !== "touch") return;
            clearHold();
            holdRef.current = window.setTimeout(() => {
              holdRef.current = null;
              skipClickRef.current = true;
              setOpen(true);
            }, 420);
          }}
          onPointerUp={clearHold}
          onPointerCancel={clearHold}
        >
          <div
            className={`flex items-center overflow-hidden transition-all duration-200 ${
              open ? "mr-1.5 max-w-40 opacity-100" : "pointer-events-none max-w-0 opacity-0"
            }`}
          >
            <div className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-2.5 pr-1 shadow-lg">
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                className="h-1 w-16 cursor-pointer accent-[#9b1b30]"
                onPointerDown={() => {
                  draggingRef.current = true;
                }}
                onChange={(event) => changeVolume(Number(event.target.value))}
              />
              <button
                type="button"
                aria-label="Next song"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] text-[#9b1b30]"
                onClick={(event) => {
                  event.stopPropagation();
                  nextSong();
                }}
              >
                ››
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label={playing ? "Pause music" : "Play music"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#9b1b30] text-[11px] text-white shadow-lg"
            onClick={toggle}
          >
            {playing ? "II" : "▶"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
