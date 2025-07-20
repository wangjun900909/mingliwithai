# MongoDB 配置说明

## 当前状态
- 应用目前使用内存存储（临时方案）
- 用户信息保存在服务器内存中，重启后会丢失

## 配置 MongoDB

### 1. Railway MongoDB 配置

1. 在 Railway 控制台添加 MongoDB 服务
2. 获取 MongoDB 连接字符串
3. 在 Railway 环境变量中设置：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mingliwithai
   ```

### 2. 切换到 MongoDB 版本

配置好 MongoDB 后，将 `app/api/users/route.ts` 替换为 `app/api/users-mongodb/route.ts` 的内容：

```bash
# 备份当前版本
cp app/api/users/route.ts app/api/users-memory.ts

# 使用 MongoDB 版本
cp app/api/users-mongodb/route.ts app/api/users/route.ts
```

### 3. 验证配置

重启应用后，用户信息将持久化保存在 MongoDB 中。

## 功能说明

### 用户名功能
- 在 MBTI 前面添加了用户名输入框
- 支持保存用户信息和对话记录
- 支持加载之前保存的资料

### API 端点
- `GET /api/users?username=xxx` - 获取用户信息
- `POST /api/users` - 保存用户信息
- `DELETE /api/users?username=xxx` - 删除用户信息

### 数据结构
```json
{
  "username": "用户名",
  "userInfo": {
    "mbti": "INTJ",
    "gender": "male",
    "profession": "软件工程师",
    "status": "在职",
    "age": "25",
    "maritalStatus": "single",
    "hasChildren": "none",
    "birthday": {
      "date": "1月1日",
      "month": 1,
      "day": 1
    }
  },
  "messages": [
    {
      "role": "user",
      "content": "用户问题",
      "timestamp": "2025-07-20T08:00:00.000Z"
    },
    {
      "role": "assistant", 
      "content": "AI回答",
      "timestamp": "2025-07-20T08:00:01.000Z"
    }
  ],
  "createdAt": "2025-07-20T08:00:00.000Z",
  "updatedAt": "2025-07-20T08:00:01.000Z"
}
```

## 注意事项
- 当前使用内存存储，数据不会持久化
- 配置 MongoDB 后数据将持久化保存
- 用户名是唯一标识符 