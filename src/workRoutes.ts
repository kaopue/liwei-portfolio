import type { MouseEvent } from "react";
import { decodeHash } from "./hash";

export type BrowseOrigin = {
  href: string;
  focusId: string;
  scrollY: number;
  filterScroll?: number;
  expandedProjects?: boolean;
};

type PortfolioHistory = { origin?: BrowseOrigin; restore?: BrowseOrigin };

export type PortfolioRoute =
  | { kind: "home"; hash: string }
  | { kind: "work"; slug: string }
  | { kind: "missing" };

export const portfolioNavigationEvent = "portfolio:navigation";

export function homeHref(hash = "") {
  return `/${hash}`;
}

export function workHref(slug: string) {
  return `/work/${encodeURIComponent(slug)}`;
}

export function getPortfolioRoute(location: Pick<Location, "pathname" | "hash"> = window.location): PortfolioRoute {
  const { pathname } = location;
  if (pathname === "/work" || pathname.startsWith("/work/")) {
    const slug = pathname.match(/^\/work\/([^/]+)\/?$/)?.[1];
    return { kind: "work", slug: slug ? decodeHash(slug) : "" };
  }

  if (pathname !== "/" && pathname !== "/index.html") return { kind: "missing" };

  const hash = decodeHash(location.hash);
  return hash.startsWith("work/") ? { kind: "work", slug: hash.slice(5) } : { kind: "home", hash };
}

export function getPortfolioHistory(): PortfolioHistory {
  return window.history.state?.liweiPortfolio ?? {};
}

export function replacePortfolioHistory(state: PortfolioHistory, href = window.location.href) {
  window.history.replaceState({ ...window.history.state, liweiPortfolio: state }, "", href);
}

export function isPlainLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey
    && !event.shiftKey && !event.altKey && !event.currentTarget.target && !event.currentTarget.hasAttribute("download");
}

export function navigatePortfolio(event: MouseEvent<HTMLAnchorElement>, state?: PortfolioHistory) {
  if (!isPlainLinkClick(event)) return;

  const destination = new URL(event.currentTarget.href);
  if (destination.origin !== window.location.origin) return;
  event.preventDefault();

  if (destination.href !== window.location.href) {
    const followingCase = getPortfolioRoute().kind === "work" && getPortfolioRoute(destination).kind === "work";
    const nextState = state ?? (followingCase ? { origin: getPortfolioHistory().origin } : {});
    window.history.pushState({ liweiPortfolio: nextState }, "", destination);
  }
  window.dispatchEvent(new Event(portfolioNavigationEvent));
}

export function replacePortfolioFilter(hash: string) {
  replacePortfolioHistory({}, homeHref(hash));
  window.dispatchEvent(new CustomEvent(portfolioNavigationEvent, { detail: { keepScroll: true } }));
}
