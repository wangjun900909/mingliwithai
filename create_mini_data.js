#!/usr/bin/env node

/**
 * 创建小型测试数据文件
 */

const fs = require('fs');
const path = require('path');

// 读取原始数据
const enhancedData = JSON.parse(fs.readFileSync('enhanced_date_matches.json', 'utf8'));
const classifiedData = JSON.parse(fs.readFileSync('birthday_intros_classified.json', 'utf8'));

// 创建小型测试数据（只包含前10个日期）
function createMiniData() {
  console.log('创建小型测试数据...');
  
  // 提取前10个日期
  const miniEnhanced = enhancedData.slice(0, 10);
  const miniClassified = {};
  
  // 提取对应的分类数据
  miniEnhanced.forEach(item => {
    const date = item.主日期;
    if (classifiedData[date]) {
      miniClassified[date] = classifiedData[date];
    }
  });
  
  // 写入小型数据文件
  fs.writeFileSync('mini_enhanced_date_matches.json', JSON.stringify(miniEnhanced, null, 2));
  fs.writeFileSync('mini_birthday_intros_classified.json', JSON.stringify(miniClassified, null, 2));
  
  console.log(`✅ 创建完成:`);
  console.log(`- mini_enhanced_date_matches.json: ${miniEnhanced.length} 条记录`);
  console.log(`- mini_birthday_intros_classified.json: ${Object.keys(miniClassified).length} 条记录`);
  
  // 显示文件大小
  const enhancedSize = fs.statSync('mini_enhanced_date_matches.json').size;
  const classifiedSize = fs.statSync('mini_birthday_intros_classified.json').size;
  
  console.log(`- 增强数据大小: ${(enhancedSize / 1024).toFixed(2)} KB`);
  console.log(`- 分类数据大小: ${(classifiedSize / 1024).toFixed(2)} KB`);
}

createMiniData(); 