import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    // 读取增强版JSON数据
    const dataPath = path.join(process.cwd(), 'enhanced_date_matches.json')
    const data = fs.readFileSync(dataPath, 'utf-8')
    const jsonData = JSON.parse(data)
    
    return NextResponse.json(jsonData)
  } catch (error) {
    console.error('读取数据失败:', error)
    return NextResponse.json({ error: '数据加载失败' }, { status: 500 })
  }
} 