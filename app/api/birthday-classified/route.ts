import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('=== 生日介绍API开始执行 ===');
    console.log('当前工作目录:', process.cwd());
    console.log('Node环境:', process.env.NODE_ENV);
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

    // 确保日期格式正确
    if (date && !date.includes('月')) {
      // 如果日期格式不正确，尝试修复
      const monthMatch = date.match(/(\d+)月(\d+)日/);
      if (monthMatch) {
        date = `${monthMatch[1]}月${monthMatch[2]}日`;
        console.log('修复后date参数:', date);
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
            console.log('从URL重新解码date参数:', date);
          }
        } catch (e) {
          console.log('URL重新解码失败');
        }
      }
    }

    if (!date) {
      console.log('date参数为空，返回400错误');
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    console.log('最终使用的date参数:', date);

    // 按优先级尝试读取分类数据
    const dataFiles = [
      // 根目录
      { path: path.join(process.cwd(), 'birthday_intros_classified.json'), name: 'primary_root' },
      { path: path.join(process.cwd(), 'birthday_intros_final.json.backup'), name: 'fallback_root' },
      // public目录
      { path: path.join(process.cwd(), 'public', 'data', 'birthday_intros_classified.json'), name: 'primary_public' },
      { path: path.join(process.cwd(), 'public', 'data', 'birthday_intros_final.json.backup'), name: 'fallback_public' },
      // 相对路径
      { path: './birthday_intros_classified.json', name: 'primary_relative' },
      { path: './birthday_intros_final.json.backup', name: 'fallback_relative' }
    ]
    
    console.log('尝试读取的文件路径:');
    dataFiles.forEach(file => {
      console.log(`- ${file.name}: ${file.path}`);
      console.log(`  文件存在: ${fs.existsSync(file.path)}`);
    });
    
    let filePath = null
    let dataSource = 'none'
    let data = null
    
    // 找到第一个存在的数据文件
    for (const file of dataFiles) {
      console.log('检查文件:', file.path, '存在:', fs.existsSync(file.path));
      if (fs.existsSync(file.path)) {
        filePath = file.path
        dataSource = file.name
        try {
          data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          console.log('成功加载数据文件:', filePath);
          console.log('数据文件大小:', fs.statSync(filePath).size, 'bytes');
          console.log('数据键数量:', Object.keys(data).length);
          break
        } catch (parseError) {
          console.error('解析数据文件失败:', parseError);
          continue
        }
      }
    }
    
    if (!data) {
      console.error('所有分类数据文件都不存在或无法读取');
      
      // 使用备用测试数据
      const fallbackData = {
        "1月1日": {
          "内核": "天生领袖\n勇往直前的\n在理念之路上",
          "恋爱与婚姻": "好胜的你，是典型的大男人或大女人。你不会玩什么小花招，总是用直球对决，遇到喜欢的对象就会展开攻势。",
          "工作与财运": "你拥有无论从事什么行业都能成为领袖的格局。与其听人指挥，不如自己独立工作，更能发光发热。",
          "个性特征": "1月1日出生的人，拥有超群的行动力与执行力，经常位居高层的位阶，是个彻头彻尾的领袖。",
          "成为自己的捷径": "保持你的领导特质，但也要学会倾听他人的意见。",
          "未来的你": "你将成为一位受人尊敬的领导者，在事业上取得巨大成功。",
          "过去的你": "你天生就具备领导才能，从小就展现出与众不同的特质。"
        },
        "1月2日": {
          "内核": "温和的协调者\n善于沟通的\n在和谐之路上",
          "恋爱与婚姻": "你是一个温和的人，在恋爱中会体贴对方，善于沟通。",
          "工作与财运": "你适合需要沟通和协调的工作，能够很好地处理人际关系。",
          "个性特征": "1月2日出生的人，性格温和，善于沟通，是很好的协调者。",
          "成为自己的捷径": "发挥你的沟通优势，但也要学会坚持自己的立场。",
          "未来的你": "你将成为一位优秀的沟通专家，在人际关系方面很有成就。",
          "过去的你": "你从小就展现出温和的性格，善于与人相处。"
        }
      };
      
      // 检查是否有匹配的测试数据
      if ((fallbackData as any)[date]) {
        const birthdayData = (fallbackData as any)[date];
        console.log('使用备用测试数据');
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
            source: 'fallback_test_data',
            note: '使用备用测试数据'
          }
        });
      }
      
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
          filePath: filePath,
          availableDates: Object.keys(data).slice(0, 5) // 显示前5个可用日期
        }
      });
    }
  } catch (error) {
    console.error('Error reading birthday classified data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 