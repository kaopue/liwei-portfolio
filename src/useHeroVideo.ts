import { useCallback, useEffect, useRef, useState } from "react";

type VideoMode = "mobile" | "desktop";
type NetworkInformation = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

export function useHeroVideo() {
  const heroRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackAllowed = useRef(false);
  const [videoMode, setVideoMode] = useState<VideoMode | null>(null);
  const [readyMode, setReadyMode] = useState<VideoMode | null>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    let cancelled = false;
    let ready = false;
    let idleHandle: number | undefined;
    let fallbackHandle: number | undefined;
    const bounds = heroRef.current?.getBoundingClientRect();
    let inView = !!bounds && bounds.bottom > 0 && bounds.top < window.innerHeight;

    const update = () => {
      if (cancelled) return;
      const restricted = motion.matches || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
      // Visibility, rather than an old section hash, determines whether the hero plays.
      const eligible = ready && inView && document.visibilityState === "visible" && !restricted;
      const active = eligible;
      playbackAllowed.current = active;

      if (restricted) {
        setVideoMode(null);
      } else if (eligible) {
        setVideoMode(mobile.matches ? "mobile" : "desktop");
      }

      const video = videoRef.current;
      if (video) {
        if (active && video.paused && !video.error) {
          video.muted = true;
          void video.play().catch(() => {});
        }
        if (!active && !video.paused) video.pause();
      }
    };

    // Wait for critical images and the first page load before using bandwidth for motion.
    const scheduleVideo = () => {
      if (cancelled) return;
      const start = () => {
        ready = true;
        update();
      };
      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        fallbackHandle = window.setTimeout(start, 400);
      }
    };
    void (posterRef.current?.decode() ?? Promise.resolve()).catch(() => {}).then(() => {
      if (cancelled) return;
      if (document.readyState === "complete") scheduleVideo();
      else window.addEventListener("load", scheduleVideo, { once: true });
    });

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.01;
        update();
      }, { threshold: 0.01 })
      : null;
    if (heroRef.current) observer?.observe(heroRef.current);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("hashchange", update);
    window.addEventListener("pageshow", update);
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    connection?.addEventListener("change", update);

    return () => {
      cancelled = true;
      playbackAllowed.current = false;
      observer?.disconnect();
      window.removeEventListener("load", scheduleVideo);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (fallbackHandle !== undefined) window.clearTimeout(fallbackHandle);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("hashchange", update);
      window.removeEventListener("pageshow", update);
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playbackAllowed.current) void video.play().catch(() => {});
    else video.pause();
    return () => video.pause();
  }, [videoMode]);

  const onVideoPlaying = useCallback(() => {
    if (!playbackAllowed.current) {
      videoRef.current?.pause();
      return;
    }
    setReadyMode(videoMode);
  }, [videoMode]);

  const onVideoCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (video && playbackAllowed.current && video.paused) void video.play().catch(() => {});
  }, []);

  const onVideoError = useCallback(() => {
    setReadyMode(null);
  }, []);

  return {
    heroRef, posterRef, videoRef, videoMode,
    videoReady: videoMode !== null && readyMode === videoMode,
    onVideoPlaying, onVideoCanPlay, onVideoError,
  };
}
