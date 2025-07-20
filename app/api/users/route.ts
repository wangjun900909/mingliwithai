import { NextRequest, NextResponse } from 'next/server';

// 临时内存存储（在没有MongoDB的情况下使用）
const memoryStorage = new Map();

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

// GET - 获取用户信息
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: '用户名是必需的' }, { status: 400 });
    }
    
    const userData = memoryStorage.get(username);
    
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
    
    const now = new Date().toISOString();
    
    // 检查用户是否已存在
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
    
    const deleted = memoryStorage.delete(username);
    
    if (!deleted) {
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