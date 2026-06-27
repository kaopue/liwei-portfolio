import {
  type CSSProperties,
  useEffect,
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
  projects,
  skills,
  stats,
} from "./data/portfolio";

const revealDelay = (delay: string): CSSProperties =>
  ({ "--reveal-delay": delay }) as CSSProperties;

function App() {
  usePortfolioMotion();

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
      <img
        className="hero-bg"
        src="/portfolio/hero-gpt-image2.png"
        alt=""
        aria-hidden="true"
      />
      <div className="hero-shade" />
      <div className="container hero-inner">
        <div className="hero-kicker" data-reveal>
          <span>VISUAL DESIGN PORTFOLIO</span>
          <span>2025</span>
        </div>
        <div className="hero-layout">
          <div data-reveal>
            <h1>
              李维
              <span>视觉设计师</span>
            </h1>
            <p className="hero-copy">
              十年商业视觉设计经验，覆盖画册、品牌 VI、Logo、海报、活动与包装设计。
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
        <div className="section-head about-head" data-reveal>
          <SectionLabel eyebrow="ABOUT LIWEI" title="个人经历" />
          <p>
            十年商业视觉设计经验，覆盖画册、品牌 VI、Logo、海报、活动与包装设计，
            以清晰的信息层级和可落地的视觉系统服务真实项目。
          </p>
        </div>

        <div className="about-spread" data-reveal>
          <img
            className="about-spread-image"
            src="/portfolio/about-profile-cinematic.png"
            alt="李维侧光肖像"
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

            <div className="about-spread-side">
              <div className="about-focus-list" data-reveal style={revealDelay("180ms")}>
                {focusAreas.map(({ icon: Icon, label }, index) => (
                  <span key={label} data-glow style={revealDelay(`${index * 45}ms`)}>
                    <Icon size={16} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="about-tool-list" data-reveal style={revealDelay("240ms")}>
                {skills.slice(0, 6).map((skill, index) => (
                  <span key={skill} data-glow style={revealDelay(`${index * 35}ms`)}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section className="projects section-pad" id="projects">
      <div className="container">
        <div className="section-head" data-reveal>
          <SectionLabel eyebrow="SELECTED WORKS" title="精选项目" />
          <p>
            覆盖品牌识别、商业画册、活动传播、包装系统与多类型平面物料，强调清晰的信息层级和可落地的视觉表达。
          </p>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <article
              className={`project-card ${project.layout ?? ""}`}
              key={project.title}
              data-reveal
              data-glow
              style={revealDelay(`${index * 80}ms`)}
            >
              <a href={project.image} target="_blank" aria-label={`查看 ${project.title}`}>
                <div className="project-image">
                  <img src={project.image} alt={project.title} loading={index < 2 ? "eager" : "lazy"} />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
              </a>
              <div className="project-meta">
                <div>
                  <p>{project.category}</p>
                  <h3>{project.title}</h3>
                </div>
                <time>{project.year}</time>
              </div>
              <p className="project-summary">{project.summary}</p>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
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
        <div className="contact-panel" data-reveal data-glow>
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

function usePortfolioMotion() {
  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const glowItems = Array.from(document.querySelectorAll<HTMLElement>("[data-glow]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
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

      const cleanups = glowItems.map((item) => {
        const handlePointerMove = (event: PointerEvent) => {
          const rect = item.getBoundingClientRect();
          item.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          item.style.setProperty("--my", `${event.clientY - rect.top}px`);
        };

        item.addEventListener("pointermove", handlePointerMove);
        return () => item.removeEventListener("pointermove", handlePointerMove);
      });

      return () => {
        observer.disconnect();
        cleanups.forEach((cleanup) => cleanup());
      };
    }

    revealItems.forEach((item) => item.classList.add("is-visible"));
  }, []);
}

export default App;
