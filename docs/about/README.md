# 第二屏参考图改版

版式依据用户提供的 about_B_dark.jpg；字体和字号层级沿用现有网站。实现位于 feat/hero-rooftop；本次生产发布范围包含本屏、屋顶 Hero 和个人 Logo，发布说明见 [2026-10-23 发布记录](../releases/2026-10-23-personal-logo.md)。

## 实际改动

- 左侧为02章节标、李维 / LI WEI姓名、视觉表达主句与简介；底部为12年经验、两段既有经历、能力和工具四栏。
- 使用现有同一肖像 public/hero/about-profile.webp，保持原始身份与姿态，无AI重绘。通过整幅裁切、完整透明度、轻微提亮和炭黑 / 青灰背景融合接近参考构图。
- 移除旧圆角背景卡、超大装饰英文、低透明度灰化及肖像呼吸缩放。白天模式保留右侧肖像原色与深色背景，正文区域使用站内浅色主题。
- 900px及以下将姓名、肖像、简介分开排列，保留完整头部；经历栏在平板两列、600px及以下单列。
- 清理不再使用的 About、旧 profile、旧 timeline 样式，保留其他页面公共规则。

## 字体对齐

继承站内 Inter / 系统无衬线 / Microsoft YaHei / PingFang SC 字体栈。

姓名与精选项目、个人优势的同级标题共用字号和字重：宽屏64px，760px及以下42px，字重700。Hero保持原有900字重的首屏主标题。简介正文16px，窄屏15px；经历标题18–22px / 700，经历说明14px；章节小标沿用eyebrow。

## 验证

- npm run build、npm run lint、git diff --check通过。
- 浏览器检查1440×900、1024×768、768×1024、390×844：无页面横向溢出，姓名与英文身份不重叠，正文与经历栏不重叠。
- 四种宽度下，姓名与精选项目标题的计算字号 / 字重完全一致；肖像透明度始终为1。
- 明暗模式及手机布局截图已保存至 .tmp/about-reference-review/。
- 底栏按最亮白色图像作为背景进行合成计算：暗色正文最坏对比度约6.06:1，浅色正文约6.09:1。这是底栏样式的理论边界，并非全站无障碍认证。
- 浏览器未记录脚本错误或警告。

## 预览

当前电脑：http://127.0.0.1:5173/#about

截图与计算字号记录：

- ../../.tmp/about-reference-review/about-1440-dark.jpg
- ../../.tmp/about-reference-review/about-1440-light.jpg
- ../../.tmp/about-reference-review/about-390-dark.jpg
- ../../.tmp/about-reference-review/about-390-light.jpg
- ../../.tmp/about-reference-review/responsive-audit.json
