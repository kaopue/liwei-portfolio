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
  category: string;
  year: string;
  image: string;
  summary: string;
  tags: string[];
  layout?: "wide" | "tall";
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

export const stats = [
  { value: "10+", label: "年视觉设计经验" },
  { value: "43", label: "页作品集内容" },
  { value: "6", label: "类项目方向" },
  { value: "100%", label: "真实落地案例" },
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

export const projects: Project[] = [
  {
    title: "天鸿圆方二十周年特刊",
    category: "Brochure Design",
    year: "2025",
    image: "/portfolio/page-04.jpg",
    summary: "以年轮、印章、时间刻度与红灰体系构建企业周年特刊的沉稳纪念感。",
    tags: ["画册", "周年特刊", "版式系统"],
    layout: "wide",
  },
  {
    title: "衡水湖期刊",
    category: "Editorial Design",
    year: "2021",
    image: "/portfolio/page-06.jpg",
    summary: "围绕自然生态与城市记忆建立连续阅读节奏，兼顾图像叙事与文本信息层级。",
    tags: ["期刊", "生态主题", "内容编排"],
  },
  {
    title: "清华大学《再同学》",
    category: "Book Design",
    year: "2025",
    image: "/portfolio/page-09.jpg",
    summary: "为校友回忆录打造庄重而有温度的纪念视觉，强化时间、身份与情感连接。",
    tags: ["纪念册", "书籍装帧", "校友文化"],
    layout: "tall",
  },
  {
    title: "廊坊临空经济区 CBD 招商宣传册",
    category: "Brochure Design",
    year: "2025",
    image: "/portfolio/page-15.jpg",
    summary: "用蓝色科技调性与城市规划图像表现开放、自信、国际化的招商传播气质。",
    tags: ["招商", "城市形象", "宣传册"],
  },
  {
    title: "中自智能品牌 VI",
    category: "Brand VI",
    year: "2025",
    image: "/portfolio/page-24.jpg",
    summary: "以蓝色科技基调、像素化辅助图形与简洁符号建立智能科技品牌识别。",
    tags: ["品牌识别", "科技品牌", "VI"],
    layout: "wide",
  },
  {
    title: "Logo Design Collection",
    category: "Logo Design",
    year: "2025",
    image: "/portfolio/page-28.jpg",
    summary: "覆盖地产、文创、科技、餐饮等行业，注重符号识别度、行业语义与延展能力。",
    tags: ["Logo", "符号设计", "品牌基础"],
  },
  {
    title: "Poster Design Series",
    category: "Poster Design",
    year: "2025",
    image: "/portfolio/page-30.jpg",
    summary: "通过强对比画面、信息层级与主题字体，让活动信息在第一眼形成传播焦点。",
    tags: ["海报", "活动传播", "视觉冲击"],
  },
  {
    title: "昌平美食节活动视觉",
    category: "Event Design",
    year: "2024",
    image: "/portfolio/page-34.jpg",
    summary: "从主视觉到落地物料统一活动氛围，服务大型线下活动的传播与现场体验。",
    tags: ["活动", "主视觉", "落地物料"],
  },
  {
    title: "Packaging Design Collection",
    category: "Packaging Design",
    year: "2025",
    image: "/portfolio/page-42.jpg",
    summary: "覆盖礼盒、手提袋、产品包装与系列化外观，强调结构、材质和货架识别。",
    tags: ["包装", "礼盒", "产品视觉"],
    layout: "wide",
  },
];

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
