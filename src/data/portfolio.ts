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

export const stats = [
  { value: "10+", label: "年视觉设计经验" },
  { value: "视觉系统", label: "品牌、版式与规范建立" },
  { value: "多行业", label: "品牌项目经验" },
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

export const projectCategories: ProjectCategory[] = [
  {
    slug: "brand-logo",
    label: "Brand / Logo",
    description: "品牌标识、VI 系统、字体组合与应用规范。",
  },
  {
    slug: "poster-kv",
    label: "Poster / KV",
    description: "海报、主视觉与传播画面。",
  },
  {
    slug: "packaging",
    label: "Packaging",
    description: "包装结构、礼盒、产品外观与系列包装。",
  },
  {
    slug: "cultural-creative",
    label: "Cultural Creative",
    description: "文创产品、徽章、冰箱贴与纪念品视觉。",
  },
  {
    slug: "brochure",
    label: "Brochure",
    description: "画册、期刊、纪念册与宣传册。",
  },
  {
    slug: "event-material",
    label: "Event Material",
    description: "活动物料、陈列系统与现场落地应用。",
  },
  {
    slug: "other",
    label: "Other",
    description: "其他暂未归入主类的作品。",
  },
];

const workImage = (slug: string, index = 1) =>
  `/works/organized/${slug}/${slug}-${String(index).padStart(2, "0")}.jpg`;

const workImages = (slug: string, count: number) =>
  Array.from({ length: count }, (_, index) => workImage(slug, index + 1));

type ProjectRecord = Omit<Project, "detailSections"> & {
  detailSections?: ProjectDetailSection[];
};

const defaultDetailSections = (project: ProjectRecord): ProjectDetailSection[] => [
  {
    title: "项目背景",
    body: project.description,
  },
  {
    title: "设计目标",
    body: `以${project.type}为主要设计场景，围绕${project.tags.slice(0, 2).join("、")}建立清晰的信息层级与视觉秩序，保证项目在识别、传播和落地应用中的一致性。`,
  },
  {
    title: "设计亮点",
    body: "通过封面、系列延展图和展示图之间的统一关系，控制色彩、版式、材质与媒介节奏，让项目从单张视觉延展为完整的作品集 case study。",
  },
];

const projectRecords: ProjectRecord[] = [
  {
    title: "小鸟鲜燕节日海报系列",
    slug: "xiao-niao-xian-yan-festival-posters",
    category: "Poster / KV",
    categorySlug: "poster-kv",
    year: "2020-2025",
    image: workImage("xiao-niao-xian-yan-festival-posters"),
    cover: workImage("xiao-niao-xian-yan-festival-posters"),
    summary: "围绕节日传播场景建立清晰的主视觉层级，兼顾产品识别与社交媒体阅读效率。",
    description:
      "以节日海报为主要传播载体，通过稳定的品牌露出、克制的色彩对比和明确的信息层级，强化燕窝产品在不同节点中的识别度与传播连续性。",
    tags: ["海报", "节日传播", "产品视觉"],
    images: workImages("xiao-niao-xian-yan-festival-posters", 6),
    type: "海报主视觉",
    featured: true,
    priority: 1,
    layout: "tall",
  },
  {
    title: "CH-9 航天文创徽章与冰箱贴",
    slug: "ch9-aerospace-cultural-creative",
    category: "Cultural Creative",
    categorySlug: "cultural-creative",
    year: "2026",
    image: workImage("ch9-aerospace-cultural-creative"),
    cover: workImage("ch9-aerospace-cultural-creative"),
    summary: "以航天科研纪念品为设计场景，整合飞行器、章牌结构与纪念属性。",
    description:
      "围绕航天主题文创产品展开，提取飞行器轮廓、机构识别与章牌结构，形成适用于徽章、钥匙扣、冰箱贴等载体的系列化视觉方案。",
    tags: ["航天项目", "文创产品", "徽章"],
    images: workImages("ch9-aerospace-cultural-creative", 8),
    type: "文创产品",
    featured: true,
    priority: 2,
  },
  {
    title: "张顺堂喜茶礼盒包装",
    slug: "zhangshuntang-tea-gift-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("zhangshuntang-tea-gift-packaging"),
    cover: workImage("zhangshuntang-tea-gift-packaging"),
    summary: "以礼盒场景呈现东方茶礼的秩序感，强调材质、层次与开箱体验。",
    description:
      "围绕茶礼产品的赠礼属性，通过规整的版面秩序、温润色彩和礼盒结构展示，强化产品的文化感、仪式感与系列延展能力。",
    tags: ["包装设计", "礼盒", "东方文化"],
    images: workImages("zhangshuntang-tea-gift-packaging", 6),
    type: "包装设计",
    featured: true,
    priority: 3,
    layout: "wide",
  },
  {
    title: "北京美食荟活动主视觉",
    slug: "beijing-food-festival-kv",
    category: "Event Material",
    categorySlug: "event-material",
    year: "2024",
    image: workImage("beijing-food-festival-kv"),
    cover: workImage("beijing-food-festival-kv"),
    summary: "从主视觉到物料延展统一活动氛围，服务线下活动传播与现场识别。",
    description:
      "围绕城市美食活动建立主视觉系统，将插画化食物元素、城市符号与活动信息整合到统一版式中，并延展到立牌、吊旗与现场物料。",
    tags: ["活动主视觉", "城市活动", "物料延展"],
    images: workImages("beijing-food-festival-kv", 6),
    type: "活动物料",
    featured: true,
    priority: 4,
    layout: "wide",
  },
  {
    title: "西沐品牌 VI 字体组合",
    slug: "ximu-brand-vi",
    category: "Brand / Logo",
    categorySlug: "brand-logo",
    year: "2026",
    image: workImage("ximu-brand-vi"),
    cover: workImage("ximu-brand-vi"),
    summary: "围绕品牌名与字体组合建立识别秩序，强调符号、字形与应用的统一性。",
    description:
      "以品牌字体组合为核心，构建清晰的比例关系与横竖版应用形式，使品牌标识在不同传播场景中保持稳定识别。",
    tags: ["品牌 VI", "字体组合", "识别系统"],
    images: workImages("ximu-brand-vi", 4),
    type: "品牌标识",
    featured: true,
    priority: 5,
  },
  {
    title: "衡水湖期刊与杂志样机",
    slug: "hengshui-lake-magazine",
    category: "Brochure",
    categorySlug: "brochure",
    year: "2021-2023",
    image: workImage("hengshui-lake-magazine"),
    cover: workImage("hengshui-lake-magazine"),
    summary: "围绕自然生态与城市记忆建立连续阅读节奏，兼顾图像叙事与文本层级。",
    description:
      "以湖区生态、地方文化和城市记忆为内容线索，通过期刊式版面、跨页节奏和样机展示，呈现兼具阅读性与展示性的编辑设计系统。",
    tags: ["期刊", "画册", "版式系统"],
    images: workImages("hengshui-lake-magazine", 7),
    type: "画册设计",
    featured: true,
    priority: 6,
    layout: "wide",
  },
  {
    title: "同仁科技离焦镜片包装",
    slug: "tongren-lens-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("tongren-lens-packaging"),
    cover: workImage("tongren-lens-packaging"),
    summary: "以医疗与科技产品包装为场景，强调专业信息、清洁感与货架识别。",
    description:
      "针对离焦镜片产品建立包装提案，通过深色品牌基调、清晰标题层级和产品信息分区，兼顾专业可信度与视觉识别。",
    tags: ["包装设计", "医疗科技", "产品提案"],
    images: workImages("tongren-lens-packaging", 4),
    type: "包装设计",
    featured: true,
    priority: 7,
  },
  {
    title: "国裕文创品牌识别",
    slug: "guoyu-cultural-brand-vi",
    category: "Brand / Logo",
    categorySlug: "brand-logo",
    year: "2022",
    image: workImage("guoyu-cultural-brand-vi"),
    cover: workImage("guoyu-cultural-brand-vi"),
    summary: "从东方文化语境出发，将器物感、章法与现代品牌识别进行整合。",
    description:
      "围绕东方文创与传统器物意象，将文化线索转化为具有识别度的标识系统，强调文化感、秩序感与后续传播延展。",
    tags: ["品牌识别", "东方文化", "文创"],
    images: workImages("guoyu-cultural-brand-vi", 5),
    type: "品牌标识",
    featured: true,
    priority: 8,
  },
  {
    title: "芸上康缘品牌 LOGO 与 VIS",
    slug: "yunshang-kangyuan-brand-system",
    category: "Brand / Logo",
    categorySlug: "brand-logo",
    year: "2026",
    image: workImage("yunshang-kangyuan-brand-system"),
    cover: workImage("yunshang-kangyuan-brand-system"),
    summary: "以植物与健康产业语义为基础，建立品牌标识、组合规范和视觉系统。",
    description:
      "从品牌命名、标识结构和标准组合出发，建立适用于健康产品与传播物料的视觉识别系统，保持柔和、清晰且可延展的品牌气质。",
    tags: ["LOGO", "VIS", "健康品牌"],
    images: workImages("yunshang-kangyuan-brand-system", 6),
    type: "品牌标识",
    featured: false,
    priority: 9,
  },
  {
    title: "芸上康缘水凝胶眼贴包装",
    slug: "yunshang-kangyuan-eye-patch-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("yunshang-kangyuan-eye-patch-packaging"),
    cover: workImage("yunshang-kangyuan-eye-patch-packaging"),
    summary: "用清洁的产品信息层级和柔和色彩建立眼贴包装的专业感。",
    description:
      "围绕水凝胶眼贴的产品属性，使用克制的色彩、图形辅助和包装信息区块，使产品在功能表达与视觉品质之间保持平衡。",
    tags: ["包装设计", "健康产品", "系列包装"],
    images: workImages("yunshang-kangyuan-eye-patch-packaging", 5),
    type: "包装设计",
    featured: false,
    priority: 10,
  },
  {
    title: "立明天耀清洁用品包装",
    slug: "liming-tianyao-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("liming-tianyao-packaging"),
    cover: workImage("liming-tianyao-packaging"),
    summary: "围绕清洁用品与膏剂包装建立专业、清爽、便于系列化的视觉方案。",
    description:
      "以产品功能和系列陈列为设计核心，通过色彩分区、标题层级和产品示意图，建立适合清洁用品包装延展的视觉结构。",
    tags: ["包装设计", "清洁用品", "系列化"],
    images: workImages("liming-tianyao-packaging", 7),
    type: "包装设计",
    featured: false,
    priority: 11,
  },
  {
    title: "正非建设品牌 Logo",
    slug: "zhengfei-construction-logo",
    category: "Brand / Logo",
    categorySlug: "brand-logo",
    year: "2026",
    image: workImage("zhengfei-construction-logo"),
    cover: workImage("zhengfei-construction-logo"),
    summary: "以建筑行业的稳定感和秩序感为基础，建立简洁的品牌标识方向。",
    description:
      "从建设行业的结构语义和企业识别需求出发，提炼出便于应用的标识组合，适配提案展示和后续物料延展。",
    tags: ["LOGO", "建筑品牌", "品牌提案"],
    images: workImages("zhengfei-construction-logo", 4),
    type: "品牌标识",
    featured: false,
    priority: 12,
  },
  {
    title: "天地鲟鳇鱼子酱品牌 Logo",
    slug: "tiandi-xunhuang-logo",
    category: "Brand / Logo",
    categorySlug: "brand-logo",
    year: "2026",
    image: workImage("tiandi-xunhuang-logo"),
    cover: workImage("tiandi-xunhuang-logo"),
    summary: "围绕高端食材与东方气质建立标识方案，强调符号识别与品质感。",
    description:
      "以鱼子酱品牌为设计对象，将产品属性、东方审美和高端消费语境结合，形成适合包装与传播延展的品牌标识。",
    tags: ["LOGO", "食品品牌", "东方气质"],
    images: workImages("tiandi-xunhuang-logo", 4),
    type: "品牌标识",
    featured: false,
    priority: 13,
  },
  {
    title: "赛奥领科 Logo 整理",
    slug: "saiao-link-logo",
    category: "Brand / Logo",
    categorySlug: "brand-logo",
    year: "2026",
    image: workImage("saiao-link-logo"),
    cover: workImage("saiao-link-logo"),
    summary: "通过标识归纳和组合整理，提升品牌基础视觉资产的清晰度。",
    description:
      "对标识方案进行集中整理，强调符号一致性、应用适配和后续规范建立，为品牌基础资产提供清晰展示。",
    tags: ["LOGO", "标识整理", "品牌基础"],
    images: workImages("saiao-link-logo", 3),
    type: "品牌标识",
    featured: false,
    priority: 14,
  },
  {
    title: "红牛饮料商超陈列物料",
    slug: "red-bull-retail-display",
    category: "Event Material",
    categorySlug: "event-material",
    year: "2025",
    image: workImage("red-bull-retail-display"),
    cover: workImage("red-bull-retail-display"),
    summary: "围绕商超货架、堆头和冰柜场景，建立高识别度的零售陈列系统。",
    description:
      "以快消品零售终端为应用场景，整合货架、堆头、端架与冰柜陈列，强化现场识别和促销信息的快速传达。",
    tags: ["活动物料", "商超陈列", "终端展示"],
    images: workImages("red-bull-retail-display", 6),
    type: "活动物料",
    featured: false,
    priority: 15,
    layout: "wide",
  },
  {
    title: "彩虹-5 宣传设计方案",
    slug: "caihong-five-campaign",
    category: "Poster / KV",
    categorySlug: "poster-kv",
    year: "2024",
    image: workImage("caihong-five-campaign"),
    cover: workImage("caihong-five-campaign"),
    summary: "以航天器轮廓和深色科技调性构建宣传视觉，突出主题识别。",
    description:
      "围绕彩虹-5 项目传播需求，通过大面积深色背景、飞行器图形和清晰标题结构，建立具有科技属性的主视觉方案。",
    tags: ["主视觉", "航天项目", "宣传设计"],
    images: workImages("caihong-five-campaign", 4),
    type: "海报主视觉",
    featured: false,
    priority: 16,
  },
  {
    title: "佳禾传媒画册成品",
    slug: "jiahe-media-brochure",
    category: "Brochure",
    categorySlug: "brochure",
    year: "2021",
    image: workImage("jiahe-media-brochure"),
    cover: workImage("jiahe-media-brochure"),
    summary: "以媒体资源和户外场景为内容核心，建立清晰的企业画册信息结构。",
    description:
      "围绕传媒资源、点位介绍和客户展示进行画册编排，通过稳定的网格系统和图文层级提升信息阅读效率。",
    tags: ["画册", "媒体资源", "版式设计"],
    images: workImages("jiahe-media-brochure", 6),
    type: "画册设计",
    featured: false,
    priority: 17,
  },
  {
    title: "清华大学《再同学》纪念画册",
    slug: "qinghua-reunion-book",
    category: "Brochure",
    categorySlug: "brochure",
    year: "2021",
    image: workImage("qinghua-reunion-book"),
    cover: workImage("qinghua-reunion-book"),
    summary: "以校友记忆为内容线索，建立庄重、安静且具有纪念感的画册呈现。",
    description:
      "面向校友纪念内容进行书籍与画册视觉整理，通过克制版式、留白和图文关系，承载时间记忆与人物关系。",
    tags: ["纪念画册", "书籍装帧", "校友文化"],
    images: workImages("qinghua-reunion-book", 5),
    type: "画册设计",
    featured: false,
    priority: 18,
  },
  {
    title: "中自智能企业画册",
    slug: "zhongzi-intelligence-brochure",
    category: "Brochure",
    categorySlug: "brochure",
    year: "2021",
    image: workImage("zhongzi-intelligence-brochure"),
    cover: workImage("zhongzi-intelligence-brochure"),
    summary: "以蓝色科技感和信息图表结构呈现智能企业的业务能力。",
    description:
      "通过科技蓝视觉基调、信息图表和企业内容编排，建立适合智能科技企业传播的画册视觉系统。",
    tags: ["企业画册", "科技企业", "信息编排"],
    images: workImages("zhongzi-intelligence-brochure", 4),
    type: "画册设计",
    featured: false,
    priority: 19,
  },
  {
    title: "中福乡旅鸡蛋包装",
    slug: "zhongfu-rural-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2018-2021",
    image: workImage("zhongfu-rural-packaging"),
    cover: workImage("zhongfu-rural-packaging"),
    summary: "围绕乡旅农产品包装建立亲和、明确且便于货架识别的视觉方案。",
    description:
      "以农产品包装为设计对象，通过清晰产品名、插画和包装结构展示，强化地方属性与终端陈列识别。",
    tags: ["包装设计", "农产品", "乡旅品牌"],
    images: workImages("zhongfu-rural-packaging", 4),
    type: "包装设计",
    featured: false,
    priority: 20,
  },
  {
    title: "机场户外推广画面",
    slug: "airport-outdoor-key-visual",
    category: "Poster / KV",
    categorySlug: "poster-kv",
    year: "2019",
    image: workImage("airport-outdoor-key-visual"),
    cover: workImage("airport-outdoor-key-visual"),
    summary: "以大型户外传播尺寸为前提，建立横向延展的城市推广画面。",
    description:
      "面向机场及户外广告场景进行横向视觉设计，通过强识别色彩、建筑线索和简洁信息结构适配远距离阅读。",
    tags: ["户外广告", "推广画面", "城市传播"],
    images: workImages("airport-outdoor-key-visual", 1),
    type: "海报主视觉",
    featured: false,
    priority: 21,
    layout: "wide",
  },
];

export const projects: Project[] = projectRecords.map((project) => ({
  ...project,
  detailSections: project.detailSections ?? defaultDetailSections(project),
}));

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
