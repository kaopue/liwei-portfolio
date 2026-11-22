# 李维视觉设计作品集

React + Vite 搭建的个人作品集网站。作品来自 `F:\作品集  精选文件` 及后续补充的本地作品，按实际画面整理为 33 个案例。

## 作品维护

分类与来源计划：[本轮内容计划](docs/content/curated-plan-2026-10-26.json)。导入过程与验收记录见 [内容说明](docs/content/README.md)。

2026-11-22 补充 3 个案例、9 张图片，内容与来源见 [补充计划](docs/content/curated-plan-2026-11-22.json)。

```powershell
python scripts/import-curated-portfolio.py --source 'F:\作品集  精选文件' --plan docs/content/curated-plan-2026-10-26.json
python scripts/import-curated-portfolio.py --source 'C:\Users\zhaoz\Downloads' --plan docs/content/curated-plan-2026-11-22.json --append
node scripts/verify-curated-portfolio.mjs
```

导入脚本需要 Pillow 与 PyMuPDF。它会核验全部源文件的归属、重复文件映射和 PDF 重复页，生成带哈希的响应式图片及来源清单，不修改原始作品。作品图片请通过此脚本更新。

以上两条导入命令按顺序重建完整作品库。补充批次通过 `sourceDirectories` 仅检查计划列出的文件夹；`--append` 保留已有案例并拒绝重复导入，来源清单的 `imports` 记录各批次的计划、原始目录和项目归属。新增批次需使用新的计划文件。

首页视频按原画质要求直接使用 `studio-loop-1080p.mp4` 的字节一致副本，电脑与手机共用同一份原始 1080p MP4。当前文件、SHA-256 和封面维护说明见 [视频更新记录](docs/releases/2026-10-29-studio-original-video.md)。`optimize-media.py --videos` 会重新编码视频，本次原画质发布不使用该流程。

## 本地预览

```bash
npm run dev
```

默认地址：

```text
http://localhost:5173
```

## 常用命令

```bash
npm run build
npm run lint
```

## 网站外观

全站采用固定的深色配色。首屏展示 5 个 16:9 横版作品，桌面等宽等距排列，平板和手机支持横向滑动浏览。

联系区使用用户于 2026-11-22 提供的 `星空沙海疾驰者 拷贝.jpg`，分别提供原尺寸与手机压缩版 WebP。天空沿用网站的近黑背景，保留星光，标题和联系方式使用白色网页文字；手机端将画面底部居中显示，保留人物与马的完整轮廓。图片来源与发布检查见 [页脚更新记录](docs/releases/2026-11-22-footer-rider.md)。
