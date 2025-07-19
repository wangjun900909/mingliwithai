import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    // 尝试读取增强版JSON数据
    const enhancedPath = path.join(process.cwd(), 'enhanced_date_matches.json')
    const fallbackPath = path.join(process.cwd(), 'date_matches.json')
    
    let dataPath = enhancedPath
    let dataSource = 'enhanced'
    
    // 如果增强版数据不存在，使用备用数据
    if (!fs.existsSync(enhancedPath)) {
      console.log('增强版数据文件不存在，使用备用数据')
      dataPath = fallbackPath
      dataSource = 'fallback'
      
      if (!fs.existsSync(fallbackPath)) {
        console.error('所有数据文件都不存在')
        return NextResponse.json({ error: '数据文件不存在' }, { status: 404 })
      }
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
    return NextResponse.json({ error: '数据加载失败' }, { status: 500 })
  }
} 