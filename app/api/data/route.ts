import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    console.log('=== 数据API开始执行 ===')
    console.log('当前工作目录:', process.cwd())
    console.log('Node环境:', process.env.NODE_ENV)
    
    // 按优先级尝试读取数据文件
    const dataFiles = [
      { path: path.join(process.cwd(), 'enhanced_date_matches.json'), name: 'enhanced' },
      { path: path.join(process.cwd(), 'date_matches.json'), name: 'fallback' }
    ]
    
    console.log('尝试读取的文件路径:')
    dataFiles.forEach(file => {
      console.log(`- ${file.name}: ${file.path}`)
      console.log(`  文件存在: ${fs.existsSync(file.path)}`)
    })
    
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
      return NextResponse.json({ 
        error: '数据文件不存在',
        debug: {
          cwd: process.cwd(),
          nodeEnv: process.env.NODE_ENV,
          files: dataFiles.map(f => ({ name: f.name, path: f.path, exists: fs.existsSync(f.path) }))
        }
      }, { status: 404 })
    }
    
    console.log(`读取文件: ${dataPath}`)
    const data = fs.readFileSync(dataPath, 'utf-8')
    console.log(`文件大小: ${data.length} 字符`)
    
    const jsonData = JSON.parse(data)
    console.log(`JSON解析成功，数据类型: ${typeof jsonData}`)
    
    // 如果数据是数组格式，转换为对象格式
    let matches: Record<string, any> = {}
    if (Array.isArray(jsonData)) {
      console.log('数据是数组格式，转换为对象')
      jsonData.forEach((item: any) => {
        if (item.主日期 && item.匹配) {
          matches[item.主日期] = item.匹配
        }
      })
    } else if (jsonData.matches) {
      console.log('数据包含matches字段')
      matches = jsonData.matches
    } else {
      console.log('使用原始数据')
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
    return NextResponse.json({ 
      error: '数据加载失败',
      message: error instanceof Error ? error.message : '未知错误',
      debug: {
        cwd: process.cwd(),
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
} 