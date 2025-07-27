import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { memoryStorage, UserData } from '../../lib/memoryStorage';
import * as fs from 'fs';
import * as path from 'path';

// MongoDB连接配置（保留但停用）
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'mingliwithai';
const COLLECTION_NAME = 'users';

// MongoDB连接池（保留但停用）
let mongoClient: MongoClient | null = null;

// 获取MongoDB客户端（保留但停用）
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

// 本地文件存储路径
const USERS_DATA_FILE = path.join(process.cwd(), 'users_data.json');

// 确保数据目录存在
function ensureDataFile() {
  const dir = path.dirname(USERS_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_DATA_FILE)) {
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify({}, null, 2));
  }
}

// 从文件读取用户数据
function readUsersFromFile(): { [username: string]: UserData } {
  try {
    ensureDataFile();
    const data = fs.readFileSync(USERS_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取用户数据文件失败:', error);
    return {};
  }
}

// 保存用户数据到文件
function saveUsersToFile(users: { [username: string]: UserData }) {
  try {
    ensureDataFile();
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('保存用户数据文件失败:', error);
    throw error;
  }
}

// 检查是否在生产环境
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// GET - 获取用户信息
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: '用户名是必需的' }, { status: 400 });
    }
    
    // 停用MongoDB，使用本地文件存储
    const users = readUsersFromFile();
    const userData = users[username];
    
    if (!userData) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: userData
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
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
    
    // 停用MongoDB，使用本地文件存储
    const users = readUsersFromFile();
    
    const userData: UserData = {
      username,
      userInfo,
      messages,
      createdAt: users[username]?.createdAt || now,
      updatedAt: now
    };
    
    users[username] = userData;
    saveUsersToFile(users);
    
    return NextResponse.json({
      success: true,
      message: '用户信息已保存'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
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
    
    // 停用MongoDB，使用本地文件存储
    const users = readUsersFromFile();
    
    if (!users[username]) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    
    delete users[username];
    saveUsersToFile(users);
    
    return NextResponse.json({
      success: true,
      message: '用户信息已删除'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: '服务器错误',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 