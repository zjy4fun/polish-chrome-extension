# Polish - 文本润色助手

一个浏览器扩展，利用 ChatGPT API 智能润色文本，让你的表达更专业、更清晰。

## 功能特点

- **智能润色**：利用 ChatGPT API 优化你的文本表达
- **多种风格**：支持正式、口语、简洁三种润色风格
- **快捷触发**：通过快捷键 `Alt+O` 或右键菜单快速触发
- **实时预览**：浮窗展示优化结果，一键替换原文本
- **隐私安全**：API Key 仅存储在本地，不上传任何服务器

## 安装使用

### 1. 获取代码

```bash
git clone <repository-url>
cd polish
npm install --legacy-peer-deps
```

### 2. 构建扩展

```bash
# 构建 Chrome 版本
npm run build:chrome

# 构建 Firefox 版本
npm run build:firefox
```

### 3. 加载扩展

**Chrome:**
1. 打开 `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `dist_chrome` 文件夹

**Firefox:**
1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击「加载临时附加组件」
3. 选择 `dist_firefox` 文件夹中的 `manifest.json`

### 4. 配置 API Key

1. 点击扩展图标，进入设置页面
2. 输入你的 OpenAI API Key
3. 选择默认润色风格
4. 保存设置

## 使用方法

### 快捷键触发
1. 在任意输入框中输入文本
2. 按下 `Alt+O`
3. 浮窗显示优化结果
4. 点击「接受」替换原文本

### 右键菜单触发
1. 选中文本或聚焦输入框
2. 右键选择「润色选中文本」或「润色输入框内容」
3. 浮窗显示优化结果

### Popup 触发
1. 点击扩展图标
2. 选择润色风格
3. 点击「润色当前输入框」

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Vite** - 构建工具
- **Chrome Extension Manifest V3**

## 开发

```bash
# 开发模式（Chrome）
npm run dev:chrome

# 开发模式（Firefox）
npm run dev:firefox
```

## 安全说明

- 不监听密码框、支付信息等敏感输入
- API Key 仅存储在 `chrome.storage.local`
- 只申请必要的权限：`activeTab`、`storage`、`contextMenus`

## License

MIT
