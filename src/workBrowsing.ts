type WorkBrowseState = { hash: string; scrollY: number; slug: string };
const key = "liwei-work-browse-v1";
let lastBrowse: WorkBrowseState | null = null;

export function saveWorkBrowseState(slug: string, fromHero = false) {
  lastBrowse = {
    hash: !fromHero && window.location.hash.startsWith("#category/") ? window.location.hash : "#projects",
    scrollY: fromHero ? Math.max(0, (document.getElementById("projects")?.offsetTop ?? 0) - 100) : window.scrollY,
    slug,
  };
  try { sessionStorage.setItem(key, JSON.stringify(lastBrowse)); } catch { /* Browsing also works without storage. */ }
}

export function getWorkBrowseState(): WorkBrowseState | null {
  if (lastBrowse) return lastBrowse;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (saved && typeof saved.hash === "string" && /^#(projects$|category\/[-a-z]+$)/.test(saved.hash)
      && Number.isFinite(saved.scrollY) && saved.scrollY >= 0 && typeof saved.slug === "string") return saved;
  } catch { /* Ignore unavailable or stale storage. */ }
  return null;
}
