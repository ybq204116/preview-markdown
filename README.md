# AI 增强全栈 Markdown 预览平台

这是一个基于 Vue 3 和 Express 构建的全栈 Markdown 写作与预览平台。它不仅提供了强大的 Markdown 编辑和预览功能，还集成了 AI 智能写作辅助，支持多端同步和文档持久化存储。

## 🌟 核心特性

### 🤖 AI 智能写作 (New!)
- **集成 SiliconFlow API**：基于 DeepSeek-V3 模型的强大 AI 支持。
- **右键菜单增强**：在编辑器中通过右键即可调用 AI 功能。
- **流式响应**：打字机式的实时内容生成体验。
- **多场景支持**：
    - ✨ **智能润色**：优化语言表达，提升文档专业度。
    - 📝 **自动续写**：根据上下文内容自动完成后续撰写。
    - 🔍 **内容解释**：快速解释选中的概念或技术术语。

### 📝 强大编辑器
- **实时编辑预览**：所见即所得的编辑体验。
- **自动换行**：支持长文本自动换行，告别水平滚动。
- **语法增强**：
    - 📊 **Mermaid 图表**：支持流程图、序列图、甘特图等多种图表。
    - 🧮 **LaTeX 公式**：支持复杂的数学公式渲染。
    - 😀 **表情支持**：内置表情选择器，支持 Emoji 短代码。
- **多格式导出**：支持导出为 HTML 和 PDF 文件。

### ☁️ 全栈架构
- **后端持久化**：采用 Express + MongoDB，告别 LocalStorage 限制，支持文档云端存储。
- **用户系统**：支持手机号登录/注册，多端数据同步。
- **JWT 认证**：安全的身份验证机制。

## 📁 详细目录结构

### 🎨 前端项目 (`packages/client`)
```text
src/
├── components/          # Vue 组件
│   ├── Editor.vue       # 核心编辑器组件 (基于 CodeMirror 6，集成 AI 功能)
│   ├── Preview.vue      # Markdown 实时预览组件 (基于 markdown-it)
│   ├── Toolbar.vue      # 顶部工具栏 (新建、保存、导出、主题切换)
│   ├── FileList.vue     # 左侧文档列表 (管理多个文档)
│   ├── AuthForm.vue     # 登录/注册表单切换逻辑
│   ├── LoginView.vue    # 登录弹窗/页面容器
│   ├── EmojiPicker.vue  # 表情选择器组件
│   ├── Outline.vue      # 文档大纲/目录导航
│   ├── ContextMenu.vue  # 自定义右键菜单容器
│   ├── ContextMenuItem.vue # 右键菜单子项
│   └── ImagePreview.vue # 图片预览组件
├── store/               # Pinia 状态管理
│   ├── authStore.js     # 用户认证状态 (Token、用户信息、登录退出)
│   ├── documentStore.js # 文档数据管理 (当前文档、列表、保存、删除)
│   └── themeStore.js    # 主题状态管理 (明亮/黑暗模式)
├── assets/              # 静态资源
│   └── styles/
│       ├── style.css    # 全局基础样式 (Tailwind 指令)
│       └── preview.css  # 预览区专属 Markdown 渲染样式
├── App.vue              # 根组件 (布局组织)
└── main.js              # 入口文件 (挂载 Vue、Pinia 等)
```

### ⚙️ 后端项目 (`packages/server`)
```text
src/
├── config/              # 全局配置
│   └── db.js            # MongoDB 数据库连接配置 (Mongoose)
├── middleware/          # 中间件
│   └── auth.js          # JWT 验证中间件 (保护受限接口)
├── models/              # Mongoose 数据模型
│   ├── User.js          # 用户模型 (手机号、密码加密存储)
│   ├── Document.js      # 文档模型 (内容、标题、作者、更新时间)
│   ├── Setting.js       # 用户个性化设置模型
│   └── Image.js         # 图片上传/管理模型
├── routes/              # 路由接口定义
│   ├── auth.js          # 认证相关接口 (注册、登录、获取当前用户)
│   ├── documents.js     # 文档增删改查接口
│   ├── ai.js            # AI 服务接口 (SSE 流式输出、Prompt 管理)
│   ├── images.js        # 图片上传与获取接口
│   └── settings.js      # 用户设置接口
└── server.js            # 服务端入口 (Express 实例、中间件加载、路由挂载)
```

## 🛠️ 技术栈

### 前端 (Packages/Client)
- **框架**：Vue 3 + Vite
- **编辑器**：CodeMirror 6
- **样式**：Tailwind CSS
- **解析器**：markdown-it
- **状态管理**：Pinia
- **网络请求**：Axios

### 后端 (Packages/Server)
- **运行时**：Node.js
- **框架**：Express
- **数据库**：MongoDB (Mongoose)
- **AI 接口**：OpenAI SDK (对接 SiliconFlow)
- **认证**：JSON Web Token (JWT)

## 🚀 快速开始

### 1. 环境准备
- Node.js 16+
- MongoDB 数据库
- SiliconFlow API Key (用于 AI 功能)

### 2. 配置文件
在 `packages/server` 目录下创建 `.env` 文件：
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/markdown-db
JWT_SECRET=your_jwt_secret
SILICONFLOW_API_KEY=your_api_key
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3
```

### 3. 安装与运行
在项目根目录下执行：

```bash
# 安装所有依赖
npm install

# 启动开发服务器 (同时启动前端和后端)
npm run dev
```

- 前端地址：`http://localhost:5173`
- 后端地址：`http://localhost:5000`


## 🖼️ 预览
![预览](./preview-img/preview-1.png)