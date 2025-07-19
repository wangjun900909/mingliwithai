import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { COMPRESSED_ENHANCED_DATA, decompressData } from '../../lib/compressed-data'

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
      console.log('所有数据文件都不存在，使用压缩的完整数据')
      const jsonData = decompressData(COMPRESSED_ENHANCED_DATA)
      return NextResponse.json({
        ...jsonData,
        _metadata: {
          source: 'compressed_embedded',
          message: '使用压缩的完整数据'
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
    console.log('使用压缩数据作为备用')
    try {
      const jsonData = decompressData(COMPRESSED_ENHANCED_DATA)
      return NextResponse.json({
        ...jsonData,
        _metadata: {
          source: 'compressed_fallback',
          error: error instanceof Error ? error.message : '未知错误'
        }
      })
    } catch (decompressError) {
      console.error('解压数据也失败:', decompressError)
      return NextResponse.json({ error: '数据加载失败' }, { status: 500 })
    }
  }
} 