import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  Mail,
  Phone,
  Send,
  SquareArrowOutUpRight,
} from "lucide-react";
import {
  advantages,
  contacts,
  experiences,
  focusAreas,
  navItems,
  projectCategories,
  projects,
  skills,
  stats,
} from "./data/portfolio";
import type { Project } from "./data/portfolio";

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
        <SiteHeader />
        {routeProject ? <WorkDetailPage project={routeProject} /> : <WorkNotFound slug={route.slug} />}
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
      <a href="#top" className="brand-mark" aria-label="回到首页">
        <img src="/portfolio/logo-liwei-mark.png" alt="李维个人 Logo" />
      </a>
      <nav className="nav-links" aria-label="主导航">
        {navItems.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href={`mailto:${contacts.email}`}>
        <Mail size={16} />
        联系我
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero section-screen" id="top">
      <div className="motion-field" aria-hidden="true">
        <span className="motion-band motion-band-one" />
        <span className="motion-band motion-band-two" />
        <span className="motion-ribbon" />
      </div>
      <video
        className="hero-bg"
        poster="/portfolio/hero-poster.jpg"
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/portfolio/hero-cinemagraph.mp4" type="video/mp4" />
      </video>
      <div className="hero-shade" />
      <div className="container hero-inner">
        <div className="hero-layout">
          <div data-reveal>
            <h1>
              <span>用秩序梳理信息，</span>
              <span>用情绪建立感知。</span>
            </h1>
            <p className="hero-copy">
              专注品牌视觉、包装设计、活动主视觉与 AI 辅助创意表达。擅长在商业目标、视觉美感与落地执行之间建立秩序，让设计不仅好看，也能被理解、被传播、被使用。
            </p>
          </div>
          <div className="hero-panel" data-reveal data-glow>
            <p>均为真实案例，无临摹作品、非培训机构套模板。</p>
            <div className="hero-actions">
              <a href="#projects" className="primary-link">
                查看项目
                <ArrowUpRight size={18} />
              </a>
              <a href={`https://${contacts.behance}`} className="text-link" target="_blank">
                Behance
                <SquareArrowOutUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          {stats.map((item, index) => (
            <div className="stat" key={item.label} data-reveal data-glow style={revealDelay(`${index * 70}ms`)}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
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
            src="/portfolio/about-profile-cinematic.png"
            alt="李维侧光肖像"
            loading="lazy"
            decoding="async"
          />

          <div className="about-display-word" aria-hidden="true" data-reveal>
            VISUAL DESIGNER
          </div>

          <div className="about-spread-main" data-reveal style={revealDelay("90ms")}>
            <h3>把商业信息整理成清晰、有辨识度、能落地的视觉表达。</h3>
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
              <h3>精选项目</h3>
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
                eager={index < 2}
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
  eager = false,
}: {
  project: Project;
  index: number;
  eager?: boolean;
}) {
  const categoryLabel = getProjectCategoryLabel(project);

  return (
    <article className={`project-card ${project.layout ?? ""}`} data-glow>
      <a
        href={`#work/${project.slug}`}
        aria-label={`查看 ${project.title}`}
      >
        <div className="project-image">
          <img src={project.cover} alt={project.title} loading={eager ? "eager" : "lazy"} decoding="async" />
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
      <div className="container contact-inner">
        <div data-reveal>
          <p className="eyebrow">CONTACT</p>
          <h2>让下一个项目，从更清晰的视觉判断开始。</h2>
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
          <p>{contacts.location}</p>
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
