"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const FADE_OUT_MS = 1000;

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
  ms = FADE_OUT_MS,
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

const warmAudio = (src: string) => {
  if (typeof document === "undefined" || !src) return;
  let link = document.getElementById("rangonaa-audio-preload") as HTMLLinkElement | null;
  if (link?.getAttribute("href") === src) return;
  if (!link) {
    link = document.createElement("link");
    link.id = "rangonaa-audio-preload";
    link.rel = "preload";
    link.as = "audio";
    document.head.appendChild(link);
  }
  link.setAttribute("fetchpriority", "high");
  link.href = src;
};

type Opening = { src: string; time: number; reloads: number; changeSong: boolean };

let openingCache: Opening | null = null;

const decideOpening = (): Opening => {
  if (openingCache) return openingCache;
  const saved = readSaved();
  let reloads = Number(saved?.reloads) || 0;
  const reloaded = typeof window !== "undefined" && takeDocumentReload();
  if (reloaded) reloads += 1;
  const changeSong = Boolean(reloaded && reloads >= 2 && saved?.src);
  openingCache = {
    src: changeSong ? "" : String(saved?.src || ""),
    time: changeSong ? 0 : Number(saved?.time) || 0,
    reloads,
    changeSong,
  };
  if (
    openingCache.src &&
    typeof window !== "undefined" &&
    !isQuietPath(window.location.pathname)
  ) {
    warmAudio(openingCache.src);
  }
  return openingCache;
};

let playlistPromise: Promise<Song[]> | null = null;

const fetchPlaylist = () => {
  if (playlistPromise) return playlistPromise;
  const endpoint = ENV.ApiEndpoint?.trim();
  if (!endpoint || typeof window === "undefined") {
    playlistPromise = Promise.resolve([]);
    return playlistPromise;
  }
  playlistPromise = fetch(`${endpoint.replace(/\/$/, "")}/storefront-music`)
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => {
      const playable = (Array.isArray(body?.data) ? body.data : []).filter(
        (item: Song) => item?.src
      ) as Song[];
      return playable;
    })
    .catch(() => [] as Song[]);
  return playlistPromise;
};

if (typeof window !== "undefined" && !isQuietPath(window.location.pathname)) {
  decideOpening();
  void fetchPlaylist();
}

export default function StorefrontMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef(false);
  const volumeRef = useRef(0.4);
  const overRef = useRef(false);
  const draggingRef = useRef(false);
  const skipClickRef = useRef(false);
  const holdRef = useRef<number | null>(null);
  const pressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const handledPointerRef = useRef(false);
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
  const loadedSrcRef = useRef("");

  const pendingSrcRef = useRef("");
  const seekListenerRef = useRef<(() => void) | null>(null);

  const clearSeek = (audio: HTMLAudioElement) => {
    const listener = seekListenerRef.current;
    if (!listener) return;
    audio.removeEventListener("playing", listener);
    audio.removeEventListener("progress", listener);
    seekListenerRef.current = null;
  };

  const hearNow = (audio: HTMLAudioElement) => {
    stopFade(fadeJobRef.current, false);
    audio.muted = false;
    audio.volume = volumeRef.current;
  };

  const seekAfterStart = (audio: HTMLAudioElement, src: string, time: number) => {
    clearSeek(audio);
    if (time <= 1) return;
    const listener = () => {
      if (loadedSrcRef.current !== src) {
        clearSeek(audio);
        return;
      }
      if (audio.paused || Math.abs((audio.currentTime || 0) - time) <= 1) {
        if (!audio.paused) clearSeek(audio);
        return;
      }
      try {
        if (!audio.seekable.length || audio.seekable.end(audio.seekable.length - 1) < time) return;
        audio.currentTime = time;
      } catch {
        return;
      }
      clearSeek(audio);
    };
    seekListenerRef.current = listener;
    audio.addEventListener("playing", listener);
    audio.addEventListener("progress", listener);
  };

  const startPlayback = (audio: HTMLAudioElement, time = 0) => {
    if (quietRef.current || userPausedRef.current) return;
    if (!audio.paused && !audio.muted) return;
    if (pendingSrcRef.current && pendingSrcRef.current === loadedSrcRef.current) return;
    const src = loadedSrcRef.current;
    pendingSrcRef.current = src;
    audio.autoplay = true;
    hearNow(audio);

    let tries = 0;
    const finish = () => {
      if (pendingSrcRef.current === src) pendingSrcRef.current = "";
    };
    const play = () => {
      if (quietRef.current || userPausedRef.current) {
        finish();
        return;
      }
      seekAfterStart(audio, src, time);
      void audio.play().then(() => {
        finish();
        if (quietRef.current || userPausedRef.current) return;
        if (loadedSrcRef.current !== src) return;
        hearNow(audio);
        setPlaying(true);
      }).catch((err) => {
        if (quietRef.current || userPausedRef.current) {
          finish();
          return;
        }
        const name = err instanceof DOMException ? err.name : "";
        if (name === "AbortError" && tries < 3) {
          tries += 1;
          window.setTimeout(play, 120);
          return;
        }
        finish();
        audio.muted = true;
        void audio.play().then(() => setPlaying(false)).catch(() => setPlaying(false));
      });
    };

    play();
  };

  const bindSrc = (audio: HTMLAudioElement, src: string, time = 0) => {
    warmAudio(src);
    const changed = loadedSrcRef.current !== src;
    if (changed) {
      loadedSrcRef.current = src;
      audio.preload = "auto";
      audio.loop = false;
      audio.src = src;
    }
    startPlayback(audio, time);
  };

  useLayoutEffect(() => {
    if (quietRef.current) return;
    const opening = decideOpening();
    const audio = audioRef.current;
    if (!audio || !opening.src) return;
    userPausedRef.current = false;
    bindSrc(audio, opening.src, opening.time);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchPlaylist().then((playable) => {
      if (cancelled || !playable.length) return;
      const opening = decideOpening();
      const saved = readSaved();
      const changeSong = opening.changeSong && playable.length > 1;
      const reloads = changeSong ? 0 : opening.reloads;

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

      const first = ordered[0];
      warmAudio(first.src);
      const audio = audioRef.current;
      if (audio && !quietRef.current) {
        const resumeTime =
          first.src === saved?.src && !changeSong ? Number(saved?.time) || 0 : 0;
        userPausedRef.current = false;
        bindSrc(audio, first.src, resumeTime);
      }
      setSongs(ordered);
      setIndex(0);
    });
    return () => {
      cancelled = true;
    };
    // bindSrc is stable enough for the first playlist load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song?.src || quietRef.current) return;

    const saved = readSaved();
    const time = saved?.src === song.src ? Number(saved.time) || 0 : 0;
    if (!userPausedRef.current) bindSrc(audio, song.src, time);

    const persist = () => {
      writeSaved({
        src: song.src,
        title: song.title,
        time: audio.currentTime || 0,
        paused: userPausedRef.current,
      });
    };
    const onPlaying = () => setPlaying(!audio.muted);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", persist);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", persist);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song?.src, quiet]);

  useEffect(() => {
    const unlock = (event: Event) => {
      const audio = audioRef.current;
      const target = event.target as Node | null;
      if (target instanceof Element && target.closest("[data-rangonaa-player]")) {
        return;
      }
      if (!audio?.src || userPausedRef.current || quietRef.current) return;
      if (!audio.paused && !audio.muted) return;
      hearNow(audio);
      void audio.play().then(() => {
        setPlaying(true);
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
      stopFade(fadeJobRef.current, false);
      audio.volume = volumeRef.current;
      void audio.play().then(() => {
        setPlaying(true);
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
    hearNow(audio);
    void audio.play().then(() => {
      if (quietRef.current || userPausedRef.current) return;
      setPlaying(true);
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
      stopFade(fadeJobRef.current, false);
      audio.muted = false;
      audio.volume = volumeRef.current;
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
            if (event.target instanceof Element && event.target.closest("[data-rangonaa-play]")) return;
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
            data-rangonaa-play=""
            aria-label={playing ? "Pause music" : "Play music"}
            className="relative z-10 grid h-11 w-11 shrink-0 touch-manipulation select-none place-items-center rounded-full bg-[#9b1b30] text-[11px] text-white shadow-lg lg:h-9 lg:w-9"
            onPointerDown={(event) => {
              event.stopPropagation();
              handledPointerRef.current = false;
              pressOriginRef.current = { x: event.clientX, y: event.clientY };
              clearHold();
              if (event.pointerType !== "touch") return;
              holdRef.current = window.setTimeout(() => {
                holdRef.current = null;
                skipClickRef.current = true;
                setOpen(true);
              }, 420);
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
              const origin = pressOriginRef.current;
              pressOriginRef.current = null;
              const wasLong = holdRef.current === null && skipClickRef.current;
              clearHold();
              if (!origin || wasLong) return;
              const moved = Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 12;
              if (moved) {
                skipClickRef.current = false;
                return;
              }
              handledPointerRef.current = true;
              toggle();
            }}
            onPointerCancel={() => {
              pressOriginRef.current = null;
              clearHold();
            }}
            onClick={() => {
              if (handledPointerRef.current) {
                handledPointerRef.current = false;
                return;
              }
              toggle();
            }}
          >
            <span className="pointer-events-none">{playing ? "II" : "▶"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
