import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// 中文数字转换函数
function chineseToNumber(chinese: string): number {
  const chineseNumbers: { [key: string]: number } = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '十一': 11, '十二': 12
  };
  return chineseNumbers[chinese] || parseInt(chinese) || 0;
}

// 日期格式转换函数
function convertDateFormat(date: string): { chineseFormat: string; numberFormat: string } {
  // 如果已经是中文格式，直接返回
  if (date.includes('月') && date.includes('日')) {
    // 从中文格式转换为数字格式
    const monthMatch = date.match(/(.+?)月(.+?)日/);
    if (monthMatch) {
      const month = chineseToNumber(monthMatch[1]);
      const day = chineseToNumber(monthMatch[2]);
      if (month > 0 && day > 0) {
        const numberFormat = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        return { chineseFormat: date, numberFormat };
      }
    }
    return { chineseFormat: date, numberFormat: '' };
  }
  
  // 如果是数字格式，转换为中文格式
  const match = date.match(/(\d{1,2})-(\d{1,2})/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    const chineseFormat = `${month}月${day}日`;
    return { chineseFormat, numberFormat: date };
  }
  
  return { chineseFormat: date, numberFormat: '' };
}

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

    // 转换日期格式
    const { chineseFormat, numberFormat } = convertDateFormat(date);

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
    let fileErrors = []
    
    // 找到第一个存在的数据文件
    for (const file of dataFiles) {
      try {
        if (fs.existsSync(file.path)) {
          filePath = file.path
          dataSource = file.name
          const fileContent = fs.readFileSync(filePath, 'utf8')
          data = JSON.parse(fileContent)
          break
        } else {
          fileErrors.push(`${file.name}: 文件不存在 (${file.path})`)
        }
      } catch (error) {
        fileErrors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`)
        continue
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
          filesChecked: dataFiles.map(f => ({ 
            name: f.name, 
            path: f.path, 
            exists: fs.existsSync(f.path),
            readable: (() => {
              try {
                fs.accessSync(f.path, fs.constants.R_OK)
                return true
              } catch {
                return false
              }
            })()
          })),
          fileErrors: fileErrors,
          cwd: process.cwd(),
          env: process.env.NODE_ENV
        }
      });
    }
    
    // 尝试查找数据，支持两种格式
    let birthdayData = null;
    let foundFormat = '';
    
    // 首先尝试中文格式
    if (data[chineseFormat]) {
      birthdayData = data[chineseFormat];
      foundFormat = 'chinese';
    }
    // 然后尝试数字格式
    else if (numberFormat && data[numberFormat]) {
      birthdayData = data[numberFormat];
      foundFormat = 'number';
    }
    
    if (birthdayData) {
      // 处理转义字符，将 \\n 转换为真正的换行符
      const processText = (text: string) => {
        if (!text) return '';
        return text.replace(/\\n/g, '\n');
      };

      // 返回结构化的数据
      return NextResponse.json({
        date: date,
        found: true,
        data: {
          kernel: processText(birthdayData.内核 || ''),
          love_marriage: processText(birthdayData.恋爱与婚姻 || ''),
          work_finance: processText(birthdayData.工作与财运 || birthdayData.工作财运 || ''),
          personality: processText(birthdayData.个性特征 || ''),
          path_to_self: processText(birthdayData.成为自己的捷径 || birthdayData.生日带来的讯息 || ''),
          future_self: processText(birthdayData.未来的你 || birthdayData.今生使命未来展望 || ''),
          past_self: processText(birthdayData.过去的你 || birthdayData.你的前世 || '')
        },
        _metadata: {
          source: dataSource,
          filePath: filePath,
          foundFormat: foundFormat,
          chineseFormat: chineseFormat,
          numberFormat: numberFormat
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
          foundFormat: foundFormat,
          chineseFormat: chineseFormat,
          numberFormat: numberFormat,
          availableDates: Object.keys(data).slice(0, 5), // 显示前5个可用日期
          totalDates: Object.keys(data).length
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 