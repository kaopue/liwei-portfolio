import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import projects from "../src/data/curatedProjects.json";
import covers from "../src/data/curatedCovers.json";
import mobileCovers from "../src/data/mobileCovers.json";
import hero from "../src/data/optimizedVideos.json";
import { homeHref, workHref } from "../src/workRoutes";

const site = "https://liwei-portfolio-liart.vercel.app";
const siteName = "李维设计作品集";
const homeTitle = "李维 | 品牌视觉与包装设计作品集";
const homeDescription = "李维，拥有十余年经验的视觉设计师。专注品牌视觉、包装设计、活动主视觉与 AI 辅助创意表达，用秩序梳理信息，用情绪建立感知。真实商业案例与完整项目呈现。";

type Project = (typeof projects)[number];
type Page = Project | "home" | "not-found";

const orderedProjects = [...projects].sort((first, second) => first.priority - second.priority);
const projectsByPath = new Map(orderedProjects.map((project) => [workHref(project.slug), project]));
const htmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => htmlEntities[character]);

function projectCover(project: Project) {
  const cover = covers[project.slug as keyof typeof covers];
  const listingCover = mobileCovers[project.slug as keyof typeof mobileCovers];
  return { src: listingCover?.src ?? cover.src, width: cover.width, height: cover.height };
}

function renderHead(page: Page) {
  if (page === "not-found") {
    return `<title>页面未找到 | ${siteName}</title>\n    <meta name="robots" content="noindex" />`;
  }

  const isHome = page === "home";
  const title = escapeHtml(isHome ? homeTitle : `${page.title} | ${siteName}`);
  const description = escapeHtml(isHome ? homeDescription : page.summary);
  const url = site + (isHome ? homeHref() : workHref(page.slug));
  const cover = isHome
    ? { src: hero.posterJpg, width: hero.posterWidth, height: hero.posterHeight }
    : projectCover(page);
  const image = escapeHtml(site + cover.src);
  const imageAlt = escapeHtml(isHome ? "设计师在窗边工作，窗外是日出时的城市天际线" : page.title);
  const heroPreloads = isHome
    ? `<link rel="preload" as="image" type="image/webp" href="${hero.posterMobile}" media="(max-width: 767px)" fetchpriority="high" />
    <link rel="preload" as="image" type="image/webp" href="${hero.posterWebp}" media="(min-width: 768px)" fetchpriority="high" />
    `
    : "";

  return `${heroPreloads}<title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="${isHome ? "image/jpeg" : "image/webp"}" />
    <meta property="og:image:width" content="${cover.width}" />
    <meta property="og:image:height" content="${cover.height}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />`;
}

function renderFallback(page: Page) {
  const link = (href: string, label: string) => `<a href="${href}" style="text-decoration:underline;text-underline-offset:.18em">${escapeHtml(label)}</a>`;
  if (page === "home") {
    const links = orderedProjects.map(({ slug, title }) => `<li>${link(workHref(slug), title)}</li>`).join("\n        ");
    return `<h1>李维设计作品集</h1>
        <p>${escapeHtml(homeDescription)}</p>
        <h2 id="projects">作品展示</h2>
        <ul>${links}</ul>`;
  }

  const returnLink = `<p>${link(homeHref("#projects"), "返回作品列表")}</p>`;
  if (page === "not-found") {
    return `<h1>页面未找到</h1>
        <p>链接可能已失效。你可以返回作品列表继续浏览。</p>
        ${returnLink}`;
  }

  const cover = projectCover(page);
  return `${returnLink}
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.category)} · 李维</p>
        <p>${escapeHtml(page.description)}</p>
        <img src="${escapeHtml(cover.src)}" width="${cover.width}" height="${cover.height}" alt="${escapeHtml(page.title)}项目封面" style="max-width:100%;height:auto" />
        <p>启用 JavaScript 后可浏览完整图集。</p>`;
}

function renderPage(template: string, page: Page) {
  return template
    .replace("<!-- portfolio-head -->", () => renderHead(page))
    .replace("<!-- portfolio-no-script -->", () => `<noscript>
      <main style="width:min(calc(100% - 30px), 960px);margin:48px auto">
        ${renderFallback(page)}
      </main>
    </noscript>`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${["/", ...projectsByPath.keys()].map((path) => `<url><loc>${site}${path}</loc></url>`).join("\n  ")}
</urlset>
`;
function requestUrl(request: IncomingMessage) {
  return new URL(request.url ?? "/", site);
}

function documentPath(request: IncomingMessage) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const accept = request.headers.accept;
  if (accept && !accept.includes("text/html") && !accept.includes("*/*")) return null;
  const pathname = requestUrl(request).pathname;
  return !/\.[^/]+$/.test(pathname) || pathname.endsWith(".html") ? pathname : null;
}

function send(request: IncomingMessage, response: ServerResponse, body: string, status = 200, type = "text/html") {
  response.writeHead(status, { "Content-Type": `${type}; charset=utf-8` });
  response.end(request.method === "HEAD" ? undefined : body);
}

const redirectCaseAlias: Connect.NextHandleFunction = (request, response, next) => {
  const pathname = documentPath(request);
  const canonical = pathname?.replace(/(?:\.html|\/)$/, "");
  if (canonical && pathname !== canonical && projectsByPath.has(canonical)) {
    response.writeHead(308, { Location: canonical + requestUrl(request).search }).end();
  } else {
    next();
  }
};

export function portfolioPages(): Plugin {
  return {
    name: "portfolio-pages",
    transformIndexHtml(html, context) {
      if (context.server) return renderPage(html, "home");
    },
    configureServer(server) {
      server.middlewares.use(redirectCaseAlias);
      return () => {
        server.middlewares.use(async (request, response, next) => {
          const pathname = requestUrl(request).pathname;
          if (pathname === "/sitemap.xml") {
            if (request.method !== "GET" && request.method !== "HEAD") return next();
            return send(request, response, sitemap, 200, "application/xml");
          }

          const document = documentPath(request);
          if (!document || document === "/" || document === "/index.html") return next();
          const project = projectsByPath.get(document);
          try {
            const template = await readFile(resolve(server.config.root, "index.html"), "utf8");
            const page = renderPage(template, project ?? "not-found");
            const html = await server.transformIndexHtml("/index.html", page);
            send(request, response, html, project ? 200 : 404);
          } catch (error) {
            next(error);
          }
        });
      };
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirectCaseAlias);
      return () => {
        server.middlewares.use(async (request, response, next) => {
          const pathname = documentPath(request);
          if (!pathname || pathname === "/" || pathname === "/index.html" || projectsByPath.has(pathname.replace(/\.html$/, ""))) return next();
          try {
            const html = await readFile(resolve(server.config.root, server.config.build.outDir, "404.html"), "utf8");
            send(request, response, html, 404);
          } catch (error) {
            next(error);
          }
        });
      };
    },
    generateBundle: {
      order: "post",
      handler(_options, bundle) {
        const index = bundle["index.html"];
        if (index?.type !== "asset" || typeof index.source !== "string") {
          this.error("Expected Vite's built index.html before generating portfolio pages");
        }
        const template = index.source;
        index.source = renderPage(template, "home");
        for (const [path, project] of projectsByPath) {
          this.emitFile({ type: "asset", fileName: `${path.slice(1)}.html`, source: renderPage(template, project) });
        }
        this.emitFile({ type: "asset", fileName: "404.html", source: renderPage(template, "not-found") });
        this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      },
    },
  };
}
