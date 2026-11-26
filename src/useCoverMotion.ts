import { useEffect } from "react";

// Event delegation also covers cards mounted by category filters.
export function useCoverMotion(routeKey: string) {
  useEffect(() => {
    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let surface: HTMLElement | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface?.style.removeProperty("--tilt-x");
      surface?.style.removeProperty("--tilt-y");
      surface?.style.removeProperty("--light-x");
      surface?.style.removeProperty("--light-y");
      surface?.classList.remove("is-tracking");
      surface = null;
    };
    const move = (event: PointerEvent) => {
      if (!enabled.matches || event.pointerType === "touch") return;
      const next = event.target instanceof Element
        ? event.target.closest(".visual-project-link")?.querySelector<HTMLElement>(".project-image") ?? null
        : null;
      if (surface !== next) {
        reset();
        surface = next;
      }
      if (!surface) return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!surface) return;
        const bounds = surface.getBoundingClientRect();
        const px = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
        const py = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
        surface.style.setProperty("--tilt-x", `${(0.5 - py) * 5}deg`);
        surface.style.setProperty("--tilt-y", `${(px - 0.5) * 7}deg`);
        surface.style.setProperty("--light-x", `${px * 100}%`);
        surface.style.setProperty("--light-y", `${py * 100}%`);
        surface.classList.add("is-tracking");
      });
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("blur", reset);
    enabled.addEventListener("change", reset);
    return () => {
      reset();
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("blur", reset);
      enabled.removeEventListener("change", reset);
    };
  }, [routeKey]);
}
