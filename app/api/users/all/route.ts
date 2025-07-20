import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { memoryStorage } from '../../../lib/memoryStorage';

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:IDiVmmlPYUwpGvxVWpYNVEiMYjxcYGaB@mongodb.railway.internal:27017/mingliwithai?retryWrites=true&w=majority';
const DB_NAME = 'mingliwithai';
const COLLECTION_NAME = 'users';

// 获取MongoDB客户端
async function getMongoClient() {
  try {
    console.log('MongoDB URI:', MONGODB_URI);
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('MongoDB连接成功');
    return client;
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    throw error;
  }
}

// 检查是否在生产环境
function isProduction() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
}

// GET - 获取所有用户信息
export async function GET(req: NextRequest) {
  try {
    if (isProduction()) {
      // 生产环境使用MongoDB
      const client = await getMongoClient();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
      
      const users = await collection.find({}).toArray();
      await client.close();
      
      return NextResponse.json({
        success: true,
        users: users
      });
    } else {
      // 本地开发使用内存存储
      const users = Array.from(memoryStorage.values());
      
      return NextResponse.json({
        success: true,
        users: users
      });
    }
    
  } catch (error) {
    console.error('获取所有用户信息失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 