import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand } from "lucide-react";
import { projects, type Project } from "./data/portfolio";
import { WorkImage } from "./WorkImage";
import { WorkLightbox } from "./WorkLightbox";
import { getWorkBrowseState } from "./workBrowsing";
import homepageImages from "./data/curatedCovers.json";

const orderedProjects = [...projects].sort((a, b) => a.priority - b.priority);

export default function WorkDetailPage({ project, categoryLabel }: {
  project: Project;
  categoryLabel: string;
}) {
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const images = [...new Set([project.cover, ...project.images])];
  const nextProject = orderedProjects[(orderedProjects.findIndex((item) => item.slug === project.slug) + 1) % orderedProjects.length];
  const nextCover = homepageImages[nextProject.slug as keyof typeof homepageImages];
  const returnHash = getWorkBrowseState()?.hash ?? "#projects";

  return (
    <section className="work-detail-page visual-case-page" id="work-detail" aria-label={`${project.title} 详情`}>
      <div className="visual-case-header">
        <a className="case-return" href={returnHash}><ArrowLeft size={17} aria-hidden="true" />返回作品</a>
        <div className="visual-case-title">
          <h1>{project.title}</h1>
          <p className="case-category">{categoryLabel}</p>
          <p className="visual-case-summary">{project.summary}</p>
        </div>
        <div className="visual-case-byline">
          <span>李维 <span className="case-byline-role">/ 视觉设计师</span></span>
          <span>{project.year ? `${project.year} · ` : ""}{images.length} 张作品</span>
        </div>
      </div>

      <div className="visual-case-gallery" aria-label="完整作品图集">
        {images.map((src, index) => (
          <figure key={src}>
            <WorkImage src={src} alt={`${project.title}，第 ${index + 1} 张作品`} loading={index === 0 ? "eager" : "lazy"} sizes="(max-width: 700px) 100vw, (max-width: 1400px) 92vw, 1280px" onOpen={() => setActiveImage(index)} />
            <span className="case-image-expand" aria-hidden="true"><Expand size={16} />放大查看</span>
          </figure>
        ))}
      </div>

      <div className="visual-case-notes">
        <div><h2>关于项目</h2><p>{project.description}</p></div>
        {project.detailSections.map((section) => (
          <div key={section.title}><h2>{section.title}</h2><p>{section.body}</p></div>
        ))}
        <a className="case-contact" href="mailto:501705971@qq.com">聊聊你的项目 <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>

      <div className="visual-case-end">
        <p>感谢观看</p>
        <a className="case-return" href={returnHash}><ArrowLeft size={17} aria-hidden="true" />返回作品列表</a>
      </div>

      <a className="case-next" href={`#work/${nextProject.slug}`}>
        <div><span>继续浏览 / 下一个项目</span><h2>{nextProject.title}</h2><ArrowRight size={26} aria-hidden="true" /></div>
        <img src={nextCover?.src ?? nextProject.cover} width={nextCover?.width} height={nextCover?.height} loading="lazy" decoding="async" alt="" />
      </a>

      {activeImage !== null && <WorkLightbox images={images} title={project.title} initialIndex={activeImage} onDismiss={() => setActiveImage(null)} />}
    </section>
  );
}
