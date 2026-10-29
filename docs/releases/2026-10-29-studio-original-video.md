# 首页工作室视频原画质替换 · 2026-10-29

正式网址：https://liwei-portfolio-liart.vercel.app/

## 更新内容

- 首页视频替换为用户提供的 `C:\Users\zhaoz\Downloads\studio-loop-1080p.mp4`。直接复制原文件，没有转码、重新封装、降分辨率、降帧率或降低码率。
- 电脑和手机只使用同一个原始 MP4，不再加载旧 WebM 或低分辨率手机视频。1920×1080、24 fps、12 秒、288 帧，H.264/yuv420p，无音轨，6,386,251 bytes。源文件已经支持 MP4 faststart。
- 发布文件：`public/hero/optimized/hero-studio-original-1080p-c51990d49226.mp4`。
- 源文件和发布文件的 SHA-256 均为 `c51990d492268ea80a2d755c0b20d336f9c10bcda87e1915c8ed048e78ab32ea`。
- 从视频首帧更新电脑与手机 WebP 封面、JPG 分享图、响应式预加载和 OG/Twitter 元数据。WebP 使用无损编码；手机封面为 960×540，视频保持完整 1080p。
- 延续原有封面优先加载、空闲后播放、循环播放、暂停/恢复、离屏与后台暂停，以及减少动态效果和节省流量设置。

## 本地验证

- `npm run build`、`npm run lint` 和 `git diff --check` 通过。
- FFmpeg 完整解码成功，确认 288 帧及 12 秒时长；SHA-256 独立核对一致。
- 浏览器默认电脑视口和 390×844 手机视口均成功播放新视频：`videoWidth=1920`、`videoHeight=1080`、`duration=12`、`readyState=4`、无媒体错误、无横向溢出。暂停和恢复成功。

本次核验资料位于 `.tmp/studio-release-20261029/`：源视频解码日志、媒体一致性记录，以及正式发布后的 HTTP/文件哈希核验和页面截图。

## 后续维护

保持原画质时直接复制新源视频，使用 SHA-256 前 12 位作为文件名的一部分，并更新 `src/data/optimizedVideos.json` 的 `videoMp4`。从对应首帧生成封面后同步 `index.html` 的预加载与分享图。原画质替换不运行会重新编码的 `optimize-media.py --videos`。
