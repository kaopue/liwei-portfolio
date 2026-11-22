# 李维视觉设计作品集

React + Vite 搭建的个人作品集网站。作品来自 `F:\作品集  精选文件`，按实际画面整理为 30 个案例。

## 作品维护

分类与来源计划：[本轮内容计划](docs/content/curated-plan-2026-10-26.json)。导入过程与验收记录见 [内容说明](docs/content/README.md)。

```powershell
python scripts/import-curated-portfolio.py --source 'F:\作品集  精选文件' --plan docs/content/curated-plan-2026-10-26.json
node scripts/verify-curated-portfolio.mjs
```

导入脚本需要 Pillow 与 PyMuPDF。它会核验全部源文件的归属、重复文件映射和 PDF 重复页，生成带哈希的响应式图片及来源清单，不修改原始作品。作品图片请通过此脚本更新。

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

联系区使用用户提供的星空与沙漠骑士图片，分别提供原尺寸与手机压缩版 WebP。天空沿用网站的近黑背景，保留星光，标题和联系方式使用白色网页文字；手机端将画面底部居中显示，保留人物与马的完整轮廓。
