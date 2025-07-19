import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// 嵌入小型测试数据，确保基本功能可用
const FALLBACK_CLASSIFIED_DATA: Record<string, any> = {
  "1月1日": {
    "内核": "1月1日出生的人具有强烈的领导能力和创新精神。他们天生就是领导者，喜欢挑战和冒险。",
    "恋爱与婚姻": "在感情方面，1月1日出生的人追求激情和刺激。他们需要一个能够理解他们独立性格的伴侣。",
    "工作与财运": "在事业上，他们适合从事管理、创业或创新领域的工作。财运方面，他们善于投资和理财。",
    "个性特征": "独立、自信、有野心、创新、领导能力强",
    "成为自己的捷径": "学会倾听他人意见，培养耐心和同理心。",
    "未来的你": "将成为一位成功的领导者，在事业和家庭方面都取得平衡。",
    "过去的你": "曾经是一个充满梦想和抱负的年轻人，经历过挫折但从未放弃。"
  },
  "1月2日": {
    "内核": "1月2日出生的人具有敏锐的直觉和深刻的洞察力。他们善于分析问题并找到解决方案。",
    "恋爱与婚姻": "在感情方面，他们追求深度和真诚的关系。需要一个能够理解他们内心世界的伴侣。",
    "工作与财运": "适合从事研究、分析、咨询或教育类工作。财运稳定，善于规划。",
    "个性特征": "智慧、理性、深思熟虑、有洞察力、可靠",
    "成为自己的捷径": "学会表达情感，培养社交技能。",
    "未来的你": "将成为一位受人尊敬的专家或导师。",
    "过去的你": "曾经是一个内向但聪明的孩子，通过努力获得了今天的成就。"
  },
  "1月3日": {
    "内核": "1月3日出生的人具有艺术天赋和创造力。他们善于表达自己，喜欢美和和谐。",
    "恋爱与婚姻": "在感情方面，他们浪漫而感性。需要一个能够欣赏他们艺术气质的伴侣。",
    "工作与财运": "适合从事艺术、设计、媒体或创意类工作。财运起伏较大，但总体不错。",
    "个性特征": "创意、感性、艺术、浪漫、有魅力",
    "成为自己的捷径": "学会务实，培养财务规划能力。",
    "未来的你": "将成为一位成功的艺术家或创意工作者。",
    "过去的你": "曾经是一个充满想象力的孩子，一直在追求美和艺术。"
  }
}

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

    // 按优先级尝试读取分类数据
    const dataFiles = [
      { path: path.join(process.cwd(), 'mini_birthday_intros_classified.json'), name: 'mini_classified' },
      { path: path.join(process.cwd(), 'birthday_intros_classified.json'), name: 'primary' },
      { path: path.join(process.cwd(), 'birthday_intros_final.json.backup'), name: 'fallback' }
    ]
    
    let filePath = null
    let dataSource = 'none'
    let data = null
    
    // 找到第一个存在的数据文件
    for (const file of dataFiles) {
      if (fs.existsSync(file.path)) {
        filePath = file.path
        dataSource = file.name
        data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        break
      }
    }
    
    // 如果所有文件都不存在，使用内置数据
    if (!data) {
      console.log('所有分类数据文件都不存在，使用内置测试数据')
      data = FALLBACK_CLASSIFIED_DATA
      dataSource = 'embedded'
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
          filePath: filePath || 'embedded'
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
          filePath: filePath || 'embedded'
        }
      });
    }
  } catch (error) {
    console.error('Error reading birthday classified data:', error);
    // 出错时也使用内置数据
    const date = new URL(request.url).searchParams.get('date') || '';
    if (FALLBACK_CLASSIFIED_DATA[date]) {
      const birthdayData = FALLBACK_CLASSIFIED_DATA[date];
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
          source: 'embedded_error_fallback',
          error: error instanceof Error ? error.message : '未知错误'
        }
      });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 