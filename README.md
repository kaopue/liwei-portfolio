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

首屏使用 `enhance-82adf1f692a5f9fe-2x-80pc.mp4` 的静音副本（2560×1440、24 fps），联系区使用 `gemini_generated_video_7b4588df.mp4` 的静音副本（1280×720、24 fps）。两段素材均保留原始视频流，封面取自各自的首帧。当前资源记录在 `src/data/optimizedVideos.json` 和 `src/data/contactVideo.json`。

## 本地预览

```bash
npm run dev
```

默认地址：

```text
http://localhost:5173
```

作品展示本地预览：访问 `http://localhost:5173/#projects`。
作品区采用三列封面网格（平板两列、手机单列），支持分类平滑切换、悬停第二张作品预览；详情页使用连续原比例大图、站内放大与键盘左右切图，并在返回作品列表时恢复分类和浏览位置。单图项目保留封面缩放反馈。作品区已移到个人经历前面。

第三屏按用户提供的 `第三屏-高清原图 拷贝.jpg` 调整；以 1920×919 浏览器视口（1905×912 截图内容）核对，标题与“10+ 工作经验”横向排列，两行加粗介绍与正文、经历区分别对齐参考图的位置及间距。保留原人物图片与完整头部。

`npm run dev` 和 `npm run build` 会自动从已有图片清单生成轻量悬停预览索引 `src/data/workPreviews.json`，无需另备图片。2026-11-24 版本的发布范围与检查见 [发布记录](docs/releases/2026-11-24-behance-gallery.md)。

## 常用命令

```bash
npm run build
npm run lint
```

## 网站外观

全站采用固定的深色配色。首屏保留背景视频、标题、介绍及“查看项目”“Behance”按钮；案例声明和五张作品预览卡片已移除，作品统一在下方“作品展示”区域浏览。

联系区以和首屏同样大小的视频铺满背景，左侧以轻渐变衬托合作标题、邮箱和电话。两段背景视频进入可视区域后自动静音循环播放，开启减少动态效果时显示相应首帧。
