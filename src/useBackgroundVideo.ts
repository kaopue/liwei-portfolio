import { useCallback, useEffect, useRef, useState } from "react";

type NetworkInformation = EventTarget & {
  saveData?: boolean;
  effectiveType?: string;
};

export function useBackgroundVideo(waitForPoster = false) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackAllowed = useRef(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const playIfAllowed = useCallback(() => {
    const video = videoRef.current;
    if (playbackAllowed.current && video?.paused && !video.error) {
      void video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const section = viewportRef.current;
    if (!section) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    let cancelled = false;
    let ready = !waitForPoster;
    let idleHandle: number | undefined;
    let fallbackHandle: number | undefined;
    const bounds = section.getBoundingClientRect();
    let inView = bounds.bottom > 0 && bounds.top < window.innerHeight;

    const update = () => {
      const restricted = motion.matches || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
      const active = ready && inView && document.visibilityState === "visible" && !restricted;
      playbackAllowed.current = active;

      if (restricted) {
        setVideoEnabled(false);
        setVideoReady(false);
      } else if (active) {
        setVideoEnabled(true);
        playIfAllowed();
      }

      if (!active) videoRef.current?.pause();
    };

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

    if (waitForPoster) {
      void (posterRef.current?.decode() ?? Promise.resolve()).catch(() => {}).then(() => {
        if (cancelled) return;
        if (document.readyState === "complete") scheduleVideo();
        else window.addEventListener("load", scheduleVideo, { once: true });
      });
    }

    const measure = () => {
      const rect = section.getBoundingClientRect();
      inView = rect.bottom > 0 && rect.top < window.innerHeight;
      update();
    };
    const observer = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting && entry.intersectionRatio >= 0.01;
          update();
        }, { threshold: 0.01 })
      : null;
    if (observer) observer.observe(section);
    else window.addEventListener("scroll", measure, { passive: true });

    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", measure);
    motion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    update();

    return () => {
      cancelled = true;
      playbackAllowed.current = false;
      observer?.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("load", scheduleVideo);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (fallbackHandle !== undefined) window.clearTimeout(fallbackHandle);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", measure);
      motion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, [playIfAllowed, waitForPoster]);

  const onVideoPlaying = useCallback(() => {
    if (!playbackAllowed.current) videoRef.current?.pause();
    else setVideoReady(true);
  }, []);

  const onVideoError = useCallback(() => setVideoReady(false), []);

  return { viewportRef, posterRef, videoRef, videoEnabled, videoReady, playIfAllowed, onVideoPlaying, onVideoError };
}
