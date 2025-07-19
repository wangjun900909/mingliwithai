#!/usr/bin/env node

/**
 * 压缩数据文件，生成可嵌入的格式
 */

const fs = require('fs');
const zlib = require('zlib');

function compressData() {
  console.log('开始压缩数据文件...');
  
  try {
    // 读取原始数据
    const enhancedData = JSON.parse(fs.readFileSync('enhanced_date_matches.json', 'utf8'));
    const classifiedData = JSON.parse(fs.readFileSync('birthday_intros_classified.json', 'utf8'));
    
    // 只压缩增强数据
    const enhancedCompressed = zlib.gzipSync(JSON.stringify(enhancedData));
    const enhancedBase64 = enhancedCompressed.toString('base64');
    
    // 创建简化的分类数据（只包含前50个日期）
    const simplifiedClassified = {};
    const dates = Object.keys(classifiedData).slice(0, 50);
    dates.forEach(date => {
      simplifiedClassified[date] = classifiedData[date];
    });
    
    // 生成嵌入代码
    const embeddedCode = `// 压缩的数据文件 - 自动生成
import * as zlib from 'zlib';

export const COMPRESSED_ENHANCED_DATA = "${enhancedBase64}";

// 简化的分类数据（前50个日期）
export const SIMPLIFIED_CLASSIFIED_DATA = ${JSON.stringify(simplifiedClassified, null, 2)};

// 解压函数
export function decompressData(compressedData: string) {
  const buffer = Buffer.from(compressedData, 'base64');
  const decompressed = zlib.gunzipSync(buffer);
  return JSON.parse(decompressed.toString());
}
`;
    
    // 写入压缩数据文件
    fs.writeFileSync('app/lib/compressed-data.ts', embeddedCode);
    
    console.log('✅ 数据压缩完成:');
    console.log(`- 原始增强数据大小: ${(JSON.stringify(enhancedData).length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- 压缩后大小: ${(enhancedBase64.length / 1024).toFixed(2)} KB`);
    console.log(`- 压缩比: ${((1 - enhancedBase64.length / JSON.stringify(enhancedData).length) * 100).toFixed(1)}%`);
    
    console.log(`- 简化分类数据: ${Object.keys(simplifiedClassified).length} 个日期`);
    console.log(`- 简化分类数据大小: ${(JSON.stringify(simplifiedClassified).length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('压缩数据失败:', error);
  }
}

compressData(); 