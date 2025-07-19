#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 知识库目录
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');
const BIRTHDAY_INTROS_FILE = path.join(KNOWLEDGE_BASE_DIR, 'birthday_intros.json');
const DATE_MATCHES_FILE = path.join(KNOWLEDGE_BASE_DIR, 'date_matches.json');
const ENHANCED_DATE_MATCHES_FILE = path.join(KNOWLEDGE_BASE_DIR, 'enhanced_date_matches.json');

// 源文件路径
const SOURCE_BIRTHDAY_INTROS = path.join(process.cwd(), 'birthday_intros_classified.json');
const SOURCE_DATE_MATCHES = path.join(process.cwd(), 'date_matches.json');
const SOURCE_ENHANCED_DATE_MATCHES = path.join(process.cwd(), 'enhanced_date_matches.json');

console.log('🚀 开始初始化生日知识库...\n');

// 确保知识库目录存在
function ensureKnowledgeBaseDir() {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
    console.log('✅ 创建知识库目录:', KNOWLEDGE_BASE_DIR);
  } else {
    console.log('✅ 知识库目录已存在');
  }
}

// 复制生日介绍数据
function copyBirthdayIntros() {
  try {
    if (fs.existsSync(SOURCE_BIRTHDAY_INTROS)) {
      const data = fs.readFileSync(SOURCE_BIRTHDAY_INTROS, 'utf8');
      fs.writeFileSync(BIRTHDAY_INTROS_FILE, data);
      
      const introData = JSON.parse(data);
      const totalDates = Object.keys(introData).length;
      
      console.log('✅ 生日介绍数据已复制到知识库');
      console.log(`   总日期数量: ${totalDates}`);
      console.log(`   文件大小: ${(fs.statSync(BIRTHDAY_INTROS_FILE).size / 1024 / 1024).toFixed(2)} MB`);
      
      return true;
    } else {
      console.log('❌ 源文件不存在:', SOURCE_BIRTHDAY_INTROS);
      return false;
    }
  } catch (error) {
    console.error('❌ 复制生日介绍数据失败:', error.message);
    return false;
  }
}

// 复制生日匹配数据
function copyDateMatches() {
  try {
    // 优先复制增强版数据
    if (fs.existsSync(SOURCE_ENHANCED_DATE_MATCHES)) {
      const data = fs.readFileSync(SOURCE_ENHANCED_DATE_MATCHES, 'utf8');
      fs.writeFileSync(ENHANCED_DATE_MATCHES_FILE, data);
      
      const matchesData = JSON.parse(data);
      const totalMatches = matchesData.length;
      
      console.log('✅ 增强版生日匹配数据已复制到知识库');
      console.log(`   总匹配数量: ${totalMatches}`);
      console.log(`   文件大小: ${(fs.statSync(ENHANCED_DATE_MATCHES_FILE).size / 1024 / 1024).toFixed(2)} MB`);
      
      return true;
    } else if (fs.existsSync(SOURCE_DATE_MATCHES)) {
      const data = fs.readFileSync(SOURCE_DATE_MATCHES, 'utf8');
      fs.writeFileSync(DATE_MATCHES_FILE, data);
      
      const matchesData = JSON.parse(data);
      const totalMatches = matchesData.length;
      
      console.log('✅ 标准版生日匹配数据已复制到知识库');
      console.log(`   总匹配数量: ${totalMatches}`);
      console.log(`   文件大小: ${(fs.statSync(DATE_MATCHES_FILE).size / 1024 / 1024).toFixed(2)} MB`);
      
      return true;
    } else {
      console.log('❌ 生日匹配源文件不存在');
      return false;
    }
  } catch (error) {
    console.error('❌ 复制生日匹配数据失败:', error.message);
    return false;
  }
}

// 验证知识库数据
function validateKnowledgeBase() {
  console.log('\n🔍 验证知识库数据...');
  
  try {
    // 验证生日介绍数据
    if (fs.existsSync(BIRTHDAY_INTROS_FILE)) {
      const introData = JSON.parse(fs.readFileSync(BIRTHDAY_INTROS_FILE, 'utf8'));
      const sampleDate = Object.keys(introData)[0];
      const sampleData = introData[sampleDate];
      
      console.log('✅ 生日介绍数据验证通过');
      console.log(`   示例日期: ${sampleDate}`);
      console.log(`   数据字段: ${Object.keys(sampleData).join(', ')}`);
    } else {
      console.log('❌ 生日介绍数据文件不存在');
    }
    
    // 验证生日匹配数据
    if (fs.existsSync(ENHANCED_DATE_MATCHES_FILE)) {
      const matchesData = JSON.parse(fs.readFileSync(ENHANCED_DATE_MATCHES_FILE, 'utf8'));
      const sampleMatch = matchesData[0];
      
      console.log('✅ 增强版生日匹配数据验证通过');
      console.log(`   示例匹配: ${sampleMatch.主日期}`);
      console.log(`   匹配类型: ${Object.keys(sampleMatch.匹配).join(', ')}`);
    } else if (fs.existsSync(DATE_MATCHES_FILE)) {
      const matchesData = JSON.parse(fs.readFileSync(DATE_MATCHES_FILE, 'utf8'));
      const sampleMatch = matchesData[0];
      
      console.log('✅ 标准版生日匹配数据验证通过');
      console.log(`   示例匹配: ${sampleMatch.主日期}`);
      console.log(`   匹配类型: ${Object.keys(sampleMatch.匹配).join(', ')}`);
    } else {
      console.log('❌ 生日匹配数据文件不存在');
    }
    
  } catch (error) {
    console.error('❌ 验证知识库数据失败:', error.message);
  }
}

// 创建知识库信息文件
function createKnowledgeBaseInfo() {
  const info = {
    created_at: new Date().toISOString(),
    version: '1.0.0',
    description: '生日知识库 - 包含生日介绍和匹配数据',
    files: {
      birthday_intros: {
        path: 'birthday_intros.json',
        description: '生日介绍数据，包含性格特征、恋爱婚姻、工作财运等信息'
      },
      date_matches: {
        path: 'date_matches.json',
        description: '生日匹配数据，包含情人伴侣、朋友、同事等匹配关系'
      }
    },
    total_dates: 0,
    enhanced_total_matches: 0,
    standard_total_matches: 0,
    total_matches: 0
  };
  
  try {
    // 计算总数量
    if (fs.existsSync(BIRTHDAY_INTROS_FILE)) {
      const introData = JSON.parse(fs.readFileSync(BIRTHDAY_INTROS_FILE, 'utf8'));
      info.total_dates = Object.keys(introData).length;
    }
    
    if (fs.existsSync(ENHANCED_DATE_MATCHES_FILE)) {
      const matchesData = JSON.parse(fs.readFileSync(ENHANCED_DATE_MATCHES_FILE, 'utf8'));
      info.enhanced_total_matches = matchesData.length;
      info.total_matches = matchesData.length;
    } else if (fs.existsSync(DATE_MATCHES_FILE)) {
      const matchesData = JSON.parse(fs.readFileSync(DATE_MATCHES_FILE, 'utf8'));
      info.standard_total_matches = matchesData.length;
      info.total_matches = matchesData.length;
    }
    
    const infoFile = path.join(KNOWLEDGE_BASE_DIR, 'info.json');
    fs.writeFileSync(infoFile, JSON.stringify(info, null, 2));
    
    console.log('✅ 知识库信息文件已创建');
    console.log(`   总日期数量: ${info.total_dates}`);
    if (info.enhanced_total_matches > 0) {
      console.log(`   增强版匹配数量: ${info.enhanced_total_matches}`);
    } else {
      console.log(`   标准版匹配数量: ${info.standard_total_matches}`);
    }
    console.log(`   总匹配数量: ${info.total_matches}`);
    
  } catch (error) {
    console.error('❌ 创建知识库信息文件失败:', error.message);
  }
}

// 主函数
function main() {
  console.log('📚 生日知识库初始化工具\n');
  
  // 1. 创建目录
  ensureKnowledgeBaseDir();
  
  // 2. 复制数据
  const introSuccess = copyBirthdayIntros();
  const matchesSuccess = copyDateMatches();
  
  // 3. 验证数据
  if (introSuccess || matchesSuccess) {
    validateKnowledgeBase();
    createKnowledgeBaseInfo();
  }
  
  // 4. 总结
  console.log('\n🎉 知识库初始化完成！');
  console.log('\n📁 知识库文件位置:');
  console.log(`   ${KNOWLEDGE_BASE_DIR}/`);
  console.log('\n🌐 访问知识库管理页面:');
  console.log('   http://localhost:3001/knowledge-base');
  console.log('\n🔧 API端点:');
  console.log('   GET  /api/knowledge-base - 获取知识库状态');
  console.log('   GET  /api/knowledge-base?date=1月1日 - 查询特定日期');
  console.log('   POST /api/knowledge-base - 更新知识库数据');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  ensureKnowledgeBaseDir,
  copyBirthdayIntros,
  copyDateMatches,
  validateKnowledgeBase,
  createKnowledgeBaseInfo
}; 