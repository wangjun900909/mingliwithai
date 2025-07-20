# Railway 环境变量配置

## 当前状态
- ✅ 本地开发：使用内存存储（正常工作）
- ✅ 生产环境：使用MongoDB（需要配置环境变量）

## Railway MongoDB 配置

### 1. 环境变量名称
**正确的环境变量名称**: `MONGODB_URI`

### 2. 连接字符串格式
```
mongodb://mongo:IDiVmmlPYUwpGvxVWpYNVEiMYjxcYGaB@mongodb.railway.internal:27017/mingliwithai?retryWrites=true&w=majority
```

### 3. 在Railway控制台设置环境变量

1. 登录Railway控制台
2. 选择您的项目
3. 进入 "Variables" 标签页
4. 添加环境变量：
   - **变量名**: `MONGODB_URI`
   - **变量值**: `mongodb://mongo:IDiVmmlPYUwpGvxVWpYNVEiMYjxcYGaB@mongodb.railway.internal:27017/mingliwithai?retryWrites=true&w=majority`

### 4. 验证配置

配置完成后，应用将：
- 自动检测生产环境
- 使用MongoDB持久化存储
- 支持用户数据持久化

## 环境检测逻辑

应用会自动检测环境：
- **本地开发** (`NODE_ENV !== 'production'`): 使用内存存储
- **生产环境** (`NODE_ENV === 'production'`): 使用MongoDB

## 功能验证

配置完成后，以下功能将正常工作：

### 用户管理
- ✅ 用户注册和登录
- ✅ 个人信息保存
- ✅ 对话历史记录

### 管理工具
- ✅ 浏览所有用户
- ✅ 查看用户详情
- ✅ 搜索和排序功能

### 数据持久化
- ✅ 用户信息永久保存
- ✅ 对话记录永久保存
- ✅ 数据备份和恢复

## 注意事项

1. **环境变量名称**: 确保使用 `MONGODB_URI` 而不是 `manggodb`
2. **连接字符串**: 必须包含数据库名称和查询参数
3. **Railway内部网络**: 只能在Railway环境中访问
4. **数据安全**: 生产环境数据会永久保存在MongoDB中 