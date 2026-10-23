import type { Project } from "./data/portfolio";
import { WorkImage } from "./WorkImage";

export default function WorkDetailPage({ project, categoryLabel }: {
  project: Project;
  categoryLabel: string;
}) {
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
            <WorkImage src={project.cover} alt={`${project.title} 封面`} loading="eager" sizes="(max-width: 1180px) calc(100vw - 36px), 65vw" />
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
              <WorkImage src={image} alt={`${project.title} 详情图 ${index + 1}`} sizes="(max-width: 1180px) calc(100vw - 36px), 48vw" />
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
