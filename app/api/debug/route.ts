import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    const cwd = process.cwd()
    const files = [
      'enhanced_date_matches.json',
      'birthday_intros_classified.json',
      'date_matches.json'
    ]
    
    const fileStatus: Record<string, any> = {}
    
    for (const file of files) {
      const filePath = path.join(cwd, file)
      const exists = fs.existsSync(filePath)
      
      if (exists) {
        const stats = fs.statSync(filePath)
        fileStatus[file] = {
          exists: true,
          size: stats.size,
          path: filePath
        }
      } else {
        fileStatus[file] = {
          exists: false,
          path: filePath
        }
      }
    }
    
    // 列出当前目录的文件
    const currentDirFiles = fs.readdirSync(cwd)
    
    return NextResponse.json({
      cwd,
      fileStatus,
      currentDirFiles: currentDirFiles.slice(0, 20), // 只显示前20个文件
      totalFiles: currentDirFiles.length
    })
  } catch (error) {
    console.error('调试信息获取失败:', error)
    return NextResponse.json({ 
      error: '调试信息获取失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 