import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// 嵌入小型测试数据，确保基本功能可用
const FALLBACK_DATA = [
  {
    "主日期": "1月1日",
    "匹配": {
      "情人伴侣": ["1月1日", "2月2日", "3月3日"],
      "工作伙伴朋友": ["4月4日", "5月5日", "6月6日"],
      "竞争对手天敌": ["7月7日", "8月8日"],
      "灵魂伴侣": ["9月9日", "10月10日"]
    }
  },
  {
    "主日期": "1月2日",
    "匹配": {
      "情人伴侣": ["2月1日", "3月2日"],
      "工作伙伴朋友": ["4月1日", "5月2日"],
      "竞争对手天敌": ["6月1日"],
      "灵魂伴侣": ["7月1日", "8月2日"]
    }
  },
  {
    "主日期": "1月3日",
    "匹配": {
      "情人伴侣": ["2月3日", "3月1日"],
      "工作伙伴朋友": ["4月2日", "5月3日"],
      "竞争对手天敌": ["6月2日"],
      "灵魂伴侣": ["7月2日", "8月3日"]
    }
  }
]

export async function GET() {
  try {
    // 按优先级尝试读取数据文件
    const dataFiles = [
      { path: path.join(process.cwd(), 'mini_enhanced_date_matches.json'), name: 'mini_enhanced' },
      { path: path.join(process.cwd(), 'enhanced_date_matches.json'), name: 'enhanced' },
      { path: path.join(process.cwd(), 'date_matches.json'), name: 'fallback' }
    ]
    
    let dataPath = null
    let dataSource = 'none'
    
    // 找到第一个存在的数据文件
    for (const file of dataFiles) {
      if (fs.existsSync(file.path)) {
        dataPath = file.path
        dataSource = file.name
        break
      }
    }
    
    if (!dataPath) {
      console.log('所有数据文件都不存在，使用内置测试数据')
      return NextResponse.json({
        ...FALLBACK_DATA,
        _metadata: {
          source: 'embedded',
          message: '使用内置测试数据'
        }
      })
    }
    
    const data = fs.readFileSync(dataPath, 'utf-8')
    const jsonData = JSON.parse(data)
    
    console.log(`成功加载数据，来源: ${dataSource}`)
    
    return NextResponse.json({
      ...jsonData,
      _metadata: {
        source: dataSource,
        filePath: dataPath
      }
    })
  } catch (error) {
    console.error('读取数据失败:', error)
    console.log('使用内置测试数据作为备用')
    return NextResponse.json({
      ...FALLBACK_DATA,
      _metadata: {
        source: 'embedded_fallback',
        error: error instanceof Error ? error.message : '未知错误'
      }
    })
  }
} 