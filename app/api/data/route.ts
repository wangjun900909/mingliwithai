import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    // 按优先级尝试读取数据文件
    const dataFiles = [
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
      console.error('所有数据文件都不存在')
      return NextResponse.json({ error: '数据文件不存在' }, { status: 404 })
    }
    
    const data = fs.readFileSync(dataPath, 'utf-8')
    const jsonData = JSON.parse(data)
    
    // 如果数据是数组格式，转换为对象格式
    let matches: Record<string, any> = {}
    if (Array.isArray(jsonData)) {
      jsonData.forEach((item: any) => {
        if (item.主日期 && item.匹配) {
          matches[item.主日期] = item.匹配
        }
      })
    } else if (jsonData.matches) {
      matches = jsonData.matches
    } else {
      matches = jsonData
    }
    
    console.log(`成功加载数据，来源: ${dataSource}, 匹配数量: ${Object.keys(matches).length}`)
    
    return NextResponse.json({
      matches: matches,
      _metadata: {
        source: dataSource,
        filePath: dataPath,
        matchCount: Object.keys(matches).length
      }
    })
  } catch (error) {
    console.error('读取数据失败:', error)
    return NextResponse.json({ error: '数据加载失败' }, { status: 500 })
  }
} 