import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let date = searchParams.get('date') || '';
    
    // 处理URL编码的日期
    if (date) {
      try {
        date = decodeURIComponent(date);
      } catch (e) {
        // 如果解码失败，尝试直接使用
      }
    }

    // 确保日期格式正确
    if (date && !date.includes('月')) {
      // 如果日期格式不正确，尝试修复
      const monthMatch = date.match(/(\d+)月(\d+)日/);
      if (monthMatch) {
        date = `${monthMatch[1]}月${monthMatch[2]}日`;
      }
    }

    // 如果日期仍然不正确，尝试从URL中提取
    if (date && !date.includes('月')) {
      const url = request.url;
      const dateMatch = url.match(/date=([^&]+)/);
      if (dateMatch) {
        try {
          const decodedDate = decodeURIComponent(dateMatch[1]);
          if (decodedDate.includes('月')) {
            date = decodedDate;
          }
        } catch (e) {
          // URL重新解码失败
        }
      }
    }

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // 按优先级尝试读取分类数据
    const dataFiles = [
      // 根目录
      { path: path.join(process.cwd(), 'birthday_intros_classified.json'), name: 'primary_root' },
      // public目录
      { path: path.join(process.cwd(), 'public', 'data', 'birthday_intros_classified.json'), name: 'primary_public' },
      // 相对路径
      { path: './birthday_intros_classified.json', name: 'primary_relative' }
    ]
    
    let filePath = null
    let dataSource = 'none'
    let data = null
    
    // 找到第一个存在的数据文件
    for (const file of dataFiles) {
      if (fs.existsSync(file.path)) {
        filePath = file.path
        dataSource = file.name
        try {
          data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          break
        } catch (parseError) {
          continue
        }
      }
    }
    
    if (!data) {
      return NextResponse.json({ 
        date: date,
        found: false,
        data: {
          kernel: '',
          love_marriage: '',
          work_finance: '',
          personality: '',
          path_to_self: '',
          future_self: '',
          past_self: ''
        },
        _metadata: {
          source: 'none',
          error: '数据文件不存在或无法读取',
          filesChecked: dataFiles.map(f => ({ name: f.name, path: f.path, exists: fs.existsSync(f.path) }))
        }
      });
    }
    
    if (data[date]) {
      const birthdayData = data[date];
      
      // 返回结构化的数据
      return NextResponse.json({
        date: date,
        found: true,
        data: {
          kernel: birthdayData.内核 || '',
          love_marriage: birthdayData.恋爱与婚姻 || '',
          work_finance: birthdayData.工作与财运 || '',
          personality: birthdayData.个性特征 || '',
          path_to_self: birthdayData.成为自己的捷径 || '',
          future_self: birthdayData.未来的你 || '',
          past_self: birthdayData.过去的你 || ''
        },
        _metadata: {
          source: dataSource,
          filePath: filePath
        }
      });
    } else {
      return NextResponse.json({ 
        date: date,
        found: false,
        data: {
          kernel: '',
          love_marriage: '',
          work_finance: '',
          personality: '',
          path_to_self: '',
          future_self: '',
          past_self: ''
        },
        _metadata: {
          source: dataSource,
          filePath: filePath,
          availableDates: Object.keys(data).slice(0, 5) // 显示前5个可用日期
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 