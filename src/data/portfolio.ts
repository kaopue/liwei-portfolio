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
    label: "品牌标识",
    description: "品牌标识、VI 系统、字体组合与应用规范。",
  },
  {
    slug: "poster-kv",
    label: "海报主视觉",
    description: "海报、主视觉与传播画面。",
  },
  {
    slug: "packaging",
    label: "包装设计",
    description: "包装结构、礼盒、产品外观与系列包装。",
  },
  {
    slug: "cultural-creative",
    label: "文创产品",
    description: "文创产品、徽章、冰箱贴与纪念品视觉。",
  },
  {
    slug: "brochure",
    label: "画册设计",
    description: "画册、期刊、纪念册与宣传册。",
  },
  {
    slug: "event-material",
    label: "活动物料",
    description: "活动物料、陈列系统与现场落地应用。",
  },
  {
    slug: "other",
    label: "其他作品",
    description: "其他暂未归入主类的作品。",
  },
];

const workImage = (slug: string, index = 1, extension = "jpg") =>
  `/works/organized/${slug}/${slug}-${String(index).padStart(2, "0")}.${extension}`;

const workImages = (slug: string, count: number, extension = "jpg") =>
  Array.from({ length: count }, (_, index) =>
    workImage(slug, index + 1, extension),
  );

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
    title: "张顺堂云南滇红茶包装系列",
    slug: "zhangshuntang-yunnan-tea-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("zhangshuntang-yunnan-tea-packaging", 1, "png"),
    cover: workImage("zhangshuntang-yunnan-tea-packaging", 1, "png"),
    summary: "以云南茶文化与地域风物为视觉线索，构建兼具传统底蕴、礼赠质感与系列辨识度的茶叶包装。",
    description:
      "围绕云南滇红茶与老茶头两类产品，提取茶山、古建、云纹与传统人物等文化意象，通过细密插画、书法标题和金色工艺层次，形成白金、棕金与红金三组包装语言，并延展至茶罐与礼袋的完整展示。",
    tags: ["茶叶包装", "云南滇红", "东方插画"],
    detailSections: [
      {
        title: "项目背景",
        body: "张顺堂茶叶产品需要建立兼顾日常陈列与节庆礼赠的系列包装形象，在突出云南产地文化的同时，让不同茶品拥有清晰统一的品牌识别。",
      },
      {
        title: "设计策略",
        body: "以传统牌匾式信息结构作为视觉中心，将茶山、古建、云纹与人物插画环绕展开；通过白金、棕金与红金配色区分产品，并以烫金质感强化礼赠属性。",
      },
      {
        title: "系列呈现",
        body: "设计覆盖云南滇红茶与老茶头两组产品，统一茶罐比例、书法标题和插画边框，并延展至双罐组合与透明礼袋场景，形成完整且易于识别的包装系列。",
      },
    ],
    images: workImages("zhangshuntang-yunnan-tea-packaging", 12, "png"),
    type: "包装设计",
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
    image: workImage("ch9-aerospace-cultural-creative", 1, "png"),
    cover: workImage("ch9-aerospace-cultural-creative", 1, "png"),
    summary: "以航天科研纪念品为设计场景，整合飞行器、章牌结构与纪念属性。",
    description:
      "围绕航天主题文创产品展开，提取飞行器轮廓、机构识别与章牌结构，形成适用于徽章、钥匙扣、冰箱贴等载体的系列化视觉方案。",
    tags: ["航天项目", "文创产品", "徽章"],
    images: workImages("ch9-aerospace-cultural-creative", 15, "png"),
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
    image: workImage("zhangshuntang-tea-gift-packaging", 1, "webp"),
    cover: workImage("zhangshuntang-tea-gift-packaging", 1, "webp"),
    summary: "以礼盒场景呈现东方茶礼的秩序感，强调材质、层次与开箱体验。",
    description:
      "围绕茶礼产品的赠礼属性，通过规整的版面秩序、温润色彩和礼盒结构展示，强化产品的文化感、仪式感与系列延展能力。",
    tags: ["包装设计", "礼盒", "东方文化"],
    images: workImages("zhangshuntang-tea-gift-packaging", 18, "webp"),
    type: "包装设计",
    featured: true,
    priority: 3,
    layout: "wide",
  },
  {
    title: "达儿乐葡萄糖酸钙锌口服溶液包装系列",
    slug: "daerle-calcium-zinc-oral-solution-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("daerle-calcium-zinc-oral-solution-packaging", 1, "png"),
    cover: workImage("daerle-calcium-zinc-oral-solution-packaging", 1, "png"),
    summary: "围绕儿童向口服溶液产品建立清晰、亲和且易于识别的包装语言，并形成三组差异化视觉提案。",
    description:
      "以葡萄糖酸钙锌口服溶液的产品信息为核心，在确保药品名称、规格与必要信息清晰可读的基础上，探索盾牌与成长箭头、营养元素角色及蓝粉配色等不同表达，兼顾专业可信度、儿童亲和力与终端陈列识别。",
    tags: ["药品包装", "儿童产品", "系列提案"],
    detailSections: [
      {
        title: "项目背景",
        body: "达儿乐葡萄糖酸钙锌口服溶液需要更新包装视觉，在保持药品信息准确、层级清晰的前提下，增强儿童家庭消费场景中的亲和力与货架识别度。",
      },
      {
        title: "设计策略",
        body: "围绕钙、锌与赖氨酸三类核心信息建立图形识别，通过成长箭头、活力角色和清爽色彩传递产品属性，同时将品名、规格与标识置于明确的信息层级中。",
      },
      {
        title: "方案延展",
        body: "系列包含蓝色盾牌方案、浅蓝角色方案与暖粉角色方案，并同步展示外盒与条袋的组合效果，使不同视觉方向都能维持统一的品牌结构和包装延展能力。",
      },
    ],
    images: workImages("daerle-calcium-zinc-oral-solution-packaging", 6, "png"),
    type: "包装设计",
    featured: true,
    priority: 4,
    layout: "wide",
  },
  {
    title: "莱啤德式精酿鲜啤包装系列",
    slug: "leebeer-german-craft-beer-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2025",
    image: workImage("leebeer-german-craft-beer-packaging", 1, "png"),
    cover: workImage("leebeer-german-craft-beer-packaging", 1, "png"),
    summary: "以德式精酿文化为设计基底，通过经典标签结构与现代字体语言，塑造鲜明且具品质感的啤酒包装形象。",
    description:
      "围绕莱啤德式精酿鲜啤打造两套瓶装包装方向，将欧式徽章、建筑线稿、麦穗纹样与高识别度英文品牌字样融入标签系统，并通过金黄、米白与深蓝配色强化麦芽质感、传统酿造气质及终端陈列表现。",
    tags: ["啤酒包装", "瓶贴设计", "德式精酿"],
    detailSections: [
      {
        title: "项目背景",
        body: "莱啤希望为德式精酿鲜啤建立更具识别度的瓶装包装形象，在体现传统酿造文化的同时，适应餐饮、零售与冷藏陈列等多种消费场景。",
      },
      {
        title: "设计策略",
        body: "以欧式徽章和经典酒标结构传递德式酿造底蕴，将品牌英文名称置于视觉中心，并结合建筑线稿、麦穗纹样和金色背景，形成传统质感与现代识别之间的平衡。",
      },
      {
        title: "方案呈现",
        body: "项目包含两套标签视觉方向，并通过双瓶陈列、啤酒杯组合、瓶身特写、动态摆放与冰镇场景集中展示包装在不同视角和使用环境中的完整效果。",
      },
    ],
    images: workImages("leebeer-german-craft-beer-packaging", 12, "png"),
    type: "包装设计",
    featured: true,
    priority: 5,
  },
  {
    title: "芸上康缘水凝胶眼贴包装系列",
    slug: "yunshang-kangyuan-eye-patch-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2026",
    image: workImage("yunshang-kangyuan-eye-patch-packaging", 1, "png"),
    cover: workImage("yunshang-kangyuan-eye-patch-packaging", 1, "png"),
    summary: "围绕水凝胶眼贴建立清爽、专业且具有科技感的系列包装，并通过三套方向探索不同的信息表达。",
    description:
      "针对芸上康缘水凝胶眼贴的产品属性，以冷静蓝、青绿色和留白建立洁净可信的视觉基调，通过分子结构、水滴质感、眼贴形态与清晰的中英文信息层级，形成兼顾科技属性、功能识别和终端陈列的三套包装方案。",
    tags: ["眼贴包装", "健康产品", "系列提案"],
    detailSections: [
      {
        title: "项目背景",
        body: "芸上康缘水凝胶眼贴需要建立更具专业感与产品辨识度的包装形象，在准确呈现品名和功能信息的同时，传递水凝胶产品的清润、舒缓与科技属性。",
      },
      {
        title: "设计策略",
        body: "以水分子、透明水滴、冷色渐变和眼贴轮廓作为主要视觉线索，通过克制留白和清晰的信息分区强化专业可信度，并保持产品在不同包装方向中的品牌一致性。",
      },
      {
        title: "方案呈现",
        body: "项目包含 A、B、C 三套包装方向，每套均通过单盒、双盒组合与产品实物搭配效果图，集中展示包装正面信息、系列陈列及实际使用场景。",
      },
    ],
    images: workImages("yunshang-kangyuan-eye-patch-packaging", 9, "png"),
    type: "包装设计",
    featured: true,
    priority: 6,
  },
  {
    title: "同仁科技双面复合离焦镜片包装系列",
    slug: "tongren-dual-surface-defocus-lens-packaging",
    category: "Packaging",
    categorySlug: "packaging",
    year: "2025",
    image: workImage("tongren-dual-surface-defocus-lens-packaging", 1, "png"),
    cover: workImage("tongren-dual-surface-defocus-lens-packaging", 1, "png"),
    summary: "围绕双面复合离焦镜片建立兼具专业可信度、儿童亲和力与终端辨识度的系列包装提案。",
    description:
      "针对同仁科技双面复合离焦镜片的产品属性，围绕专业眼视光信息、儿童使用场景与品牌识别展开四套包装方向，通过蓝绿科技色、眼球结构图形、卡通角色和清晰的信息分区，兼顾产品功能表达、家庭沟通与货架陈列效果。",
    tags: ["镜片包装", "眼视光产品", "系列提案"],
    detailSections: [
      {
        title: "项目背景",
        body: "同仁科技双面复合离焦镜片需要建立面向儿童与家庭用户的包装视觉，在准确传达产品名称和规格信息的同时，提升专业信任感与终端识别度。",
      },
      {
        title: "设计策略",
        body: "以眼视光科技和儿童成长为两条视觉线索，通过眼球结构、环形光学图形、专业蓝绿色调及亲和角色建立信息层级，让技术属性与使用场景得到直观表达。",
      },
      {
        title: "方案呈现",
        body: "项目包含 A、B、C、D 四套包装方向，并通过单盒展示、组合陈列、侧面信息与批量铺陈等效果图，完整验证各方案在不同角度和终端场景中的表现。",
      },
    ],
    images: workImages("tongren-dual-surface-defocus-lens-packaging", 16, "png"),
    type: "包装设计",
    featured: true,
    priority: 7,
  },
  {
    title: "彩虹无人机 × 巴基斯坦联名徽章与钥匙扣",
    slug: "caihong-pakistan-uav-commemorative-badges",
    category: "Cultural Creative",
    categorySlug: "cultural-creative",
    year: "2026",
    image: workImage("caihong-pakistan-uav-commemorative-badges", 1, "png"),
    cover: workImage("caihong-pakistan-uav-commemorative-badges", 1, "png"),
    summary: "以彩虹无人机与中巴文化符号为核心，打造兼具纪念属性、金属质感与国际合作寓意的文创产品。",
    description:
      "围绕彩虹无人机与巴基斯坦联名主题，将无人机轮廓、中巴色彩、月牙星、国土轮廓及代表性建筑融入徽章结构，通过金色金属边框、珐琅色块和多层浮雕关系，形成徽章与钥匙扣两类纪念文创载体。",
    tags: ["联名文创", "纪念徽章", "钥匙扣"],
    detailSections: [
      {
        title: "项目背景",
        body: "项目以彩虹无人机与巴基斯坦合作主题为背景，需要将航空科技形象、双方文化符号和纪念属性整合为适合收藏与交流赠礼的文创产品。",
      },
      {
        title: "设计策略",
        body: "以无人机侧面轮廓作为核心识别，结合绿色、白色与金色的主色体系，并融入月牙星、国土轮廓和代表性建筑，使航空主题与地域文化在同一章牌结构中形成统一视觉。",
      },
      {
        title: "工艺呈现",
        body: "通过金属包边、珐琅填色、浮雕层次和高光材质强化纪念品质，并将图形分别延展为徽章与钥匙扣，以正面、侧面和组合场景展示成品效果。",
      },
    ],
    images: workImages("caihong-pakistan-uav-commemorative-badges", 4, "png"),
    type: "文创产品",
    featured: true,
    priority: 8,
  },
  {
    title: "中国航天空气动力技术研究院纪念徽章系列",
    slug: "caaa-aerospace-commemorative-badges",
    category: "Cultural Creative",
    categorySlug: "cultural-creative",
    year: "2026",
    image: workImage("caaa-aerospace-commemorative-badges", 1, "webp"),
    cover: workImage("caaa-aerospace-commemorative-badges", 1, "webp"),
    summary: "以中国航天空气动力技术研究院的科研成果为主题，构建融合航空器、动力装置与东方文化的纪念徽章系列。",
    description:
      "围绕中国航天空气动力技术研究院及 CAAA 航空科技主题，将 CH-7、CH-4、YH-1000 等航空器形象、动力装置、机构标识与龙纹、祥云等文化元素融入章牌构图，通过红金与科技蓝两组视觉语言，形成兼具科研纪念、文化表达和礼赠属性的金属徽章系列。",
    tags: ["航天文创", "纪念徽章", "礼盒设计"],
    detailSections: [
      {
        title: "项目背景",
        body: "项目面向中国航天空气动力技术研究院的纪念与交流场景，需要将机构形象、代表性航空器和科研精神转化为具有收藏价值与礼赠质感的实体文创。",
      },
      {
        title: "设计策略",
        body: "系列分别从东方文化与航空科技两种方向展开：红金方案结合龙纹、祥云和多型航空器，蓝色方案以机械环、流线与科技纹理组织研究院标识、飞行器及动力装置。",
      },
      {
        title: "工艺呈现",
        body: "通过金属包边、珐琅填色、局部浮雕和多层叠加塑造立体层次，并搭配专属礼盒与内衬，使徽章本体、包装纹样和陈列体验形成完整的纪念礼赠系统。",
      },
    ],
    images: workImages("caaa-aerospace-commemorative-badges", 12, "webp"),
    type: "文创产品",
    featured: false,
    priority: 9,
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
