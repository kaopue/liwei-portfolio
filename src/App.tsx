import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  ArrowUpRight,
  ChevronUp,
  Mail,
  Phone,
} from "lucide-react";
import { useBackgroundVideo } from "./useBackgroundVideo";
import { useCoverMotion } from "./useCoverMotion";
import { WorkDetailBoundary } from "./WorkDetailBoundary";
import {
  advantages,
  contacts,
  experiences,
  navItems,
  projectCategories,
  projects,
} from "./data/portfolio";
import type { Project } from "./data/portfolio";
import homepageImages from "./data/curatedCovers.json";
import optimizedVideos from "./data/optimizedVideos.json";
import contactVideo from "./data/contactVideo.json";
import mobileCovers from "./data/mobileCovers.json";
import { followWorkFrom } from "./workBrowsing";
import {
  getPortfolioHistory,
  getPortfolioRoute,
  homeHref,
  isPlainLinkClick,
  navigatePortfolio,
  portfolioNavigationEvent,
  replacePortfolioFilter,
  workHref,
  type BrowseOrigin,
} from "./workRoutes";
import workPreviews from "./data/workPreviews.json";

const WorkDetailPage = lazy(() => import("./WorkDetailPage"));

const siteTitle = "李维 | 品牌视觉与包装设计作品集";
const homeAnchors = ["top", "about", "projects", "advantages", "contact"];
const mobileProjectLimit = 12;

function readNavigation(keepScroll = false) {
  return {
    route: getPortfolioRoute(),
    url: window.location.href,
    restore: getPortfolioHistory().restore,
    keepScroll,
  };
}

function getCategoryFromRoute(route: ReturnType<typeof getPortfolioRoute>) {
  if (route.kind !== "home") return undefined;
  if (route.hash === "" || route.hash === "projects") return "all";
  if (!route.hash.startsWith("category/")) return undefined;

  const slug = route.hash.slice(9);
  return projectCategories.some((category) => category.slug === slug) ? slug : "all";
}

function usePortfolioNavigation() {
  const [navigation, setNavigation] = useState(() => {
    const current = readNavigation();
    return { ...current, category: getCategoryFromRoute(current.route) ?? "all" };
  });

  useEffect(() => {
    const sync = (event: Event) => {
      const isPortfolioEvent = event.type === portfolioNavigationEvent;
      const current = readNavigation(event instanceof CustomEvent && event.detail?.keepScroll === true);
      setNavigation((previous) => {
        if (!isPortfolioEvent && previous.url === current.url) return previous;
        return { ...current, category: getCategoryFromRoute(current.route) ?? previous.category };
      });
    };
    window.addEventListener(portfolioNavigationEvent, sync);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener(portfolioNavigationEvent, sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return navigation;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

const getProjectCategoryLabel = (project: Project) =>
  projectCategories.find((category) => category.slug === project.categorySlug)?.label ?? project.category;

function App() {
  const navigation = usePortfolioNavigation();
  const { route } = navigation;
  const routeProject = route.kind === "work"
    ? projects.find((project) => project.slug === route.slug) ?? null
    : null;

  useCoverMotion(route.kind);
  usePortfolioMotion(route.kind === "work" ? `work:${route.slug}` : route.kind);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    document.title = routeProject ? `${routeProject.title} | 李维设计作品集` : route.kind === "home" ? siteTitle : "页面未找到 | 李维设计作品集";
  }, [route.kind, routeProject]);

  useLayoutEffect(() => {
    if (navigation.keepScroll) return;

    if (route.kind !== "home") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const focusTitle = () => {
        const heading = document.querySelector<HTMLElement>("#case-title, #work-load-error-title");
        if (!heading) return false;
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        return true;
      };
      if (focusTitle()) return;
      const main = document.getElementById("main-content");
      if (!main) return;
      const observer = new MutationObserver(() => {
        if (focusTitle()) observer.disconnect();
      });
      observer.observe(main, { childList: true, subtree: true });
      return () => observer.disconnect();
    }

    const frame = window.requestAnimationFrame(() => {
      if (navigation.restore) {
        const { scrollY, focusId } = navigation.restore;
        window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
        const target = document.getElementById(focusId);
        if (target) {
          const bounds = target.getBoundingClientRect();
          const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
          if (bounds.bottom <= headerBottom || bounds.top >= window.innerHeight) {
            target.scrollIntoView({ block: "center", behavior: "instant" });
          }
          target.focus({ preventScroll: true });
        }
        return;
      }

      const anchor = route.hash.startsWith("category/") ? "projects" : route.hash;
      if (homeAnchors.includes(anchor)) {
        document.getElementById(anchor)?.scrollIntoView({ block: "start", behavior: "instant" });
      } else if (!route.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [navigation, route]);

  return (
    <>
      <a href="#main-content" className="skip-link" onClick={(event) => {
        if (!isPlainLinkClick(event)) return;
        event.preventDefault();
        document.getElementById("main-content")?.focus();
      }}>跳到主要内容</a>
      <SiteHeader onCasePage={route.kind === "work"} />
      <main id="main-content" tabIndex={-1}>
        {route.kind === "home" && (
          <>
            <Hero />
            <Projects activeCategory={navigation.category} restore={navigation.restore} />
            <About />
            <Advantages />
          </>
        )}
        {route.kind !== "home" && (routeProject ? (
          <WorkDetailBoundary key={routeProject.slug}>
            <Suspense fallback={
              <section className="work-detail-page section-pad" aria-label="正在加载项目" aria-busy="true">
                <div className="container" role="status">正在加载项目…</div>
              </section>
            }>
              <WorkDetailPage project={routeProject} categoryLabel={getProjectCategoryLabel(routeProject)} />
            </Suspense>
          </WorkDetailBoundary>
        ) : <WorkNotFound isCase={route.kind === "work"} />)}
      </main>
      {route.kind === "home" && <Contact />}
    </>
  );
}

function SiteHeader({ onCasePage }: { onCasePage: boolean }) {
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const sync = () => {
      if (onCasePage) {
        setActiveSection("#projects");
        return;
      }
      const section = navItems.map((item) => ({
        href: item.href,
        top: document.querySelector(item.href)?.getBoundingClientRect().top ?? Infinity,
      })).filter((item) => item.top <= window.innerHeight * .4)
        .sort((a, b) => b.top - a.top)[0];
      setActiveSection(section?.href ?? "");
    };
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener(portfolioNavigationEvent, schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener(portfolioNavigationEvent, schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [onCasePage]);
  return (
    <header className="site-header">
      <a href={homeHref("#top")} onClick={navigatePortfolio} className="brand-mark" aria-label="李维，返回首页">
        <img
          className="brand-logo"
          src="/optimized/logo-liwei-mark-d0d9b6c835bc-160.webp"
          alt=""
          width={160}
          height={81}
          decoding="async"
        />
      </a>
      <nav className="nav-links" aria-label="主导航">
        {navItems.map((item) => (
          <a href={homeHref(item.href)} onClick={navigatePortfolio} key={item.href} aria-current={activeSection === item.href ? "location" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href={`mailto:${contacts.email}`} aria-label="联系我 · 发送邮件" title="发送邮件">
        <Mail size={16} aria-hidden="true" />
        联系我
      </a>
    </header>
  );
}

function BackgroundMedia({ media, kind }: {
  media: typeof optimizedVideos | typeof contactVideo;
  kind: "hero" | "contact";
}) {
  const firstScreen = kind === "hero";
  const mobile = useMediaQuery("(max-width: 760px)");
  const { viewportRef, posterRef, videoRef, videoEnabled, videoReady, lowBandwidth, playIfAllowed, onVideoPlaying, onVideoError } =
    useBackgroundVideo(firstScreen);
  const videoSrc = mobile || lowBandwidth ? media.videoMp4Mobile : media.videoMp4;

  return (
    <div ref={viewportRef} className={firstScreen ? "hero-media" : "contact-scenery"} aria-hidden="true">
      <picture>
        {"posterMobile" in media && (
          <source media="(max-width: 767px)" type="image/webp" srcSet={media.posterMobile} />
        )}
        {"posterJpg" in media && <source type="image/webp" srcSet={media.posterWebp} />}
        <img
          ref={posterRef}
          className={`${kind}-poster`}
          src={"posterJpg" in media ? media.posterJpg : media.posterWebp}
          alt=""
          width={media.posterWidth}
          height={media.posterHeight}
          fetchPriority={firstScreen ? "high" : undefined}
          loading={firstScreen ? "eager" : "lazy"}
          decoding={firstScreen ? "auto" : "async"}
        />
      </picture>
      {videoEnabled && (
        <video
          ref={videoRef}
          className={`background-video ${kind}-video${videoReady ? " is-ready" : ""}`}
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={onVideoPlaying}
          onCanPlay={playIfAllowed}
          onLoadStart={onVideoError}
          onError={onVideoError}
        />
      )}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <BackgroundMedia kind="hero" media={optimizedVideos} />
      <div className="hero-shade" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-content">
          <h1 id="hero-title">
            <span className="hero-title-line"><span>用秩序梳理信息，</span></span>
            <span className="hero-title-line"><span>用情绪建立感知。</span></span>
          </h1>
          <p className="hero-copy">
            <span>品牌视觉、包装设计、活动主视觉与 AI 创意。</span>
            <span>兼顾商业目标、视觉美感与落地执行。</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <picture className="about-portrait">
        <source media="(max-width: 760px)" srcSet="/hero/about-liwei-profile-small.webp" />
        <img
          src="/hero/about-liwei-profile.webp"
          width={2720}
          height={1554}
          alt="李维的黑白侧面肖像"
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className="container about-inner">
        <div className="about-heading-row" data-reveal>
          <h2 id="about-title" className="about-section-title">关于我</h2>
          <p className="about-identity"><strong>10 年以上设计经验</strong></p>
        </div>
        <div className="about-lead" data-reveal>
          <p className="about-statement">让商业策略转化为清晰、克制、极具辨识度的视觉系统。</p>
          <p className="about-intro">从标志、包装、画册到活动物料，让品牌在不同使用场景里保持一致。</p>
        </div>
        <div className="about-summary">
          <p>习惯从商业逻辑出发，以克制的网格排版与精准的视觉语言解决传播问题，并结合 AI 创意工作流，确保项目从概念提案到印刷落地的全链路高水准交付。</p>
        </div>
        <div className="about-career">
          <h3 className="about-career-label" id="career-label">职业经历</h3>
          <ol className="about-timeline" aria-labelledby="career-label">
            {experiences.map(({ period, company, role, description }) => (
              <li key={period}>
                <p className="about-period">{period}</p>
                <h4 className="about-role">{role}</h4>
                <p className="about-company">{company}</p>
                <p className="about-experience-copy">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function syncFilterStripEnd(strip: HTMLDivElement) {
  const atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
  strip.parentElement?.setAttribute("data-at-end", String(atEnd));
}

function makeActiveFilterVisible(strip: HTMLDivElement) {
  const active = strip.querySelector(".is-active");
  if (!active) return;

  const stripBounds = strip.getBoundingClientRect();
  const buttonBounds = active.getBoundingClientRect();
  if (buttonBounds.left < stripBounds.left + 5) {
    strip.scrollLeft += buttonBounds.left - stripBounds.left - 5;
  } else if (buttonBounds.right > stripBounds.right - 5) {
    strip.scrollLeft += buttonBounds.right - stripBounds.right + 5;
  }
}

function Projects({ activeCategory, restore }: { activeCategory: string; restore?: BrowseOrigin }) {
  const narrowList = useMediaQuery("(max-width: 700px)");
  const [expanded, setExpanded] = useState(() => restore?.expandedProjects ?? false);
  const filterStripRef = useRef<HTMLDivElement>(null);
  const returnFilterScroll = useRef(restore?.filterScroll);
  const showMoreButton = useRef<HTMLButtonElement>(null);
  const showMoreChanged = useRef(false);
  const sortedProjects = useMemo(
    () => [...projects].sort((left, right) => left.priority - right.priority),
    [],
  );
  const filteredProjects = useMemo(
    () => activeCategory === "all"
      ? sortedProjects
      : sortedProjects.filter((project) => project.categorySlug === activeCategory),
    [activeCategory, sortedProjects],
  );
  const categoryCounts = useMemo(
    () => projects.reduce<Record<string, number>>((counts, project) => {
      counts[project.categorySlug] = (counts[project.categorySlug] ?? 0) + 1;
      return counts;
    }, {}),
    [],
  );

  const canExpand = narrowList && activeCategory === "all" && filteredProjects.length > mobileProjectLimit;
  const visibleProjects = canExpand && !expanded ? filteredProjects.slice(0, mobileProjectLimit) : filteredProjects;

  useLayoutEffect(() => {
    const strip = filterStripRef.current;
    if (!strip) return;
    if (returnFilterScroll.current !== undefined) {
      strip.scrollLeft = returnFilterScroll.current;
      returnFilterScroll.current = undefined;
    }
    const sync = () => {
      makeActiveFilterVisible(strip);
      syncFilterStripEnd(strip);
    };
    sync();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(sync);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [activeCategory]);

  useLayoutEffect(() => {
    if (!showMoreChanged.current) return;
    showMoreChanged.current = false;

    if (expanded && sortedProjects[mobileProjectLimit]) {
      document.getElementById(`project-${sortedProjects[mobileProjectLimit].slug}`)?.focus();
      return;
    }
    showMoreButton.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    showMoreButton.current?.focus({ preventScroll: true });
  }, [expanded, sortedProjects]);

  const handleCategoryChange = (categorySlug: string) => {
    if (categorySlug === activeCategory) return;
    const update = () => replacePortfolioFilter(categorySlug === "all" ? "#projects" : `#category/${categorySlug}`);
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(update);
    } else update();
  };

  const handleOpenCase = (event: MouseEvent<HTMLAnchorElement>) => {
    followWorkFrom(event, {
      href: homeHref(activeCategory === "all" ? "#projects" : `#category/${activeCategory}`),
      filterScroll: filterStripRef.current?.scrollLeft,
      expandedProjects: expanded,
    });
  };

  return (
    <section className="projects section-pad" id="projects" aria-labelledby="projects-title">
      <div className="container">
        <div className="work-index">
          <div className="work-index-head">
            <div><h2 id="projects-title">作品展示</h2></div>
            <p>均为真实案例，<strong>无临摹作品、非培训机构套模板</strong>。</p>
          </div>

          <div className="work-browser-toolbar">
            <div className="work-filter-strip">
              <div
                className="category-filters"
                ref={filterStripRef}
                role="group"
                aria-label="作品分类筛选"
                onScroll={(event) => syncFilterStripEnd(event.currentTarget)}
              >
                <button
                  className={activeCategory === "all" ? "is-active" : ""}
                  type="button"
                  aria-pressed={activeCategory === "all"}
                  onClick={() => handleCategoryChange("all")}
                >
                  全部
                  <span>{projects.length}</span>
                </button>
                {projectCategories
                  .filter((category) => (categoryCounts[category.slug] ?? 0) > 0)
                  .map((category) => (
                    <button
                      className={activeCategory === category.slug ? "is-active" : ""}
                      key={category.slug}
                      type="button"
                      aria-pressed={activeCategory === category.slug}
                      onClick={() => handleCategoryChange(category.slug)}
                      title={category.description}
                    >
                      {category.label}
                      <span>{categoryCounts[category.slug]}</span>
                    </button>
                  ))}
              </div>
            </div>
            <p className="work-results" role="status">
              {filteredProjects.length} 个项目{canExpand && !expanded && `，显示前 ${mobileProjectLimit} 个`}
            </p>
          </div>

          <div className="projects-grid work-list-grid" id="portfolio-project-grid">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} onOpen={handleOpenCase} />
            ))}
          </div>
          {canExpand && (
            <div className="work-show-more">
              <button
                ref={showMoreButton}
                type="button"
                aria-expanded={expanded}
                aria-controls="portfolio-project-grid"
                onClick={() => {
                  showMoreChanged.current = true;
                  setExpanded(!expanded);
                }}
              >
                {expanded ? "收起项目列表" : `展开全部 ${filteredProjects.length} 个项目`}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const categoryLabel = getProjectCategoryLabel(project);
  const cover = homepageImages[project.slug as keyof typeof homepageImages];
  const coverDelivery = mobileCovers[project.slug as keyof typeof mobileCovers];
  const preview = workPreviews[project.slug as keyof typeof workPreviews];
  const [previewRequested, setPreviewRequested] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const requestPreview = () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setPreviewRequested(true);
  };

  return (
    <article className="project-card visual-project-card" style={{ viewTransitionName: `work-${project.slug}` }}>
      <a
        id={`project-${project.slug}`}
        className="visual-project-link"
        href={workHref(project.slug)}
        aria-label={`查看项目 · ${project.title}`}
        aria-describedby={`project-category-${project.slug}`}
        onClick={onOpen}
        onPointerEnter={requestPreview}
        onFocus={() => setPreviewRequested(true)}
      >
        <div className={`project-image${previewReady ? " has-preview" : ""}`}>
          <img
            src={coverDelivery?.src ?? cover?.src ?? project.cover}
            srcSet={coverDelivery ? `${coverDelivery.smallSrc} 480w, ${coverDelivery.src} 960w` : undefined}
            sizes="(max-width: 700px) calc(100vw - 30px), (max-width: 1180px) calc(50vw - 27px), min(462px, calc(33.333vw - 26px))"
            width={cover?.width}
            height={cover?.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {previewRequested && preview && <img className="project-hover-image" src={preview.smallSrc} width={preview.smallWidth} height={preview.smallHeight} alt="" decoding="async" onLoad={() => setPreviewReady(true)} />}
          <div className="project-image-overlay" aria-hidden="true">
            <span className="project-open-label">查看项目 <ArrowUpRight size={18} aria-hidden="true" /></span>
            <span className="project-image-count">{new Set([project.cover, ...project.images]).size} 张作品</span>
          </div>
        </div>
        <div className="project-meta">
          <div>
            <h3>{project.title}</h3>
            <p id={`project-category-${project.slug}`} aria-hidden="true">{categoryLabel}</p>
          </div>
          <ArrowUpRight className="project-meta-arrow" size={19} aria-hidden="true" />
        </div>
      </a>
    </article>
  );
}

function WorkNotFound({ isCase }: { isCase: boolean }) {
  const title = isCase ? "项目不存在" : "页面未找到";
  return (
    <section className="work-detail-page section-pad work-not-found" aria-labelledby="case-title">
      <div className="container">
        <div className="project-detail-head">
          <h1 id="case-title" tabIndex={-1}>{title}</h1>
          <a className="detail-back" href={homeHref("#projects")} onClick={navigatePortfolio}>
            返回作品列表
          </a>
        </div>
        <p>{isCase ? "这个项目链接可能已变更。" : "这个链接可能已变更。"}你可以回到作品列表继续浏览。</p>
      </div>
    </section>
  );
}

function Advantages() {
  const [openArt, setOpenArt] = useState<string | null>(null);

  return (
    <section className="advantages section-pad" id="advantages" aria-labelledby="advantages-title">
      <div className="container">
        <div className="section-label"><h2 id="advantages-title">个人优势</h2></div>
        <div className="strength-folders">
          {advantages.map(({ title, description, art, relatedProject }) => (
            <article className="strength-folder" key={art} data-art={art} data-open={openArt === art}>
              <div className="strength-folder-back" aria-hidden="true" />
              <img
                className="strength-folder-art"
                src={`/advantages/${art}.webp`}
                width={480}
                height={480}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <div className="strength-folder-front" aria-hidden="true" />
              <button
                className="strength-folder-toggle"
                type="button"
                aria-label={`配图 · ${title}`}
                title={openArt === art ? "收起配图" : "展开配图"}
                aria-pressed={openArt === art}
                onClick={() => setOpenArt((current) => current === art ? null : art)}
              >
                <ChevronUp size={19} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <div className="strength-folder-content">
                <h3>{title}</h3>
                <p>{description}</p>
                {relatedProject && (
                  <a
                    className="strength-folder-project"
                    id={`strength-project-${art}`}
                    href={workHref(relatedProject)}
                    aria-label={`查看相关项目 · ${title}`}
                    onClick={(event) => followWorkFrom(event, { href: homeHref("#advantages") })}
                  >
                    查看相关项目 <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <footer className="contact" id="contact" aria-labelledby="contact-title">
      <div className="container contact-inner">
        <div className="contact-copy">
          <h2 id="contact-title">期待下一次<br />有价值的商业视觉合作。</h2>
          <div className="contact-panel">
            <a href={`mailto:${contacts.email}`} aria-label={`发送邮件 · ${contacts.email}`}>
              <Mail size={19} aria-hidden="true" />
              <span>{contacts.email}</span>
            </a>
            <a href={`tel:${contacts.phone}`} aria-label={`拨打电话 · ${contacts.phone}`}>
              <Phone size={19} aria-hidden="true" />
              <span>{contacts.phone}</span>
            </a>
          </div>
        </div>
      </div>
      <BackgroundMedia kind="contact" media={contactVideo} />
    </footer>
  );
}

function usePortfolioMotion(routeKey: string) {
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const supportsRevealObserver = "IntersectionObserver" in window;
    let observer: IntersectionObserver | null = null;

    const updateMotion = () => {
      observer?.disconnect();
      observer = null;

      const pendingItems = revealItems.filter((item) => !item.classList.contains("is-visible"));
      if (motion.matches || !supportsRevealObserver || pendingItems.length === 0) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        document.documentElement.classList.remove("reveal-motion");
        return;
      }

      document.documentElement.classList.add("reveal-motion");

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.14 },
      );

      pendingItems.forEach((item) => observer?.observe(item));
    };

    updateMotion();
    motion.addEventListener("change", updateMotion);

    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", updateMotion);
      document.documentElement.classList.remove("reveal-motion");
    };
  }, [routeKey]);
}

export default App;
