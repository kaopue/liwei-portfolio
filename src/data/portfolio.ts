import curatedProjects from "./curatedProjects.json";
import {
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  FileStack,
  Handshake,
  Layers3,
  Palette,
  PenTool,
  Presentation,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  icon: LucideIcon;
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

export const skills = [
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Premiere",
  "After Effects",
  "Cinema 4D",
  "Midjourney",
  "Stable Diffusion",
  "即梦 AI",
];

export const experiences = [
  {
    period: "2013.10 - 2016.03",
    company: "石家庄海印设计品牌策划",
    role: "视觉设计师",
    points: [
      "根据客户需求完成产品包装、海报、画册及线下物料的创意设计与完稿制作。",
      "参与企业宣传册、项目广告及活动推广设计，提升品牌形象与市场传播效率。",
    ],
  },
  {
    period: "2016.05 - 2025.10",
    company: "北京佳禾广告传媒股份有限公司",
    role: "视觉设计师",
    points: [
      "负责图册、项目汇报 PPT、Logo、VI、画册、产品包装、促销物料与展览展示设计。",
      "带领设计小组完成多个品牌全案项目，确保设计质量、品牌一致性与落地效果。",
    ],
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
    icon: Layers3,
  },
  {
    title: "画册与包装落地",
    description: "熟悉画册、期刊、礼盒、产品包装的创意、排版、完稿与印刷制作流程。",
    icon: FileStack,
  },
  {
    title: "活动与传播物料",
    description: "能围绕活动主题快速输出主视觉、海报、展板、喷绘与现场应用系统。",
    icon: Presentation,
  },
  {
    title: "客户沟通与提案",
    description: "能高效理解客户需求，组织设计逻辑，并以清晰方案推动项目落地。",
    icon: Handshake,
  },
  {
    title: "AI 辅助创意",
    description: "将 MJ、SD、即梦等工具用于概念探索、气氛图和视觉方向快速验证。",
    icon: Bot,
  },
  {
    title: "多软件协同",
    description: "熟练使用 PS、AI、ID、PR、AE、C4D，覆盖平面、影像与基础三维表达。",
    icon: BadgeCheck,
  },
];

export const focusAreas = [
  { icon: Palette, label: "视觉识别" },
  { icon: PenTool, label: "平面版式" },
  { icon: BriefcaseBusiness, label: "商业落地" },
  { icon: Sparkles, label: "AI 创意" },
];
