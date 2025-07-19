import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let date = searchParams.get('date') || '';
    
    // 处理URL编码的日期
    if (date) {
      date = decodeURIComponent(date);
      // 如果解码后缺少月份数字，尝试修复
      if (date.startsWith('月')) {
        // 从URL中提取月份信息
        const url = request.url;
        const monthMatch = url.match(/date=(\d+)月/);
        if (monthMatch) {
          date = monthMatch[1] + date;
        } else {
          // 尝试从编码的URL中提取
          const encodedMonthMatch = url.match(/date=%E6%9C%88(\d+)/);
          if (encodedMonthMatch) {
            date = encodedMonthMatch[1] + date;
          }
        }
      }
    }

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // 读取分类数据
    const filePath = path.join(process.cwd(), 'birthday_intros_classified.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Birthday classified data not found' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
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
        }
      });
    }
  } catch (error) {
    console.error('Error reading birthday classified data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 