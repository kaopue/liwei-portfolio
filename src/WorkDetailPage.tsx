import { Fragment, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Expand } from "lucide-react";
import { contacts, projects, type Project } from "./data/portfolio";
import { caseEditorial } from "./data/caseEditorial";
import { WorkImage } from "./WorkImage";
import { WorkLightbox } from "./WorkLightbox";
import { getWorkReturnHref, getWorkReturnLabel, returnToWorkBrowse } from "./workBrowsing";
import { navigatePortfolio, workHref } from "./workRoutes";
import homepageImages from "./data/curatedCovers.json";
import mobileCovers from "./data/mobileCovers.json";

const orderedProjects = [...projects].sort((a, b) => a.priority - b.priority);

export default function WorkDetailPage({ project, categoryLabel }: {
  project: Project;
  categoryLabel: string;
}) {
  const [activeImage, setActiveImage] = useState<{ index: number; trigger: HTMLAnchorElement } | null>(null);
  const images = [...new Set([project.cover, ...project.images])];
  const editorial = caseEditorial[project.slug];
  const descriptions = images.map((src, index) => {
    const imageNumber = src.match(/\/(image-\d+)-/)?.[1];
    return (imageNumber && editorial?.images[imageNumber])
      || project.title + "，第 " + (index + 1) + " 张作品";
  });
  const nextProject = orderedProjects[(orderedProjects.findIndex((item) => item.slug === project.slug) + 1) % orderedProjects.length];
  const nextCover = homepageImages[nextProject.slug as keyof typeof homepageImages];
  const nextCoverDelivery = mobileCovers[nextProject.slug as keyof typeof mobileCovers];
  const returnHref = getWorkReturnHref();
  const returnLabel = getWorkReturnLabel();
  const titleParts = project.title.split(/(（[^（）]{1,8}）)/g);

  const dismissLightbox = () => {
    activeImage?.trigger.focus({ preventScroll: true });
    setActiveImage(null);
  };

  return (
    <section className="work-detail-page visual-case-page" id="work-detail" aria-labelledby="case-title">
      <div className="container visual-case-header">
        <a className="case-return" href={returnHref} onClick={returnToWorkBrowse}>
          <ArrowLeft size={17} aria-hidden="true" />{returnLabel}
        </a>
        <div className="visual-case-title">
          <h1 id="case-title" tabIndex={-1}>
            {titleParts.map((part, index) => index % 2
              ? <span className="case-title-group" key={index}>{part}</span>
              : part)}
          </h1>
          <p className="case-category">{categoryLabel}</p>
          <p className="visual-case-summary">{project.summary}</p>
        </div>
        <div className="visual-case-byline">
          <span>{contacts.name} <span className="case-byline-role">/ {contacts.role}</span></span>
          <span>{project.year ? project.year + " · " : ""}{images.length} 张作品</span>
        </div>
      </div>

      <div className="container visual-case-gallery" aria-label="完整作品图集">
        {images.map((src, index) => (
          <Fragment key={src}>
            <figure>
              <WorkImage
                src={src}
                alt={descriptions[index]}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="min(1440px, calc(100vw - 30px))"
                onOpen={(trigger) => setActiveImage({ index, trigger })}
              />
              <span className="case-image-expand" aria-hidden="true"><Expand size={16} aria-hidden="true" />放大查看</span>
            </figure>
            {index === 0 && editorial?.context && (
              <section className="case-context" aria-labelledby="case-context-title">
                <h2 id="case-context-title">项目概览</h2>
                {editorial.scope && <p className="case-context-scope">{editorial.scope}</p>}
                <p>{editorial.context}</p>
              </section>
            )}
          </Fragment>
        ))}
      </div>

      <div className="container visual-case-notes">
        <div><h2>关于项目</h2><p>{project.description}</p></div>
        {project.detailSections.map((section) => (
          <div key={section.title}><h2>{section.title}</h2><p>{section.body}</p></div>
        ))}
        <a className="case-contact" href={"mailto:" + contacts.email}>聊聊你的项目 <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>

      <div className="container visual-case-end">
        <p>感谢观看</p>
        <a className="case-return" href={returnHref} onClick={returnToWorkBrowse}>
          <ArrowLeft size={17} aria-hidden="true" />{returnLabel === "返回作品" ? "返回作品列表" : returnLabel}
        </a>
      </div>

      <a className="container case-next" href={workHref(nextProject.slug)} onClick={navigatePortfolio}>
        <div><span>继续浏览 / 下一个项目</span><h2>{nextProject.title}</h2><ArrowRight size={26} aria-hidden="true" /></div>
        <img
          src={nextCoverDelivery?.src ?? nextCover?.src ?? nextProject.cover}
          srcSet={nextCoverDelivery && (nextCoverDelivery.smallSrc + " 480w, " + nextCoverDelivery.src + " 960w")}
          sizes="(max-width: 700px) calc(100vw - 30px), min(720px, calc(50vw - 15px))"
          width={nextCover?.width}
          height={nextCover?.height}
          loading="lazy"
          decoding="async"
          alt=""
        />
      </a>

      {activeImage && (
        <WorkLightbox
          images={images}
          descriptions={descriptions}
          title={project.title}
          initialIndex={activeImage.index}
          onDismiss={dismissLightbox}
        />
      )}
    </section>
  );
}
