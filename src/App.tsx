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
  Moon,
  Pause,
  Phone,
  Play,
  Send,
  SquareArrowOutUpRight,
  Sun,
} from "lucide-react";
import { useTheme } from "./useTheme";
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
  skills,
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
  const { theme, toggleTheme } = useTheme();
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
        <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
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
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
      <Hero />
      <About />
      <Projects />
      <Advantages />
      <Contact theme={theme} />
    </main>
  );
}

function SiteHeader({ theme, onToggleTheme }: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const nextThemeLabel = theme === "dark" ? "白天模式" : "暗黑模式";

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
      <div className="header-actions">
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`切换到${nextThemeLabel}`}
          title={`切换到${nextThemeLabel}`}
        >
          {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          <span>{nextThemeLabel}</span>
        </button>
        <a className="header-cta" href={`mailto:${contacts.email}`}>
          <Mail size={16} />
          联系我
        </a>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {theme === "dark" ? "已启用暗黑模式" : "已启用白天模式"}
      </span>
    </header>
  );
}

const heroProjects = [...projects]
  .filter((project) => project.featured)
  .sort((left, right) => left.priority - right.priority)
  .slice(0, 8);

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
                src={homepageImages[project.slug as keyof typeof homepageImages]?.thumbSrc ?? project.cover}
                srcSet={`${homepageImages[project.slug as keyof typeof homepageImages]?.smallThumbSrc} 160w, ${homepageImages[project.slug as keyof typeof homepageImages]?.thumbSrc} 320w`}
                sizes="(max-width: 600px) 76px, (max-width: 900px) 100px, (max-width: 1180px) 12vw, (max-width: 1920px) calc((100vw - 178px) / 8), 224px"
                alt=""
                width={320}
                height={400}
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
    <section className="about" id="about" aria-labelledby="about-name">
      <div className="container about-inner">
        <div className="about-composition">
          <div className="about-copy">
            <p className="eyebrow about-section-label">
              <span aria-hidden="true">02</span>
              <span>ABOUT · 关于我</span>
            </p>
            <div className="about-identity">
              <h2 id="about-name">{contacts.name}</h2>
              <div className="about-identity-english">
                <p>LI WEI</p>
                <p className="eyebrow">VISUAL DESIGNER</p>
              </div>
            </div>
            <p className="about-statement">
              把商业信息整理成<br />
              <span>清晰、有辨识度、能落地</span>的视觉表达。
            </p>
            <p className="about-summary">
              具备扎实的视觉传达与品牌设计基础，擅长建立富有辨识度的品牌视觉系统。
              独立完成过 Logo、VI 与整套品牌宣传物料，注重沟通、提案与高质量落地。
            </p>
          </div>
          <figure className="about-portrait">
            <img
              src="/hero/about-profile.webp"
              width={1400}
              height={788}
              alt="李维的黑白侧光肖像"
              loading="lazy"
              decoding="async"
            />
            <div className="about-portrait-frame" aria-hidden="true" />
            <figcaption aria-hidden="true">LI WEI — VISUAL DESIGNER — SINCE 2013</figcaption>
          </figure>
        </div>
        <div className="about-facts">
          <div className="about-tenure">
            <p><strong>12</strong><span>年</span></p>
            <p>视觉设计经验</p>
          </div>
          {experiences.map((item) => (
            <article className="about-experience" key={item.company}>
              <p className="eyebrow about-period">{item.period}</p>
              <h3>{item.company}</h3>
              <p>{item.points[0]}</p>
            </article>
          ))}
          <div className="about-capabilities">
            <p className="eyebrow">CAPABILITIES</p>
            <ul>
              {focusAreas.map(({ label }) => <li key={label}>{label}</li>)}
            </ul>
            <p className="about-tools">{skills.slice(0, 6).join(" · ")}</p>
          </div>
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

function Contact({ theme }: { theme: "light" | "dark" }) {
  return (
    <footer className="contact section-screen" id="contact">
      <div className="contact-scenery" aria-hidden="true">
        <img
          key={theme}
          className="contact-city"
          src={`/portfolio/contact-city-${theme === "dark" ? "night" : "day"}.webp`}
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="container contact-inner">
        <div className="contact-copy" data-reveal>
          <p className="eyebrow">CONTACT</p>
          <h2>让下一个项目，<br />从更清晰的视觉<br />判断开始。</h2>
        </div>
        <div className="contact-panel" data-reveal>
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
