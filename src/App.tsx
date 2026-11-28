import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  ArrowUpRight,
  ChevronUp,
  Mail,
  Phone,
} from "lucide-react";
import { useBackgroundVideo } from "./useBackgroundVideo";
import { useCoverMotion } from "./useCoverMotion";
import { WorkDetailBoundary } from "./WorkDetailBoundary";
import { decodeHash } from "./hash";
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
import { getWorkBrowseState, saveWorkBrowseState } from "./workBrowsing";
import workPreviews from "./data/workPreviews.json";

const WorkDetailPage = lazy(() => import("./WorkDetailPage"));

type HashRoute = { kind: "home" } | { kind: "work"; slug: string };

const getHashRoute = (): HashRoute => {
  if (typeof window === "undefined") {
    return { kind: "home" };
  }

  const hash = decodeHash(window.location.hash);

  if (hash.startsWith("work/")) {
    return { kind: "work", slug: hash.replace("work/", "") };
  }

  return { kind: "home" };
};

function useHashRoute() {
  const [route, setRoute] = useState<HashRoute>(() => getHashRoute());

  useEffect(() => {
    const syncRoute = () => setRoute(getHashRoute());

    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  return route;
}

const getProjectCategoryLabel = (project: Project) =>
  projectCategories.find((category) => category.slug === project.categorySlug)?.label ?? project.category;

function App() {
  const route = useHashRoute();
  const previousRoute = useRef(route.kind);
  useCoverMotion(route.kind);
  usePortfolioMotion(route.kind === "work" ? `work:${route.slug}` : "home");
  const routeProject = route.kind === "work"
    ? projects.find((project) => project.slug === route.slug) ?? null
    : null;

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useEffect(() => {
    const returningFromWork = previousRoute.current === "work";
    previousRoute.current = route.kind;
    if (route.kind === "work") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // Home sections mount after the hash changes when leaving a case study.
    // Restore the anchor after React commits so return and direct links land correctly.
    const hash = decodeHash(window.location.hash);
    const savedBrowse = getWorkBrowseState();
    if (returningFromWork && savedBrowse && window.location.hash === savedBrowse.hash) {
      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: savedBrowse.scrollY, behavior: "instant" });
        if (savedBrowse.slug) {
          document.getElementById(`project-${savedBrowse.slug}`)?.focus({ preventScroll: true });
        }
      });
      return () => window.cancelAnimationFrame(frame);
    }
    const targetId = hash.startsWith("category/") ? "projects" : hash;
    if (!["top", "about", "projects", "advantages", "contact"].includes(targetId)) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route]);

  if (route.kind === "work") {
    return (
      <main>
        <SiteHeader />
        {routeProject ? (
          <WorkDetailBoundary key={routeProject.slug}>
            <Suspense fallback={
              <section className="work-detail-page section-pad" aria-label="正在加载项目" aria-busy="true">
                <div className="container" role="status">正在加载项目…</div>
              </section>
            }>
              <WorkDetailPage project={routeProject} categoryLabel={getProjectCategoryLabel(routeProject)} />
            </Suspense>
          </WorkDetailBoundary>
        ) : <WorkNotFound slug={route.slug} />}
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <Hero />
      <Projects />
      <About />
      <Advantages />
      <Contact />
    </main>
  );
}

function SiteHeader() {
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const sync = () => {
      if (decodeHash(window.location.hash).startsWith("work/")) {
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
    window.addEventListener("hashchange", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return (
    <header className="site-header">
      <a href="#top" className="brand-mark" aria-label="李维个人 Logo，回到首页">
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
          <a href={item.href} key={item.href} aria-current={activeSection === item.href ? "location" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href={`mailto:${contacts.email}`} aria-label="联系我">
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
  const { viewportRef, posterRef, videoRef, videoEnabled, videoReady, playIfAllowed, onVideoPlaying, onVideoError } =
    useBackgroundVideo(firstScreen);

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
          src={media.videoMp4}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onPlaying={onVideoPlaying}
          onCanPlay={playIfAllowed}
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
            <span>专注品牌视觉、包装设计、活动主视觉与 AI 辅助创意表达。</span>
            <span>擅长在商业目标、视觉美感与落地执行之间建立秩序，</span>
            <span>让设计不仅好看，也能被理解、被传播、被使用。</span>
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
        <p className="about-identity">
          <strong>10+ 工作经验</strong>
        </p>
        </div>
        <div className="about-lead" data-reveal>
        <p className="about-statement">
          让商业策略转化为清晰、克制、极具辨识度的视觉系统。
        </p>
        <p className="about-intro">具备扎实的视觉传达与品牌设计基础，擅长建立富有辨识度的品牌视觉系统。</p>
        </div>
        <div className="about-summary">
          <p>习惯从商业逻辑出发，以克制的网格排版与精准的视觉语言解决传播问题，并结合 AI 创意工作流，确保项目从概念提案到印刷落地的全链路高水准交付。</p>
        </div>
        <div className="about-career">
        <p className="about-career-label">职业经历</p>
        <ol className="about-timeline" aria-label="职业经历">
          {experiences.map(({ period, company, role, description }) => (
            <li key={period}>
              <p className="about-period">{period}</p>
              <h3>{company}</h3>
              {role && <p className="about-role">{role}</p>}
              <p className="about-experience-copy">{description}</p>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const [activeCategory, setActiveCategory] = useState("all");

  const sortedProjects = useMemo(
    () => [...projects].sort((left, right) => left.priority - right.priority),
    [],
  );

  const filteredProjects = useMemo(
    () =>
      activeCategory === "all"
        ? sortedProjects
        : sortedProjects.filter((project) => project.categorySlug === activeCategory),
    [activeCategory, sortedProjects],
  );

  const categoryCounts = useMemo(
    () =>
      projects.reduce<Record<string, number>>((counts, project) => {
        counts[project.categorySlug] = (counts[project.categorySlug] ?? 0) + 1;
        return counts;
      }, {}),
    [],
  );

  useEffect(() => {
    const syncFromHash = () => {
      const hash = decodeHash(window.location.hash);

      if (hash.startsWith("category/")) {
        const categorySlug = hash.replace("category/", "");
        const hasCategory = projectCategories.some((category) => category.slug === categorySlug);
        setActiveCategory(hasCategory ? categorySlug : "all");
        return;
      }

      if (hash === "projects" || hash === "") {
        setActiveCategory("all");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const handleCategoryChange = (categorySlug: string) => {
    if (categorySlug === activeCategory) return;
    const update = () => {
      flushSync(() => setActiveCategory(categorySlug));
      window.history.replaceState(null, "", categorySlug === "all" ? "#projects" : `#category/${categorySlug}`);
    };
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(update);
    } else update();
  };

  return (
    <section className="projects section-pad" id="projects">
      <div className="container">
        <div className="work-index" aria-label="作品列表">
          <div className="work-index-head">
            <div>
              <h2>作品展示</h2>
            </div>
            <p>均为真实案例，无临摹作品、非培训机构套模板。</p>
          </div>

          <div className="work-browser-toolbar">
          <div className="category-filters" aria-label="作品分类筛选">
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
          <p className="work-results" role="status" aria-live="polite">{filteredProjects.length} 个项目</p>
          </div>

          <div className="projects-grid work-list-grid">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const categoryLabel = getProjectCategoryLabel(project);
  const cover = homepageImages[project.slug as keyof typeof homepageImages];
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
        href={`#work/${project.slug}`}
        aria-label={`查看 ${String(index + 1).padStart(2, "0")} ${project.title}`}
        onClick={(event) => {
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) saveWorkBrowseState(project.slug);
        }}
        onPointerEnter={requestPreview}
        onFocus={() => setPreviewRequested(true)}
      >
        <div className={`project-image${previewReady ? " has-preview" : ""}`}>
          <img src={cover?.src ?? project.cover} width={cover?.width} height={cover?.height} alt={project.title} loading="lazy" decoding="async" />
          {previewRequested && preview && <img className="project-hover-image" src={preview.smallSrc} width={preview.smallWidth} height={preview.smallHeight} alt="" decoding="async" onLoad={() => setPreviewReady(true)} />}
          <div className="project-image-overlay">
            <span className="project-open-label">查看项目 <ArrowUpRight size={18} aria-hidden="true" /></span>
            <span className="project-image-count">{project.images.length} 张作品</span>
          </div>
        </div>
      <div className="project-meta">
        <div>
          <h3>{project.title}</h3>
          <p>{categoryLabel}</p>
        </div>
        <ArrowUpRight className="project-meta-arrow" size={19} aria-hidden="true" />
      </div>
      </a>
    </article>
  );
}

function WorkNotFound({ slug }: { slug: string }) {
  return (
    <section className="work-detail-page section-pad work-not-found" aria-label="项目不存在">
      <div className="container">
        <div className="project-detail-head">
          <div>
            <p className="eyebrow">WORK NOT FOUND</p>
            <h1>项目不存在</h1>
          </div>
          <a className="detail-back" href="#projects">
            返回作品列表
          </a>
        </div>
        <p>
          没有找到 slug 为 <span>{slug}</span> 的项目。你可以返回作品列表，重新选择一个作品集项目。
        </p>
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
                aria-label={`展示${title}配图`}
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
                    href={`#work/${relatedProject}`}
                    onClick={(event) => {
                      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                        saveWorkBrowseState(relatedProject, true);
                      }
                    }}
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
            <a href={`mailto:${contacts.email}`}>
              <Mail size={19} aria-hidden="true" />
              <span>{contacts.email}</span>
            </a>
            <a href={`tel:${contacts.phone}`}>
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
