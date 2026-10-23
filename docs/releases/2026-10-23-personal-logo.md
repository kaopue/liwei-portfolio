# 个人 Logo 与首页改版发布说明

正式域名：https://liwei-portfolio-liart.vercel.app/

## 发布范围

- 导航栏使用用户上传的个人 Logo，替代文字 LW。直接复用字节一致的 public/portfolio/logo-liwei-mark.png；保留透明背景和原始比例，不重绘图形。
- 暗黑模式显示白色图形，白天模式通过 CSS 反色显示黑色；桌面宽 64px，手机宽 36px。首页与项目详情共用导航组件。
- 保留返回首页的链接、无障碍名称和 2px 可见键盘焦点；图片设置固有宽高，避免加载时改变布局。
- 一同发布 feat/hero-rooftop 的屋顶昼夜视频 Hero、已按参考图调整的第二屏及分享元数据。现有日夜城市页脚与其他项目内容延续。
- 沿用 React / Vite 技术栈，未添加依赖。favicon 已为同一图形，继续使用。

## 本轮验证

- npm run build、npm run lint、git diff --check 通过。
- 浏览器实测 1440、1024、768、390px：Logo 保持比例并位于导航格内，无页面横向溢出。
- 桌面和手机明暗主题均检查；白天图形为黑色，暗黑图形为白色，PNG 正常加载。
- 进入项目详情并点击个人 Logo，成功返回首页；键盘 Shift+Tab 可聚焦 Logo，焦点轮廓为 2px 青色。
- 本地截图保存在 .tmp/logo-release/：home-1440-dark.jpg、home-1440-light.jpg、home-390-dark.jpg、home-390-light.jpg。
- 本轮未重测 Lighthouse；历史性能数据的测量边界见 docs/hero/review-2026-10-21.md。

## 发布方式

先在 feat/hero-rooftop 完成改动与验证，再将已验证版本合入 main，使用仓库现有的 GitHub → Vercel Production 流程。无关未跟踪的 public/assets/ 不纳入提交，线上构建仅使用仓库中已跟踪的素材。
