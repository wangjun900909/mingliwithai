import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { memoryStorage, UserData } from '../../lib/memoryStorage';

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
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  console.log('环境检测:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    isProduction: isProd
  });
  return isProd;
}

// GET - 获取用户信息
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: '用户名是必需的' }, { status: 400 });
    }
    
    if (isProduction()) {
      // 生产环境使用MongoDB
      const client = await getMongoClient();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
      
      const userData = await collection.findOne({ username });
      await client.close();
      
      if (!userData) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: userData
      });
    } else {
      // 本地开发使用内存存储
      const userData = memoryStorage.get(username);
      
      if (!userData) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        data: userData
      });
    }
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST - 保存用户信息
export async function POST(req: NextRequest) {
  try {
    const { username, userInfo, messages } = await req.json();
    
    if (!username) {
      return NextResponse.json({ error: '用户名是必需的' }, { status: 400 });
    }
    
    const now = new Date().toISOString();
    
    if (isProduction()) {
      // 生产环境使用MongoDB
      const client = await getMongoClient();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
      
      // 检查用户是否已存在
      const existingUser = await collection.findOne({ username });
      
      if (existingUser) {
        // 更新现有用户
        await collection.updateOne(
          { username },
          {
            $set: {
              userInfo,
              messages,
              updatedAt: now
            }
          }
        );
      } else {
        // 创建新用户
        const userData: UserData = {
          username,
          userInfo,
          messages,
          createdAt: now,
          updatedAt: now
        };
        
        await collection.insertOne(userData);
      }
      
      await client.close();
    } else {
      // 本地开发使用内存存储
      const existingUser = memoryStorage.has(username);
      
      if (existingUser) {
        // 更新现有用户
        const existingData = memoryStorage.get(username);
        memoryStorage.set(username, {
          ...existingData,
          userInfo,
          messages,
          updatedAt: now
        });
      } else {
        // 创建新用户
        const userData: UserData = {
          username,
          userInfo,
          messages,
          createdAt: now,
          updatedAt: now
        };
        
        memoryStorage.set(username, userData);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '用户信息已保存'
    });
    
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE - 删除用户信息
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: '用户名是必需的' }, { status: 400 });
    }
    
    if (isProduction()) {
      // 生产环境使用MongoDB
      const client = await getMongoClient();
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
      
      const result = await collection.deleteOne({ username });
      await client.close();
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }
    } else {
      // 本地开发使用内存存储
      const deleted = memoryStorage.delete(username);
      
      if (!deleted) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: '用户信息已删除'
    });
    
  } catch (error) {
    console.error('删除用户信息失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 