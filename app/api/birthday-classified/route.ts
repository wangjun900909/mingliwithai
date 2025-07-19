import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('API调用开始，URL:', request.url);
    const { searchParams } = new URL(request.url);
    let date = searchParams.get('date') || '';
    console.log('原始date参数:', date);
    
    // 处理URL编码的日期
    if (date) {
      try {
        date = decodeURIComponent(date);
        console.log('解码后date参数:', date);
      } catch (e) {
        // 如果解码失败，尝试直接使用
        console.log('URL解码失败，使用原始值:', date);
      }
    }

    if (!date) {
      console.log('date参数为空，返回400错误');
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // 按优先级尝试读取分类数据
    const dataFiles = [
      { path: path.join(process.cwd(), 'birthday_intros_classified.json'), name: 'primary' },
      { path: path.join(process.cwd(), 'birthday_intros_final.json.backup'), name: 'fallback' }
    ]
    
    let filePath = null
    let dataSource = 'none'
    let data = null
    
    // 找到第一个存在的数据文件
    for (const file of dataFiles) {
      console.log('检查文件:', file.path, '存在:', fs.existsSync(file.path));
      if (fs.existsSync(file.path)) {
        filePath = file.path
        dataSource = file.name
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        console.log('成功加载数据文件:', filePath);
        break
      }
    }
    
    if (!data) {
      console.error('所有分类数据文件都不存在');
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
          error: '数据文件不存在'
        }
      });
    }
    
    console.log('查找日期:', date, '在数据中:', date in data);
    if (data[date]) {
      const birthdayData = data[date];
      console.log('找到生日数据');
      
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
      console.log('未找到日期数据');
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
          filePath: filePath
        }
      });
    }
  } catch (error) {
    console.error('Error reading birthday classified data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 