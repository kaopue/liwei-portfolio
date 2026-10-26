# 李维视觉设计作品集

React + Vite 搭建的个人作品集网站。本轮作品仅来自 `F:\作品集  精选文件`，按实际画面整理为 30 个案例；人物介绍、联系方式、主题与首页视频沿用现有站点。

## 作品维护

分类与来源计划：[本轮内容计划](docs/content/curated-plan-2026-10-26.json)。导入过程与验收记录见 [内容说明](docs/content/README.md)。

```powershell
python scripts/import-curated-portfolio.py --source 'F:\作品集  精选文件' --plan docs/content/curated-plan-2026-10-26.json
node scripts/verify-curated-portfolio.mjs
```

导入脚本需要 Pillow 与 PyMuPDF。它会核验全部源文件的归属、重复文件映射和 PDF 重复页，生成带哈希的响应式图片及来源清单，不修改原始作品。作品图片请通过此脚本更新；原 `optimize-media.py --videos` 仅用于现有首页视频维护。

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

## 明暗主题

使用导航栏的日间 / 暗黑切换按钮更换主题。首次访问跟随系统外观；手动选择保存在浏览器本地，并在同源标签页之间同步。浏览器禁止本地存储时，切换在本次访问中仍然有效。清除保存的主题偏好后恢复跟随系统。

首页在两种模式下均保留暗色视频；页脚随模式切换为城市夜景与白色天空的城市日景，并相应调整文字颜色以保证识别度。

验证时检查首页、作品详情和手机导航在两种主题下的文字、图片遮罩与按钮；刷新后应保留手动选择，其他标签页应同步变化。无手动偏好时，系统外观变化应立即生效；键盘 Tab 可聚焦切换按钮并通过 Enter / Space 操作。
