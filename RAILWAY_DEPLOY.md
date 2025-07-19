# Railway 部署指南

## 🚀 快速部署到 Railway

### 1. 准备工作

确保您有以下文件：
- ✅ `package.json` - 项目配置
- ✅ `next.config.js` - Next.js配置
- ✅ `railway.json` - Railway配置
- ✅ `enhanced_date_matches.json` - 增强版主数据
- ✅ `enhanced_reverse_index.json` - 增强版反向索引
- ✅ `app/` 目录 - 应用代码

### 2. 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 3. 登录 Railway

```bash
railway login
```

### 4. 初始化项目

```bash
railway init
```

### 5. 部署应用

```bash
railway up
```

## 📱 应用功能

### 主日期查询
- 输入主日期（如：1月1日）
- 查看该日期的所有匹配关系
- 支持四种匹配类型

### 反向查询
- 输入任意日期（如：1月9日）
- 查看该日期在哪些主日期中出现
- 显示匹配的分类信息

### 匹配类型
- ❤️ **情人伴侣** - 粉色标识
- 👥 **工作伙伴朋友** - 蓝色标识
- 🎯 **竞争对手天敌** - 红色标识
- ⭐ **灵魂伴侣** - 黄色标识

## 🔧 环境配置

### Railway 环境变量
在 Railway 控制台设置以下环境变量：

```bash
NODE_ENV=production
PORT=3000
```

### 数据文件
确保以下文件在项目根目录：
- `enhanced_date_matches.json` (1.1MB)
- `enhanced_reverse_index.json` (3.8MB)

## 📊 部署统计

### 构建信息
- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React

### 数据统计
- **主日期数量**: 366个
- **总匹配数**: 51,055个
- **双向匹配比例**: 100%
- **文件大小**: 主数据1.1MB，反向索引3.8MB

## 🌐 访问应用

部署成功后，Railway 会提供一个域名，类似：
```
https://your-app-name.railway.app
```

## 📱 移动端优化

### 响应式设计
- 完美适配手机屏幕
- 触摸友好的交互
- 优化的字体大小

### 性能优化
- 静态生成页面
- 客户端缓存
- 异步数据加载

## 🐛 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理并重新安装
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **数据加载失败**
   - 检查JSON文件是否存在
   - 验证文件格式
   - 查看Railway日志

3. **部署失败**
   - 确认Node.js版本 >= 18
   - 检查package.json配置
   - 验证railway.json配置

### 查看日志
```bash
railway logs
```

## 🔄 更新部署

### 代码更新
```bash
# 提交更改
git add .
git commit -m "更新应用"

# 重新部署
railway up
```

### 数据更新
1. 更新JSON数据文件
2. 重新部署应用
3. 验证数据加载

## 📈 监控和维护

### Railway 监控
- 访问量统计
- 错误日志
- 性能监控

### 应用监控
- API响应时间
- 数据加载状态
- 用户查询统计

## 🎯 最佳实践

### 部署前检查
- [ ] 本地构建成功
- [ ] 数据文件完整
- [ ] 环境变量配置
- [ ] 域名设置

### 部署后验证
- [ ] 应用正常访问
- [ ] 数据加载正常
- [ ] 移动端适配
- [ ] 查询功能正常

## 📞 技术支持

如果遇到问题：
1. 查看Railway日志
2. 检查应用控制台
3. 验证数据文件
4. 联系技术支持

---

**注意**: 确保在生产环境中正确配置数据文件路径和API路由。 