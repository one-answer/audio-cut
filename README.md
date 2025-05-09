# Audio Cut - 音频剪辑工具

一个基于Web的音频剪辑工具，使用React和TypeScript开发，允许用户上传、编辑和处理音频文件。支持MP3、WAV、OGG等格式的剪切、波形可视化和音频处理。无需下载软件，直接在浏览器中编辑音频文件。

本项目使用 [Create React App](https://github.com/facebook/create-react-app) 引导创建。

## 可用脚本

在项目目录中，你可以运行：

### `npm start`

在开发模式下运行应用。\
打开 [http://localhost:3000](http://localhost:3000) 在浏览器中查看。

当你进行编辑时，页面将会重新加载。\
你还将在控制台中看到任何 lint 错误。

### `npm test`

在交互式监视模式下启动测试运行器。\
有关更多信息，请参阅关于[运行测试](https://facebook.github.io/create-react-app/docs/running-tests)的部分。

### `npm run build`

将应用程序构建到 `build` 文件夹中用于生产环境。\
它在生产模式下正确打包 React 并优化构建以获得最佳性能。

构建被压缩，文件名包含哈希值。\
你的应用已准备好部署！

有关更多信息，请参阅关于[部署](https://facebook.github.io/create-react-app/docs/deployment)的部分。

### `npm run eject`

**注意：这是单向操作。一旦你 `eject`，就不能回去了！**

如果你对构建工具和配置选择不满意，可以随时 `eject`。此命令将从你的项目中删除单个构建依赖项。

相反，它会将所有配置文件和传递依赖项（webpack、Babel、ESLint 等）直接复制到你的项目中，以便你完全控制它们。除了 `eject` 之外的所有命令仍然可以使用，但它们将指向复制的脚本，因此你可以调整它们。此时你只能靠自己了。

你不必使用 `eject`。精选的功能集适用于中小型部署，你不应该觉得有义务使用此功能。但是，我们理解，如果你在准备好时无法自定义它，这个工具将不会有用。

## 了解更多

你可以在 [Create React App 文档](https://facebook.github.io/create-react-app/docs/getting-started)中了解更多信息。

要学习 React，请查看 [React 文档](https://reactjs.org/)。

## 网站功能

### 主要功能

- **音频上传**: 支持上传各种格式的音频文件
- **波形可视化**: 使用WaveSurfer.js展示音频波形，直观地展示音频内容
- **音频剪辑**: 支持选择音频片段进行剪切
- **播放控制**: 包含播放、暂停、停止和跳转功能
- **音量调节**: 可调节音频播放音量
- **波形缩放**: 支持缩放波形显示以查看更多细节

### 技术特点

- 使用WaveSurfer.js实现音频波形可视化
- 基于Web Audio API进行音频处理
- 响应式设计，适应不同屏幕尺寸
- 使用Ant Design组件库构建用户界面

## 源码结构

```
src/
├── components/           # 组件目录
│   ├── AudioEditor/       # 音频编辑器相关组件
│   │   ├── AudioControls.tsx  # 音频控制组件
│   │   ├── AudioEditor.tsx    # 主编辑器组件
│   │   └── WaveformDisplay.tsx # 波形显示组件
│   └── common/            # 通用组件
├── hooks/                # 自定义React Hooks
│   ├── useAudioPlayer.ts   # 音频播放器Hook
│   └── useWaveform.ts      # 波形处理Hook
├── services/             # 服务层
│   ├── audioProcessing.ts  # 音频处理服务
│   └── waveformRenderer.ts # 波形渲染服务
├── types/                # TypeScript类型定义
│   ├── audio.ts           # 音频相关类型
│   └── wavesurfer.d.ts     # WaveSurfer类型声明
├── utils/                # 工具函数
│   └── audioHelpers.ts     # 音频处理辅助函数
├── App.tsx               # 应用程序主组件
└── index.tsx             # 应用程序入口点
```

## 技术栈

- **前端框架**: React 19
- **编程语言**: TypeScript
- **UI库**: Ant Design 5.x
- **波形可视化**: WaveSurfer.js 4.x
- **构建工具**: Create React App
- **音频处理**: Web Audio API

## 开发注意事项

- 在开发过程中，我们已经禁用了ESLint检查并设置CI=false以加快构建过程
- WaveSurfer.js的初始化需要特别注意，确保在加载音频前实例已完全初始化
- 对于大文件的处理，建议使用Web Worker来避免阻塞主线程

## SEO 优化

本项目已经进行了全面的SEO优化，包括：

- **元标签优化**: 添加了完整的标题、描述和关键词元标签
- **结构化数据**: 使用JSON-LD添加了符合Schema.org规范的结构化数据
- **社交媒体元标签**: 添加了Open Graph和Twitter Card元标签，优化社交媒体分享
- **网站地图**: 创建了sitemap.xml文件，便于搜索引擎爬取
- **机器人文件**: 更新了robots.txt文件，指导搜索引擎爬虫
- **服务器配置**: 添加了.htaccess和web.config文件，优化URL重定向和缓存
- **性能优化**: 启用了压缩和缓存，提高网站加载速度

这些优化措施将有助于提高网站在搜索引擎中的排名和可见度。
