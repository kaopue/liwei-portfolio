import type { MouseEvent } from "react";
import {
  getPortfolioHistory,
  homeHref,
  isPlainLinkClick,
  navigatePortfolio,
  replacePortfolioHistory,
  type BrowseOrigin,
} from "./workRoutes";

export function followWorkFrom(
  event: MouseEvent<HTMLAnchorElement>,
  options: Pick<BrowseOrigin, "href" | "filterScroll" | "expandedProjects">,
) {
  if (!isPlainLinkClick(event)) return;

  const origin: BrowseOrigin = {
    ...options,
    focusId: event.currentTarget.id,
    scrollY: window.scrollY,
  };
  replacePortfolioHistory({ restore: origin });
  navigatePortfolio(event, { origin });
}

export function getWorkReturnHref() {
  return getPortfolioHistory().origin?.href ?? homeHref("#projects");
}

export function getWorkReturnLabel() {
  return getWorkReturnHref() === homeHref("#advantages") ? "返回个人优势" : "返回作品";
}

export function returnToWorkBrowse(event: MouseEvent<HTMLAnchorElement>) {
  navigatePortfolio(event, { restore: getPortfolioHistory().origin });
}
