import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 知识库文件路径
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');
const BIRTHDAY_INTROS_FILE = path.join(KNOWLEDGE_BASE_DIR, 'birthday_intros.json');
const DATE_MATCHES_FILE = path.join(KNOWLEDGE_BASE_DIR, 'date_matches.json');
const ENHANCED_DATE_MATCHES_FILE = path.join(KNOWLEDGE_BASE_DIR, 'enhanced_date_matches.json');

// 确保知识库目录存在
function ensureKnowledgeBaseDir() {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
  }
}

// 初始化知识库
function initializeKnowledgeBase() {
  ensureKnowledgeBaseDir();
  
  // 如果知识库文件不存在，从原始文件复制
  if (!fs.existsSync(BIRTHDAY_INTROS_FILE)) {
    try {
      const originalData = fs.readFileSync(path.join(process.cwd(), 'birthday_intros_classified.json'), 'utf8');
      fs.writeFileSync(BIRTHDAY_INTROS_FILE, originalData);
      console.log('✅ 生日介绍数据已复制到知识库');
    } catch (error) {
      console.error('❌ 复制生日介绍数据失败:', error);
    }
  }
  
  // 优先复制增强版生日匹配数据
  if (!fs.existsSync(ENHANCED_DATE_MATCHES_FILE)) {
    try {
      const enhancedSourceFile = path.join(process.cwd(), 'enhanced_date_matches.json');
      if (fs.existsSync(enhancedSourceFile)) {
        const enhancedData = fs.readFileSync(enhancedSourceFile, 'utf8');
        fs.writeFileSync(ENHANCED_DATE_MATCHES_FILE, enhancedData);
        console.log('✅ 增强版生日匹配数据已复制到知识库');
      } else {
        console.log('⚠️ 增强版生日匹配源文件不存在，使用标准版');
        const originalData = fs.readFileSync(path.join(process.cwd(), 'date_matches.json'), 'utf8');
        fs.writeFileSync(DATE_MATCHES_FILE, originalData);
        console.log('✅ 标准版生日匹配数据已复制到知识库');
      }
    } catch (error) {
      console.error('❌ 复制生日匹配数据失败:', error);
    }
  }
  
  // 如果增强版不存在，复制标准版
  if (!fs.existsSync(DATE_MATCHES_FILE) && !fs.existsSync(ENHANCED_DATE_MATCHES_FILE)) {
    try {
      const originalData = fs.readFileSync(path.join(process.cwd(), 'date_matches.json'), 'utf8');
      fs.writeFileSync(DATE_MATCHES_FILE, originalData);
      console.log('✅ 标准版生日匹配数据已复制到知识库');
    } catch (error) {
      console.error('❌ 复制生日匹配数据失败:', error);
    }
  }
}

// 获取生日介绍数据
function getBirthdayIntro(date: string) {
  try {
    const data = JSON.parse(fs.readFileSync(BIRTHDAY_INTROS_FILE, 'utf8'));
    return data[date] || null;
  } catch (error) {
    console.error('读取生日介绍数据失败:', error);
    return null;
  }
}

// 获取生日匹配数据
function getDateMatches(date: string) {
  try {
    // 优先使用增强版数据
    if (fs.existsSync(ENHANCED_DATE_MATCHES_FILE)) {
      const data = JSON.parse(fs.readFileSync(ENHANCED_DATE_MATCHES_FILE, 'utf8'));
      const match = data.find((item: any) => item.主日期 === date);
      return match?.匹配 || null;
    }
    
    // 回退到标准版数据
    if (fs.existsSync(DATE_MATCHES_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATE_MATCHES_FILE, 'utf8'));
      const match = data.find((item: any) => item.主日期 === date);
      return match?.匹配 || null;
    }
    
    return null;
  } catch (error) {
    console.error('读取生日匹配数据失败:', error);
    return null;
  }
}

// 更新知识库数据
function updateKnowledgeBase(type: 'birthday_intros' | 'date_matches', data: any) {
  try {
    const filePath = type === 'birthday_intros' ? BIRTHDAY_INTROS_FILE : DATE_MATCHES_FILE;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ ${type} 数据已更新到知识库`);
    return true;
  } catch (error) {
    console.error(`❌ 更新 ${type} 数据失败:`, error);
    return false;
  }
}

// GET - 获取知识库数据
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const type = searchParams.get('type') || 'all';
    
    // 初始化知识库
    initializeKnowledgeBase();
    
    if (date) {
      // 获取特定日期的数据
      const intro = getBirthdayIntro(date);
      const matches = getDateMatches(date);
      
      return NextResponse.json({
        success: true,
        data: {
          date,
          intro,
          matches
        }
      });
    } else {
      // 获取知识库状态
      const introExists = fs.existsSync(BIRTHDAY_INTROS_FILE);
      const enhancedMatchesExists = fs.existsSync(ENHANCED_DATE_MATCHES_FILE);
      const standardMatchesExists = fs.existsSync(DATE_MATCHES_FILE);
      const matchesExists = enhancedMatchesExists || standardMatchesExists;
      
      return NextResponse.json({
        success: true,
        status: {
          birthday_intros: introExists,
          enhanced_date_matches: enhancedMatchesExists,
          standard_date_matches: standardMatchesExists,
          date_matches: matchesExists,
          total_dates: introExists ? Object.keys(JSON.parse(fs.readFileSync(BIRTHDAY_INTROS_FILE, 'utf8'))).length : 0
        }
      });
    }
  } catch (error) {
    console.error('知识库API错误:', error);
    return NextResponse.json(
      { success: false, error: '获取知识库数据失败' },
      { status: 500 }
    );
  }
}

// POST - 更新知识库数据
export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();
    
    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 初始化知识库
    initializeKnowledgeBase();
    
    // 更新数据
    const success = updateKnowledgeBase(type, data);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `${type} 数据已更新到知识库`
      });
    } else {
      return NextResponse.json(
        { success: false, error: '更新知识库失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('更新知识库错误:', error);
    return NextResponse.json(
      { success: false, error: '更新知识库失败' },
      { status: 500 }
    );
  }
} 