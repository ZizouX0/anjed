"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MoodKey, Settings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { getSettings, saveSettings } from "@/lib/db";

interface AppCtx {
  mood: MoodKey;
  setMood: (m: MoodKey) => void;
  muted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (v: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  startAmbience: () => void;
  ready: boolean;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return c;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const interactedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Chargement des préférences (mood/son) depuis le stockage local.
  useEffect(() => {
    let alive = true;
    getSettings()
      .then((s) => {
        if (alive) setSettings(s);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Enregistre le service worker (installation PWA + coque hors-ligne).
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Applique le mood au <html> -> bascule toute la palette (data-mood).
  useEffect(() => {
    document.documentElement.dataset.mood = settings.mood;
  }, [settings.mood]);

  // Volume / mute.
  useEffect(() => {
    const a = audioRef.current;
    if (a) a.volume = settings.muted ? 0 : settings.volume;
  }, [settings.volume, settings.muted]);

  // Changement de mood -> changement de piste (lecture si déjà interagi).
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const src = `/music/${settings.mood}.mp3`;
    if (!a.src.endsWith(src)) {
      a.src = src;
      a.load();
    }
    if (interactedRef.current && !settings.muted) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [settings.mood, settings.muted]);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next).catch(() => {});
      return next;
    });
  }, []);

  const setMood = useCallback(
    (m: MoodKey) => {
      interactedRef.current = true;
      update({ mood: m });
    },
    [update],
  );

  const setVolume = useCallback((v: number) => update({ volume: v }), [update]);

  const toggleMute = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, muted: !prev.muted };
      saveSettings(next).catch(() => {});
      const a = audioRef.current;
      if (a && !next.muted && interactedRef.current) {
        a.play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
      return next;
    });
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    interactedRef.current = true;
    if (a.paused) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }, []);

  const startAmbience = useCallback(() => {
    const a = audioRef.current;
    interactedRef.current = true;
    if (a && !settings.muted) {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [settings.muted]);

  return (
    <Ctx.Provider
      value={{
        mood: settings.mood,
        setMood,
        muted: settings.muted,
        toggleMute,
        volume: settings.volume,
        setVolume,
        isPlaying,
        togglePlay,
        startAmbience,
        ready,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        loop
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </Ctx.Provider>
  );
}
