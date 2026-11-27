import curatedProjects from "./curatedProjects.json";
import type curatedCovers from "./curatedCovers.json";

export type Project = {
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  year: string;
  image: string;
  cover: string;
  summary: string;
  description: string;
  tags: string[];
  detailSections: ProjectDetailSection[];
  images: string[];
  type: string;
  featured: boolean;
  priority: number;
  layout?: "wide" | "tall";
};

export type ProjectDetailSection = {
  title: string;
  body: string;
};

export type ProjectCategory = {
  slug: string;
  label: string;
  description: string;
};

export type Advantage = {
  title: string;
  description: string;
  art: string;
  relatedProject?: keyof typeof curatedCovers;
};

export const navItems = [
  { label: "经历", href: "#about" },
  { label: "项目", href: "#projects" },
  { label: "优势", href: "#advantages" },
  { label: "联系", href: "#contact" },
];

export const contacts = {
  name: "李维",
  role: "视觉设计师",
  location: "河北 石家庄",
  phone: "15931675970",
  email: "501705971@qq.com",
  behance: "www.behance.net/zhaozhao0812",
};

export const experiences = [
  {
    period: "2013.10 — 2016.03",
    company: "石家庄海印设计品牌策划",
    role: "视觉设计师",
    description: "负责品牌包装、企业画册及线下传播物料的创意设计与印前落地，建立扎实的商业执行与工艺把控能力。",
  },
  {
    period: "2016.05 — 2025.10",
    company: "北京佳禾广告传媒股份有限公司",
    role: "资深视觉设计师",
    description: "主导企业品牌全案（Logo/VI）、产品包装、高端画册，深度参与客户提案与商业视觉策略落地。",
  },
  {
    period: "2025.11 — 2026.11",
    company: "北京莱恩瑞景品牌设计有限公司",
    role: "资深视觉设计师",
    description: "专注品牌视觉升级、文创与消费品包装设计，探索传统美学、现代网格系统与 AI 视觉生成的商业融合。",
  },
];

export const projectCategories: ProjectCategory[] = [
  {
    "slug": "brand-identity",
    "label": "品牌识别",
    "description": "标志、视觉识别系统与品牌应用。"
  },
  {
    "slug": "packaging",
    "label": "包装设计",
    "description": "茶礼、食品、日用与健康产品包装。"
  },
  {
    "slug": "visual-communication",
    "label": "海报与视觉传播",
    "description": "活动主视觉、屏幕演示、招聘长图与形象墙。"
  },
  {
    "slug": "cultural-creative",
    "label": "徽章与文创",
    "description": "航天主题徽章、钥匙扣与配套物料。"
  },
  {
    "slug": "type-design",
    "label": "字体设计",
    "description": "中英文字形与品牌字体组合。"
  },
  {
    "slug": "editorial",
    "label": "折页设计",
    "description": "商品手册与折页的信息编排。"
  }
];

export const projects: Project[] = curatedProjects;

export const advantages: Advantage[] = [
  {
    title: "品牌视觉系统",
    description: "从 Logo、VI 到辅助图形与应用物料，建立具备延展性的品牌识别语言。",
    art: "brand-systems",
    relatedProject: "yunshang-kangyuan-visual-identity",
  },
  {
    title: "画册与包装落地",
    description: "熟悉画册、期刊、礼盒、产品包装的创意、排版、完稿与印刷制作流程。",
    art: "print-packaging",
    relatedProject: "zhangshuntang-tea-tin-packaging",
  },
  {
    title: "活动与传播物料",
    description: "能围绕活动主题快速输出主视觉、海报、展板、喷绘与现场应用系统。",
    art: "event-visuals",
    relatedProject: "song-gift-2025-concert",
  },
  {
    title: "客户沟通与提案",
    description: "能高效理解客户需求，组织设计逻辑，并以清晰方案推动项目落地。",
    art: "client-presentation",
  },
  {
    title: "AI 辅助创意",
    description: "将 MJ、SD、即梦等工具用于概念探索、气氛图和视觉方向快速验证。",
    art: "ai-ideation",
  },
  {
    title: "多软件协同",
    description: "熟练使用 PS、AI、ID、PR、AE、C4D，覆盖平面、影像与基础三维表达。",
    art: "creative-toolkit",
  },
];
