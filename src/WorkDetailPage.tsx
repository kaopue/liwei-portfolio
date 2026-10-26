import type { Project } from "./data/portfolio";
import { WorkImage } from "./WorkImage";
import curatedImages from "./data/curatedImages.json";

export default function WorkDetailPage({ project, categoryLabel }: {
  project: Project;
  categoryLabel: string;
}) {
  const isLongImage = (src: string) => {
    const image = curatedImages[src as keyof typeof curatedImages];
    return image && image.height / image.width > 3;
  };
  const hasLongCover = isLongImage(project.cover);
  const galleryImages = hasLongCover
    ? project.images
    : project.images.filter((image) => image !== project.cover);

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
            {project.year && <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>}
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
            <WorkImage src={project.cover} alt={`${project.title} 封面预览`} loading="eager" sizes="(max-width: 1180px) calc(100vw - 36px), 65vw" />
          </div>
          <div className="project-detail-info">
            <p>{project.description}</p>
            {hasLongCover && <p>下方按完整比例展示长图，可点击放大阅读。</p>}
            {!hasLongCover && <p className="image-view-hint">点击图片查看大图与设计细节。</p>}
          </div>
        </div>

        {project.detailSections.length > 0 && <div className="case-study-sections">
          {project.detailSections.map((section) => (
            <article key={section.title}>
              <p className="eyebrow">{section.title}</p>
              <p>{section.body}</p>
            </article>
          ))}
        </div>}

        {galleryImages.length > 0 && <>
          <div className="detail-gallery-head">
          <p className="eyebrow">PROCESS / DISPLAY</p>
          <h2>完整作品展示</h2>
          <p>点击图片查看大图与设计细节。</p>
        </div>

        <div className="detail-gallery">
          {galleryImages.map((image, index) => (
            <figure key={image}>
              <WorkImage src={image} alt={`${project.title} 详情图 ${index + 1}`} sizes={isLongImage(image) ? "(max-width: 1180px) calc(100vw - 36px), 96vw" : "(max-width: 1180px) calc(100vw - 36px), 48vw"} />
            </figure>
          ))}
        </div>
        </>}

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
