import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  Mail,
  Moon,
  Phone,
  Send,
  SquareArrowOutUpRight,
  Sun,
} from "lucide-react";
import { useTheme } from "./useTheme";
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
import homepageImages from "./data/homepageImages.json";

const revealDelay = (delay: string): CSSProperties =>
  ({ "--reveal-delay": delay }) as CSSProperties;

type HashRoute = { kind: "home" } | { kind: "work"; slug: string };

const getHashRoute = (): HashRoute => {
  if (typeof window === "undefined") {
    return { kind: "home" };
  }

  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));

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
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [route]);

  if (route.kind === "work") {
    return (
      <main>
        <SiteHeader theme={theme} onToggleTheme={toggleTheme} />
        {routeProject ? <WorkDetailPage project={routeProject} /> : <WorkNotFound slug={route.slug} />}
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
      <Contact />
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
      <a href="#top" className="brand-mark" aria-label="LW，回到首页">
        <span className="brand-monogram" aria-hidden="true">LW</span>
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

const heroProjects = [
  "zhangshuntang-yunnan-tea-packaging",
  "leebeer-german-craft-beer-packaging",
  "ch9-aerospace-cultural-creative",
  "yunshang-kangyuan-eye-patch-packaging",
  "zhangshuntang-tea-gift-packaging",
  "daerle-calcium-zinc-oral-solution-packaging",
  "tongren-dual-surface-defocus-lens-packaging",
  "caaa-aerospace-commemorative-badges",
].map((slug) => projects.find((project) => project.slug === slug)!);

function Hero() {
  const posterRef = useRef<HTMLImageElement>(null);
  const [videoMode, setVideoMode] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    let cancelled = false;
    let painted = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const update = () => {
      if (!cancelled) {
        setVideoMode(painted && !motion.matches ? (mobile.matches ? "mobile" : "desktop") : null);
      }
    };

    // Let the high-priority poster paint before requesting any video bytes.
    void posterRef.current?.decode().catch(() => {}).then(() => {
      if (cancelled) return;
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          painted = true;
          update();
        });
      });
    });
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" type="image/webp" srcSet="/hero/hero-rooftop-poster-mobile.webp" />
          <source type="image/webp" srcSet="/hero/hero-rooftop-poster.webp" />
          <img
            ref={posterRef}
            className="hero-poster"
            src="/hero/hero-rooftop-poster.jpg"
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
          />
        </picture>
        {videoMode && (
          <video
            key={videoMode}
            className="hero-video"
            poster="/hero/hero-rooftop-poster.jpg"
            aria-hidden="true"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            {videoMode === "mobile" ? (
              <source src="/hero/hero-rooftop-loop-720p.mp4" type="video/mp4" />
            ) : (
              <>
                <source src="/hero/hero-rooftop-loop-1080p.webm" type="video/webm" />
                <source src="/hero/hero-rooftop-loop-1080p.mp4" type="video/mp4" />
              </>
            )}
          </video>
        )}
      </div>
      <div className="hero-shade" aria-hidden="true" />
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
                src={`/hero/covers/${project.slug}-thumb.webp`}
                srcSet={`/hero/covers/${project.slug}-thumb-small.webp 160w, /hero/covers/${project.slug}-thumb.webp 320w`}
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
    <section className="about section-pad" id="about">
      <div className="container">
        <div className="about-spread" data-reveal>
          <img
            className="about-spread-image"
            src="/hero/about-profile.webp"
            width={1400}
            height={788}
            alt="李维侧光肖像"
            loading="lazy"
            decoding="async"
          />

          <div className="about-display-word" aria-hidden="true" data-reveal>
            VISUAL DESIGNER
          </div>

          <div className="about-spread-main" data-reveal style={revealDelay("90ms")}>
            <h2>把商业信息整理成清晰、有辨识度、能落地的视觉表达。</h2>
            <p>
              具备扎实的视觉传达与品牌设计基础，擅长建立富有辨识度的品牌视觉系统。
              拥有丰富实际项目经验，曾独立完成 Logo、VI 系统及品牌宣传物料设计，
              注重沟通、提案与高质量落地。
            </p>
          </div>

          <div className="about-spread-lower">
            <div className="about-spread-experience">
              <div className="about-spread-timeline">
                {experiences.map((item, index) => (
                  <article key={item.company} data-reveal style={revealDelay(`${index * 80 + 120}ms`)}>
                    <time>{item.period}</time>
                    <div>
                      <h3>{item.company}</h3>
                      <p>{item.points[0]}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="about-spread-side">
            <div className="about-tag-list" data-reveal style={revealDelay("180ms")}>
              {focusAreas.map(({ icon: Icon, label }, index) => (
                <span key={label} data-glow style={revealDelay(`${index * 45}ms`)}>
                  <Icon size={16} />
                  {label}
                </span>
              ))}
              {skills.slice(0, 6).map((skill, index) => (
                <span key={skill} data-glow style={revealDelay(`${index * 35}ms`)}>
                  {skill}
                </span>
              ))}
            </div>
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
    const syncFromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));

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
    return () => window.removeEventListener("hashchange", syncFromHash);
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
            <p>覆盖品牌识别、商业画册、活动传播、包装系统与多类型平面物料。按分类查看已经整理好的项目，点击任意卡片可进入详情。</p>
          </div>

          <div className="category-filters" aria-label="作品分类筛选">
            <button
              className={activeCategory === "all" ? "is-active" : ""}
              type="button"
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
        <time>{project.year}</time>
      </div>
      <p className="project-summary">{project.summary}</p>
      <div className="project-actions">
        <a href={`#work/${project.slug}`}>
          查看详情
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="tag-row">
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

function WorkDetailPage({ project }: { project: Project }) {
  const categoryLabel = getProjectCategoryLabel(project);

  return (
    <section className="work-detail-page section-pad" id="work-detail" aria-label={`${project.title} 详情`}>
      <div className="container">
        <div className="project-detail-head">
          <div>
            <p className="eyebrow">{categoryLabel}</p>
            <h1>{project.title}</h1>
          </div>
          <a className="detail-back" href="#projects">
            返回作品列表
          </a>
        </div>

        <div className="work-detail-hero">
          <p>{project.summary}</p>
          <dl>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{project.type}</dd>
            </div>
            <div>
              <dt>Images</dt>
              <dd>{project.images.length}</dd>
            </div>
          </dl>
        </div>

        <div className="project-detail-layout">
          <div className="project-detail-cover">
            <img src={project.cover} alt={`${project.title} 封面`} loading="eager" decoding="async" />
          </div>
          <div className="project-detail-info">
            <p>{project.description}</p>
            <div className="tag-row">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="case-study-sections">
          {project.detailSections.map((section) => (
            <article key={section.title}>
              <p className="eyebrow">{section.title}</p>
              <p>{section.body}</p>
            </article>
          ))}
        </div>

        <div className="detail-gallery-head">
          <p className="eyebrow">PROCESS / DISPLAY</p>
          <h2>项目过程 / 展示图</h2>
        </div>

        <div className="detail-gallery">
          {project.images.map((image, index) => (
            <figure key={image}>
              <img src={image} alt={`${project.title} 详情图 ${index + 1}`} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>

        <div className="detail-footer-actions">
          <a className="detail-back" href="#projects">
            返回作品列表
          </a>
          <a className="detail-back secondary" href="#top">
            返回首页
          </a>
        </div>
      </div>
    </section>
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
    <footer className="contact section-screen" id="contact">
      <div className="contact-scenery" aria-hidden="true">
        <img
          className="contact-city contact-city-night"
          src="/portfolio/contact-city-night.webp"
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
        />
        <img
          className="contact-city contact-city-day"
          src="/portfolio/contact-city-day.webp"
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
          <a href={`https://${contacts.behance}`} target="_blank">
            <span>{contacts.behance}</span>
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
    const glowItems = Array.from(document.querySelectorAll<HTMLElement>("[data-glow]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsRevealObserver = "IntersectionObserver" in window;

    const cleanups = glowItems.map((item) => {
      const handlePointerMove = (event: PointerEvent) => {
        const rect = item.getBoundingClientRect();
        item.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        item.style.setProperty("--my", `${event.clientY - rect.top}px`);
      };

      item.addEventListener("pointermove", handlePointerMove);
      return () => item.removeEventListener("pointermove", handlePointerMove);
    });

    if (!reduceMotion && supportsRevealObserver && revealItems.length > 0) {
      document.documentElement.classList.add("reveal-motion");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.14 },
      );

      revealItems.forEach((item) => observer.observe(item));

      window.requestAnimationFrame(() => {
        revealItems.forEach((item) => {
          const rect = item.getBoundingClientRect();

          if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
            item.classList.add("is-visible");
          }
        });
      });

      const revealFallback = window.setTimeout(() => {
        revealItems.forEach((item) => item.classList.add("is-visible"));
      }, 1600);

      return () => {
        window.clearTimeout(revealFallback);
        observer.disconnect();
        cleanups.forEach((cleanup) => cleanup());
        document.documentElement.classList.remove("reveal-motion");
      };
    }

    revealItems.forEach((item) => item.classList.add("is-visible"));
    document.documentElement.classList.remove("reveal-motion");

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [routeKey]);
}

export default App;
