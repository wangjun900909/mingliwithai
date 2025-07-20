import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'mingliwithai';
const COLLECTION_NAME = 'users';

// 用户信息接口
interface UserData {
  username: string;
  userInfo: {
    mbti?: string;
    gender?: string;
    profession?: string;
    status?: string;
    age?: string;
    maritalStatus?: string;
    hasChildren?: string;
    birthday?: {
      date?: string;
      month?: number;
      day?: number;
    };
  };
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

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

// GET - 获取用户信息
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: '用户名是必需的' }, { status: 400 });
    }
    
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
    
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const now = new Date().toISOString();
    
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
    
    return NextResponse.json({
      success: true,
      message: existingUser ? '用户信息已更新' : '用户信息已保存'
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
    
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    const result = await collection.deleteOne({ username });
    await client.close();
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
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