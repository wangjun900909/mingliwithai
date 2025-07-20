import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { memoryStorage } from '../../../lib/memoryStorage';

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'mingliwithai';
const COLLECTION_NAME = 'users';

// MongoDB连接池
let mongoClient: MongoClient | null = null;

// 获取MongoDB客户端（使用连接池）
async function getMongoClient() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI环境变量未设置');
    }
    
    // 如果连接池中没有客户端，创建新的
    if (!mongoClient) {
      mongoClient = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      await mongoClient.connect();
    }
    
    return mongoClient;
  } catch (error) {
    throw error;
  }
}

// 检查是否在生产环境
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// GET - 获取所有用户信息
export async function GET(req: NextRequest) {
  try {
    if (isProduction() && MONGODB_URI) {
      // 生产环境使用MongoDB
      try {
        const client = await getMongoClient();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        
        const users = await collection.find({}).toArray();
        
        return NextResponse.json({
          success: true,
          users: users
        });
      } catch (mongoError) {
        // MongoDB失败，回退到内存存储
        const users = memoryStorage.getAll();
        
        return NextResponse.json({
          success: true,
          users: users
        });
      }
    } else {
      // 本地开发或MongoDB不可用时使用内存存储
      const users = memoryStorage.getAll();
      
      return NextResponse.json({
        success: true,
        users: users
      });
    }
    
  } catch (error) {
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 