# 日期匹配查询应用 - 手机版

## 🎯 项目简介

这是一个基于Next.js开发的手机版日期匹配查询应用，可以查询生日匹配关系，包括情人伴侣、工作伙伴朋友、竞争对手天敌、灵魂伴侣四种类型。

## ✨ 功能特点

### 📱 移动端优化
- **响应式设计**：完美适配手机屏幕
- **触摸友好**：大按钮、易点击
- **流畅动画**：使用Framer Motion实现平滑过渡

### 🔍 查询功能
- **主日期查询**：输入主日期查看其所有匹配关系
- **反向查询**：输入任意日期查看它在哪些主日期中出现
- **实时搜索**：快速响应的查询体验

### 🎨 界面设计
- **现代化UI**：使用Tailwind CSS构建
- **图标系统**：Lucide React图标库
- **颜色分类**：不同匹配类型使用不同颜色
- **渐变背景**：美观的视觉效果

## 🚀 技术栈

- **前端框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **部署**: Railway

## 📁 项目结构

```
├── app/
│   ├── api/
│   │   ├── data/
│   │   │   └── route.ts          # 主数据API
│   │   └── reverse-index/
│   │       └── route.ts          # 反向索引API
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── public/                       # 静态资源
├── package.json                  # 依赖配置
├── next.config.js               # Next.js配置
├── tailwind.config.js           # Tailwind配置
├── tsconfig.json                # TypeScript配置
└── railway.json                 # Railway部署配置
```

## 🛠️ 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

## 🚀 Railway部署

### 1. 准备数据文件
确保以下文件在项目根目录：
- `enhanced_date_matches.json` - 增强版主数据
- `enhanced_reverse_index.json` - 增强版反向索引

### 2. 部署到Railway
```bash
# 安装Railway CLI
npm install -g @railway/cli

# 登录Railway
railway login

# 初始化项目
railway init

# 部署
railway up
```

### 3. 环境变量配置
在Railway控制台设置以下环境变量：
- `NODE_ENV=production`
- `PORT=3000`

## 📱 使用说明

### 主日期查询
1. 选择"主日期查询"标签
2. 输入主日期，如：`1月1日`
3. 点击"查询"按钮
4. 查看该主日期的所有匹配关系

### 反向查询
1. 选择"反向查询"标签
2. 输入任意日期，如：`1月9日`
3. 点击"查询"按钮
4. 查看该日期在哪些主日期中出现

### 匹配类型说明
- **❤️ 情人伴侣**：粉色标识，表示浪漫关系
- **👥 工作伙伴朋友**：蓝色标识，表示工作或朋友关系
- **🎯 竞争对手天敌**：红色标识，表示竞争或敌对关系
- **⭐ 灵魂伴侣**：黄色标识，表示灵魂层面的匹配

## 🎨 界面预览

### 主页面
- 顶部标题和说明
- 标签切换（主日期查询/反向查询）
- 搜索输入框和按钮
- 结果展示区域
- 使用说明

### 结果展示
- 分类图标和颜色
- 匹配数量统计
- 日期标签展示
- 分页显示（超过10个显示"更多"）

## 🔧 自定义配置

### 修改主题颜色
编辑 `tailwind.config.js`：
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // 自定义主色调
      }
    }
  }
}
```

### 添加新的匹配类型
1. 在 `app/page.tsx` 中添加新的分类处理
2. 更新图标和颜色映射
3. 修改API数据结构

## 📊 性能优化

### 数据加载
- 使用API路由提供数据
- 客户端缓存查询结果
- 异步加载避免阻塞

### 移动端优化
- 响应式设计
- 触摸友好的交互
- 优化的字体大小和间距

## 🐛 故障排除

### 常见问题

1. **数据加载失败**
   - 检查JSON文件是否存在
   - 验证文件格式是否正确
   - 查看控制台错误信息

2. **部署失败**
   - 确认Node.js版本 >= 18
   - 检查package.json配置
   - 验证Railway配置

3. **样式问题**
   - 确认Tailwind CSS配置
   - 检查CSS文件引入
   - 验证响应式断点

## 📈 未来计划

- [ ] 添加搜索历史功能
- [ ] 实现离线缓存
- [ ] 添加分享功能
- [ ] 支持多语言
- [ ] 添加数据统计图表
- [ ] 实现PWA功能

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**注意**: 确保在生产环境中正确配置数据文件路径和API路由。 