import { PaperStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type FolderSeed = {
  name: string;
  children?: FolderSeed[];
};

type PaperSeed = {
  folderPath: string[];
  title: string;
  authors: string;
  journal?: string;
  year?: number;
  impactFactor?: number;
  doi?: string;
  sourceUrl?: string;
  pdfUrl?: string;
  tags: string[];
  mainConclusion?: string;
  methods?: string;
  status: PaperStatus;
  rating?: number;
  notes?: string;
  abstract?: string;
  background?: string;
  researchQuestion?: string;
  materials?: string;
  keyResults?: string;
  conclusion?: string;
  innovations?: string;
  limitations?: string;
  usefulIdeas?: string;
  personalNotes?: string;
  followUpIdeas?: string;
  figures?: Array<{
    imageUrl: string;
    caption: string;
    explanation: string;
  }>;
};

const folderSeeds: FolderSeed[] = [
  {
    name: "肿瘤免疫",
    children: [{ name: "免疫检查点" }, { name: "T 细胞耗竭" }],
  },
  {
    name: "单细胞测序",
    children: [{ name: "数据分析方法" }, { name: "细胞通讯" }],
  },
  {
    name: "生物材料",
    children: [{ name: "水凝胶" }, { name: "药物递送" }],
  },
];

const paperSeeds: PaperSeed[] = [
  {
    folderPath: ["肿瘤免疫", "免疫检查点"],
    title: "PD-1 blockade enhances T cell reinvigoration in solid tumors",
    authors: "A. Kumar; L. Chen; Y. Zhao",
    journal: "Cancer Discovery",
    year: 2023,
    impactFactor: 28.2,
    doi: "10.1000/cd.2023.001",
    sourceUrl: "https://example.org/pd1-blockade",
    pdfUrl: "https://example.org/pd1-blockade.pdf",
    tags: ["免疫检查点", "PD-1", "临床转化"],
    mainConclusion: "PD-1 阻断可显著恢复耗竭 T 细胞的效应功能，并改善实体瘤微环境中的免疫激活。",
    methods: "单细胞转录组、流式细胞术、肿瘤小鼠模型",
    status: PaperStatus.SUMMARIZED,
    rating: 5,
    notes: "适合放到免疫治疗综述的机制部分。",
    abstract: "研究评估 PD-1 阻断后实体瘤中 T 细胞状态转变及其与治疗反应的关系。",
    background: "PD-1 抑制剂临床有效，但不同患者反应差异大，需要更细颗粒度的机制理解。",
    researchQuestion: "PD-1 阻断究竟如何重塑 T 细胞功能谱与肿瘤免疫微环境？",
    materials: "3 个实体瘤队列、PDX 模型、配对治疗前后样本。",
    keyResults: "治疗响应者中效应 T 细胞和干样 T 细胞比例提升，免疫抑制细胞显著下降。",
    conclusion: "PD-1 阻断不仅解除抑制信号，还会驱动免疫生态位的系统性重塑。",
    innovations: "整合临床配对样本与动物模型，提出可预测响应的新细胞状态标志。",
    limitations: "样本量仍有限，且不同癌种泛化能力需要验证。",
    usefulIdeas: "可借鉴其配对采样设计，做治疗前后状态追踪。",
    personalNotes: "文章图 3 的状态转换图非常适合复用到组会汇报。",
    followUpIdeas: "结合空间转录组验证重塑是否具有区域特异性。",
    figures: [
      {
        imageUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80",
        caption: "治疗前后 T 细胞状态转换图",
        explanation: "展示干样 T 细胞向效应状态迁移，同时耗竭标志下降。",
      },
    ],
  },
  {
    folderPath: ["肿瘤免疫", "T 细胞耗竭"],
    title: "Epigenetic locking of exhausted T cells defines response ceiling",
    authors: "M. Santos; P. Li",
    journal: "Nature Immunology",
    year: 2022,
    impactFactor: 30.5,
    doi: "10.1000/ni.2022.118",
    sourceUrl: "https://example.org/tcell-exhaustion",
    tags: ["T 细胞耗竭", "表观遗传"],
    mainConclusion: "T 细胞耗竭具有稳定的表观遗传锁定特征，是免疫治疗反应上限的重要决定因素。",
    methods: "ATAC-seq、ChIP-seq、体内追踪",
    status: PaperStatus.READ,
    rating: 4,
    notes: "非常适合用来支撑耗竭不可逆性讨论。",
  },
  {
    folderPath: ["单细胞测序", "数据分析方法"],
    title: "Benchmarking batch correction strategies for atlas-scale scRNA-seq",
    authors: "J. Miller; S. Rao; Q. Wang",
    journal: "Genome Biology",
    year: 2024,
    impactFactor: 17.9,
    doi: "10.1000/gb.2024.052",
    sourceUrl: "https://example.org/batch-correction",
    tags: ["单细胞", "批次校正", "Benchmark"],
    mainConclusion: "不同批次校正算法在保留生物差异与去除技术偏差之间存在明显权衡。",
    methods: "Harmony、Seurat、scVI 全面对比",
    status: PaperStatus.SUMMARIZED,
    rating: 5,
    notes: "后续做 pipeline 选型时可以直接参考。",
    abstract: "系统比较 atlas 规模单细胞数据中的批次校正表现。",
    background: "数据集规模增大后，传统经验选择方法难以覆盖复杂批次结构。",
    researchQuestion: "大规模单细胞整合时，哪类方法在不同任务目标下更稳健？",
    materials: "12 个公开数据集，覆盖多平台和多组织。",
    keyResults: "scVI 在跨平台整合上表现稳定，Harmony 在速度和解释性之间平衡更好。",
    conclusion: "算法选择需要与研究问题耦合，不能只看单一评分指标。",
    innovations: "提出面向下游任务的多维评估框架。",
    limitations: "尚未纳入空间组学与多组学整合场景。",
    usefulIdeas: "可把它的评估矩阵做成内部分析 checklist。",
    personalNotes: "想尝试把自己的数据放进去复现实验流程。",
    followUpIdeas: "扩展到单细胞 ATAC 和多组学联合整合。",
    figures: [
      {
        imageUrl: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80",
        caption: "批次校正评估雷达图",
        explanation: "从混合度、生物信号保留和时间成本三个维度比较不同方法。",
      },
    ],
  },
  {
    folderPath: ["单细胞测序", "细胞通讯"],
    title: "Decoding cell-cell communication networks in inflamed tissues",
    authors: "R. Gupta; H. Sun",
    journal: "Cell Systems",
    year: 2021,
    impactFactor: 11.1,
    doi: "10.1000/cs.2021.210",
    sourceUrl: "https://example.org/cell-communication",
    tags: ["细胞通讯", "配体受体"],
    mainConclusion: "炎症组织中的核心通讯轴集中在免疫细胞与基质细胞之间。",
    methods: "CellChat、空间验证",
    status: PaperStatus.READING,
    rating: 4,
    notes: "方法部分值得细读。",
  },
  {
    folderPath: ["生物材料", "水凝胶"],
    title: "Injectable hydrogel depot improves local immunotherapy retention",
    authors: "T. Evans; B. Liu",
    journal: "Advanced Materials",
    year: 2023,
    impactFactor: 29.4,
    doi: "10.1000/am.2023.315",
    sourceUrl: "https://example.org/hydrogel-immunotherapy",
    tags: ["水凝胶", "局部递送", "免疫治疗"],
    mainConclusion: "可注射水凝胶显著提高局部药物滞留时间并降低系统毒性。",
    methods: "材料表征、体内成像、抗肿瘤实验",
    status: PaperStatus.SUMMARIZED,
    rating: 5,
    notes: "与当前课题方向匹配度很高。",
    abstract: "基于温敏凝胶构建局部给药平台，提升免疫佐剂和抗体的肿瘤内暴露。",
    background: "系统给药常伴随低利用率和高毒性，局部递送有望改善治疗窗。",
    researchQuestion: "如何构建兼具注射便利性和持续释放能力的材料平台？",
    materials: "温敏聚合物、抗体载荷、小鼠肿瘤模型。",
    keyResults: "肿瘤内药物半衰期延长 4 倍，联合治疗组抑瘤最显著。",
    conclusion: "局部材料递送可作为免疫治疗增敏的重要工程策略。",
    innovations: "把材料响应性与免疫微环境调控结合到同一平台。",
    limitations: "长期生物相容性和大动物验证仍不足。",
    usefulIdeas: "可以迁移到核酸药物的局部递送。",
    personalNotes: "图 2 的释药曲线表现很清晰。",
    followUpIdeas: "尝试加入可降解交联点，优化后期清除。",
    figures: [
      {
        imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=1200&q=80",
        caption: "水凝胶局部释药曲线",
        explanation: "展示不同交联密度下的释放速率与滞留时间差异。",
      },
    ],
  },
  {
    folderPath: ["生物材料", "药物递送"],
    title: "Lipid-polymer hybrid nanoparticles for targeted siRNA delivery",
    authors: "E. Park; Y. Han",
    journal: "Biomaterials",
    year: 2022,
    impactFactor: 15.8,
    doi: "10.1000/bm.2022.403",
    sourceUrl: "https://example.org/sirna-delivery",
    tags: ["纳米颗粒", "siRNA", "药物递送"],
    mainConclusion: "脂质-聚合物杂化颗粒兼顾装载效率与靶向能力，是 siRNA 递送的有前景方案。",
    methods: "颗粒表征、细胞摄取、体内分布",
    status: PaperStatus.UNREAD,
    rating: 3,
    notes: "先放在候选阅读列表。",
  },
  {
    folderPath: ["单细胞测序", "数据分析方法"],
    title: "Graph foundation models accelerate cell type annotation",
    authors: "N. Ibrahim; D. Cho",
    journal: "Nature Methods",
    year: 2025,
    impactFactor: 48.0,
    doi: "10.1000/nm.2025.021",
    sourceUrl: "https://example.org/graph-foundation-cells",
    tags: ["基础模型", "细胞注释", "图学习"],
    mainConclusion: "图基础模型在跨队列迁移注释上显著优于传统监督方法。",
    methods: "GNN、预训练迁移、跨数据集验证",
    status: PaperStatus.READING,
    rating: 5,
    notes: "很适合作为 AI for biology 的代表文献。",
  },
  {
    folderPath: ["肿瘤免疫", "免疫检查点"],
    title: "Combinational checkpoint blockade reshapes myeloid suppression",
    authors: "S. Ahmed; K. Ito",
    journal: "Clinical Cancer Research",
    year: 2024,
    impactFactor: 13.7,
    doi: "10.1000/ccr.2024.112",
    sourceUrl: "https://example.org/checkpoint-myeloid",
    tags: ["髓系细胞", "联合治疗"],
    mainConclusion: "联合检查点抑制可减弱髓系抑制细胞的免疫抑制表型。",
    methods: "多色流式、细胞因子谱分析",
    status: PaperStatus.READ,
    rating: 4,
    notes: "可与 PD-1 机制文献形成互补。",
  },
];

async function createFolderTree(
  folders: FolderSeed[],
  parentId: string | null = null,
  pathMap = new Map<string, string>(),
  pathPrefix: string[] = [],
) {
  for (const folder of folders) {
    const created = await prisma.folder.create({
      data: {
        name: folder.name,
        parentId,
      },
    });
    const currentPath = [...pathPrefix, folder.name];
    pathMap.set(currentPath.join("/"), created.id);

    if (folder.children?.length) {
      await createFolderTree(folder.children, created.id, pathMap, currentPath);
    }
  }

  return pathMap;
}

async function main() {
  await prisma.figure.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.folder.deleteMany();

  const pathMap = await createFolderTree(folderSeeds);

  for (const paper of paperSeeds) {
    const folderId = pathMap.get(paper.folderPath.join("/"));

    if (!folderId) {
      throw new Error(`Folder path not found: ${paper.folderPath.join("/")}`);
    }

    await prisma.paper.create({
      data: {
        folderId,
        title: paper.title,
        authors: paper.authors,
        journal: paper.journal,
        year: paper.year,
        impactFactor: paper.impactFactor,
        doi: paper.doi,
        sourceUrl: paper.sourceUrl,
        pdfUrl: paper.pdfUrl,
        tags: JSON.stringify(paper.tags),
        mainConclusion: paper.mainConclusion,
        methods: paper.methods,
        status: paper.status,
        rating: paper.rating,
        notes: paper.notes,
        abstract: paper.abstract,
        background: paper.background,
        researchQuestion: paper.researchQuestion,
        materials: paper.materials,
        keyResults: paper.keyResults,
        conclusion: paper.conclusion,
        innovations: paper.innovations,
        limitations: paper.limitations,
        usefulIdeas: paper.usefulIdeas,
        personalNotes: paper.personalNotes,
        followUpIdeas: paper.followUpIdeas,
        relatedPaperIds: JSON.stringify([]),
        figures: {
          create: (paper.figures ?? []).map((figure) => ({
            imageUrl: figure.imageUrl,
            caption: figure.caption,
            explanation: figure.explanation,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
