const { MongoClient } = require('mongodb');

// 测试连接字符串
const MONGODB_URI = 'mongodb://mongo:IDiVmmlPYUwpGvxVWpYNVEiMYjxcYGaB@mongodb.railway.internal:27017/mingliwithai?retryWrites=true&w=majority';

async function testConnection() {
  console.log('🔍 测试MongoDB连接...');
  console.log('连接字符串:', MONGODB_URI);
  
  try {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('📡 尝试连接...');
    await client.connect();
    console.log('✅ MongoDB连接成功！');
    
    const db = client.db('mingliwithai');
    const collection = db.collection('users');
    
    console.log('📊 测试数据库操作...');
    
    // 测试插入
    const testUser = {
      username: 'test_user',
      userInfo: { mbti: 'INTJ' },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await collection.updateOne(
      { username: 'test_user' },
      { $set: testUser },
      { upsert: true }
    );
    console.log('✅ 插入/更新测试成功');
    
    // 测试查询
    const user = await collection.findOne({ username: 'test_user' });
    console.log('✅ 查询测试成功:', user ? '用户存在' : '用户不存在');
    
    // 测试获取所有用户
    const allUsers = await collection.find({}).toArray();
    console.log(`✅ 获取所有用户成功，共 ${allUsers.length} 个用户`);
    
    await client.close();
    console.log('✅ 所有测试通过！');
    
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message);
    console.error('详细错误:', error);
  }
}

testConnection(); 