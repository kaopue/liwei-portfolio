# 屋顶 Hero 改版验证

首页采用屋顶昼夜循环视频、左侧两行标题、三行说明和 CTA、底部八张真实项目卡片。手机端将文字移到人物脸部下方，作品条支持横向滑动。现有项目详情与技术栈保留，未新增应用依赖。

## 素材与加载

上传的三个视频与 JPG 原件位于 `public/hero/`，文件名和内容均保持不变，已与附件逐字节核对。视频时长 12 秒。

- 桌面优先 WebM，失败时回退至 1080p MP4；宽度小于 768px 时只挂载 720p MP4。
- 视频保持 autoplay、muted、loop、playsinline、preload=metadata，无播放控件，aria-hidden。
- 从原 JPG 派生桌面与手机 WebP，按媒体查询 preload，使用 picture 和 JPG 回退。视频 poster 和 Open Graph 分享图继续使用原 JPG。
- 封面 decode 后等待两次 requestAnimationFrame，先绘制封面，再挂载视频。开启减少动态效果时不挂载视频；偏好变化时也立即响应。
- 首页项目卡使用轻量 WebP、lazy loading 和固有尺寸；底部八张缩略图提供 160px / 320px srcset。肖像也提供 WebP。详情页继续使用原始项目素材。
- 删除已无引用的旧 Hero 视频、封面、背景图、统计条和动画样式。依赖声明与锁文件未修改。

## 验证结果

`npm run build`、`npm run lint` 和 `git diff --check` 均通过。已启动 Vite 开发服务与生产 preview，并验证 HTTP 响应。

Chromium + Playwright 在 1440×900、1024×768、768×1024、390×844，以及短屏 390×667 上验证了暗色和亮色主题，无页面横向溢出。视频已确认静音自动播放、无控件。浏览器交互检查还覆盖：

- 屏蔽 WebM 后成功回退至 1080p MP4；767px / 768px 跨断点切换媒体。
- 将播放进度移至 11.8 秒，确认 loop 后回到开头继续播放。
- 减少动态效果首次加载时视频请求为零，运行时切换偏好会移除视频。
- “查看项目”滚动定位、缩略图进入详情、Logo 返回首页。
- Behance 沿用现有地址，新窗口打开并设置 noopener noreferrer。
- 主题切换与刷新记忆、键盘 Tab 顺序及可见焦点、作品条滚动和末尾图片加载。
- 未发现页面脚本错误或非预期失败的 HTTP 请求。

### Lighthouse 13.5.0

对生产构建运行，使用标准移动端模拟节流与桌面 preset；这些是本机实验室结果，部署后的网络与缓存仍需实测。

| 模式 | Performance | Accessibility | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 移动端 | 98 | 100 | 100 | 2.15s | 0 |
| 桌面端 | 100 | 100 | 100 | 0.69s | 0 |

详细指标与节流参数见 [lighthouse-summary.json](./lighthouse-summary.json)。复测方式：先 `npm run build`，再 `npm run preview -- --port 4173 --strictPort`，对本地 preview 运行 Lighthouse 13.5.0，选择 performance、accessibility、seo 分类。移动端使用默认配置，桌面端添加 `--preset=desktop`。

## 截图

截图来自实际浏览器，以视频第 0 秒与第 6 秒分别展示白天和夜晚画面；截图时暂停视频以固定帧，应用默认仍自动循环播放。

- [桌面 1440px / 白天](./hero-1440-day.png)
- [桌面 1440px / 夜晚](./hero-1440-night.png)
- [手机 390px / 白天](./hero-390-day.png)
- [手机 390px / 夜晚](./hero-390-night.png)

完整改动路径见 [changed-files.txt](./changed-files.txt)。
