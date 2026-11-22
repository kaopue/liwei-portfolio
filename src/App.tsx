import {
  type CSSProperties,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  Mail,
  Pause,
  Phone,
  Play,
  Send,
  SquareArrowOutUpRight,
} from "lucide-react";
import { useHeroVideo } from "./useHeroVideo";
import { WorkDetailBoundary } from "./WorkDetailBoundary";
import { decodeHash } from "./hash";
import {
  advantages,
  contacts,
  experiences,
  focusAreas,
  navItems,
  projectCategories,
  projects,
} from "./data/portfolio";
import type { Project } from "./data/portfolio";
import homepageImages from "./data/curatedCovers.json";
import optimizedVideos from "./data/optimizedVideos.json";

const WorkDetailPage = lazy(() => import("./WorkDetailPage"));

const revealDelay = (delay: string): CSSProperties =>
  ({ "--reveal-delay": delay }) as CSSProperties;

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
  usePortfolioMotion(route.kind === "work" ? `work:${route.slug}` : "home");
  const routeProject = route.kind === "work"
    ? projects.find((project) => project.slug === route.slug) ?? null
    : null;

  useEffect(() => {
    if (route.kind === "work") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }

    // Home sections mount after the hash changes when leaving a case study.
    // Restore the anchor after React commits so return and direct links land correctly.
    const hash = decodeHash(window.location.hash);
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
      <About />
      <Projects />
      <Advantages />
      <Contact />
    </main>
  );
}

function SiteHeader() {
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
          <a href={item.href} key={item.href}>
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

const heroProjectSlugs = [
  "zhangshuntang-tea-tin-packaging",
  "yixinhe-agriculture-identity",
  "ch9-uae-badge-keychain",
  "leebeer-craft-beer-packaging",
  "caaa-aerospace-badge-collection",
];

const heroProjects = heroProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project));

function Hero() {
  const {
    heroRef, posterRef, videoRef, videoMode, videoReady,
    isPlaying, hasVideoError, togglePlayback,
    onVideoPlaying, onVideoPause, onVideoError,
  } = useHeroVideo();

  return (
    <section ref={heroRef} className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" type="image/webp" srcSet={optimizedVideos.posterMobile} />
          <source type="image/webp" srcSet={optimizedVideos.posterWebp} />
          <img
            ref={posterRef}
            className="hero-poster"
            src={optimizedVideos.posterJpg}
            alt=""
            width={optimizedVideos.posterWidth}
            height={optimizedVideos.posterHeight}
            fetchPriority="high"
          />
        </picture>
        {videoMode && (
          <video
            ref={videoRef}
            key={videoMode}
            className={`hero-video${videoReady ? " is-ready" : ""}`}
            poster={videoMode === "mobile" ? optimizedVideos.posterMobile : optimizedVideos.posterWebp}
            aria-hidden="true"
            muted
            loop
            playsInline
            preload="metadata"
            onPlaying={onVideoPlaying}
            onPause={onVideoPause}
            onError={onVideoError}
          >
            <source src={optimizedVideos.videoMp4} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      {videoMode && !hasVideoError && (
        <button
          className="hero-playback"
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "暂停背景视频" : "播放背景视频"}
          title={isPlaying ? "暂停背景视频" : "播放背景视频"}
        >
          {isPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          <span>{isPlaying ? "暂停背景" : "播放背景"}</span>
        </button>
      )}
      <div className="container hero-inner">
        <div className="hero-content">
          <h1 id="hero-title">
            <span>用秩序梳理信息，</span>
            <span>用情绪建立感知。</span>
          </h1>
          <p className="hero-copy">
            <span>专注品牌视觉、包装设计、活动主视觉与 AI 辅助创意表达。</span>
            <span>擅长在商业目标、视觉美感与落地执行之间建立秩序，</span>
            <span>让设计不仅好看，也能被理解、被传播、被使用。</span>
          </p>
          <div className="hero-actions">
            <a href="#projects" className="hero-button hero-button-primary">
              查看项目 <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a href={`https://${contacts.behance}`} className="hero-button hero-button-secondary" target="_blank" rel="noopener noreferrer">
              Behance <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only">（在新窗口打开）</span>
            </a>
            <p className="hero-note">均为真实案例，无临摹作品、非培训机构套模板。</p>
          </div>
        </div>
        <nav className="hero-work-strip" aria-label="精选作品快捷入口">
          {heroProjects.map((project) => (
            <a className="hero-work-card" href={`#work/${project.slug}`} key={project.slug} aria-label={`查看${project.title}`}>
              <img
                src={homepageImages[project.slug as keyof typeof homepageImages]?.src ?? project.cover}
                alt=""
                width={960}
                height={540}
                loading="lazy"
                decoding="async"
              />
              <span>{project.title}<ArrowUpRight size={14} aria-hidden="true" /></span>
            </a>
          ))}
        </nav>
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
        <p className="about-identity">
          <strong>{contacts.name}</strong>
          <span lang="en">— LIWEI · BRAND&amp;VISUAL DESIGNER <span className="about-years">| &nbsp;12 YEARS EXPERIENGE</span></span>
        </p>
        <h2 id="about-title" className="about-statement">
          <span>让商业策略转化为</span>
          <span>清晰、克制、</span>
          <span>极具辨识度的<wbr /><span className="about-ending">视觉系统。</span></span>
        </h2>
        <div className="about-summary">
          <p>具备扎实的视觉传达与品牌设计基础，擅长建立富有辨识度的品牌视觉系统。</p>
          <p>习惯从商业逻辑出发，以克制的网格排版与精准的视觉语言解决传播问题，并结合 AI 创意工作流，确保项目从概念提案到印刷落地的全链路高水准交付。</p>
        </div>
        <ul className="about-specialties" aria-label="设计方向">
          {focusAreas.map((label) => <li key={label}>{label}</li>)}
        </ul>
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
    let scrollFrame = 0;

    const syncFromHash = () => {
      window.cancelAnimationFrame(scrollFrame);
      const hash = decodeHash(window.location.hash);

      if (hash.startsWith("category/")) {
        const categorySlug = hash.replace("category/", "");
        const hasCategory = projectCategories.some((category) => category.slug === categorySlug);
        setActiveCategory(hasCategory ? categorySlug : "all");
        scrollFrame = window.requestAnimationFrame(() => {
          document.getElementById("projects")?.scrollIntoView({ block: "start" });
        });
        return;
      }

      if (hash === "projects" || hash === "") {
        setActiveCategory("all");
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    window.history.replaceState(null, "", categorySlug === "all" ? "#projects" : `#category/${categorySlug}`);
  };

  return (
    <section className="projects section-pad" id="projects">
      <div className="container">
        <div className="work-index" aria-label="作品列表">
          <div className="work-index-head">
            <div>
              <p className="eyebrow">SELECTED WORKS</p>
              <h2>精选项目</h2>
            </div>
            <p>从品牌标志、字体与包装，到活动视觉、航天文创与折页。按分类浏览 {projects.length} 个项目，查看各方案的细节与完整呈现。</p>
          </div>

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

  return (
    <article className={`project-card ${project.layout ?? ""}`} data-glow>
      <a
        href={`#work/${project.slug}`}
        aria-label={`查看 ${String(index + 1).padStart(2, "0")} ${project.title}`}
      >
        <div className="project-image">
          <img src={cover?.src ?? project.cover} width={cover?.width} height={cover?.height} alt={project.title} loading="lazy" decoding="async" />
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
      </a>
      <div className="project-meta">
        <div>
          <p>{categoryLabel}</p>
          <h3>{project.title}</h3>
        </div>
        {project.year && <time>{project.year}</time>}
      </div>
      <p className="project-summary">{project.summary}</p>
      <div className="project-actions">
        <a href={`#work/${project.slug}`}>
          查看详情
          <ArrowUpRight size={16} />
        </a>
      </div>
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
  return (
    <section className="advantages section-pad" id="advantages">
      <div className="container">
        <div data-reveal>
          <SectionLabel eyebrow="CAPABILITY" title="个人优势" />
        </div>
        <div className="advantage-grid">
          {advantages.map(({ title, description, icon: Icon }, index) => (
            <article
              className="advantage-card"
              key={title}
              data-reveal
              data-glow
              style={revealDelay(`${index * 75}ms`)}
            >
              <Icon size={24} strokeWidth={1.6} />
              <h3>{title}</h3>
              <p>{description}</p>
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
      <picture className="contact-scenery" aria-hidden="true">
        <source
          media="(max-width: 760px)"
          srcSet="/portfolio/contact-sand-rider-25075a11-mobile.webp"
          width={1600}
          height={914}
        />
        <img
          className="contact-landscape"
          src="/portfolio/contact-sand-rider-25075a11.webp"
          alt=""
          width={2720}
          height={1554}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className="container contact-inner">
        <div className="contact-copy">
          <h2 id="contact-title">期待下一次<br />有价值的商业视觉合作。</h2>
        </div>
        <div className="contact-panel">
          <a href={`mailto:${contacts.email}`}>
            <span>{contacts.email}</span>
            <Send size={20} />
          </a>
          <a href={`tel:${contacts.phone}`}>
            <span>{contacts.phone}</span>
            <Phone size={20} />
          </a>
          <a href={`https://${contacts.behance}`} target="_blank" rel="noopener noreferrer">
            <span>{contacts.behance}</span>
            <span className="sr-only">（在新标签页打开）</span>
            <SquareArrowOutUpRight size={20} />
          </a>
          <p><span>{contacts.location}</span></p>
        </div>
      </div>
    </footer>
  );
}

function SectionLabel({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="section-label">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
    </div>
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
