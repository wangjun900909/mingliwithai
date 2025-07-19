import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 知识库文件路径
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');
const BIRTHDAY_INTROS_FILE = path.join(KNOWLEDGE_BASE_DIR, 'birthday_intros.json');
const DATE_MATCHES_FILE = path.join(KNOWLEDGE_BASE_DIR, 'date_matches.json');
const ENHANCED_DATE_MATCHES_FILE = path.join(KNOWLEDGE_BASE_DIR, 'enhanced_date_matches.json');

// MCP服务配置 - 直接使用MCP SDK
const MCP_SERVICES = {
  auto: [
    { url: "https://yuanbao-production.up.railway.app", type: "yuanbao" },
    { url: "https://deepseek-production-c479.up.railway.app", type: "deepseek" },
    { url: "https://doubao-production-53b8.up.railway.app", type: "doubao" }
  ],
  deepseek: [{ url: "https://deepseek-production-c479.up.railway.app", type: "deepseek" }],
  yuanbao: [{ url: "https://yuanbao-production.up.railway.app", type: "yuanbao" }],
  doubao: [{ url: "https://doubao-production-53b8.up.railway.app", type: "doubao" }]
};

interface UserInfo {
  mbti?: string;
  gender?: string;
  profession?: string;
  status?: string;
  age?: string;
  maritalStatus?: string;
  hasChildren?: string;
  birthday?: any;
}

interface Message {
  role: string;
  content: string;
}

// 从知识库获取生日介绍数据
function getBirthdayIntroFromKnowledgeBase(date: string) {
  try {
    if (!fs.existsSync(BIRTHDAY_INTROS_FILE)) {
      console.log('知识库生日介绍文件不存在，尝试从原始文件获取');
      const originalFile = path.join(process.cwd(), 'birthday_intros_classified.json');
      if (fs.existsSync(originalFile)) {
        const data = JSON.parse(fs.readFileSync(originalFile, 'utf8'));
        return data[date] || null;
      }
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(BIRTHDAY_INTROS_FILE, 'utf8'));
    return data[date] || null;
  } catch (error) {
    console.error('读取生日介绍数据失败:', error);
    return null;
  }
}

// 从知识库获取生日匹配数据
function getDateMatchesFromKnowledgeBase(date: string) {
  try {
    // 优先使用增强版数据
    if (fs.existsSync(ENHANCED_DATE_MATCHES_FILE)) {
      console.log('使用增强版生日匹配数据');
      const data = JSON.parse(fs.readFileSync(ENHANCED_DATE_MATCHES_FILE, 'utf8'));
      const match = data.find((item: any) => item.主日期 === date);
      return match?.匹配 || null;
    }
    
    // 回退到标准版数据
    if (fs.existsSync(DATE_MATCHES_FILE)) {
      console.log('使用标准版生日匹配数据');
      const data = JSON.parse(fs.readFileSync(DATE_MATCHES_FILE, 'utf8'));
      const match = data.find((item: any) => item.主日期 === date);
      return match?.匹配 || null;
    }
    
    // 最后尝试从原始文件获取
    console.log('知识库生日匹配文件不存在，尝试从原始文件获取');
    const enhancedFile = path.join(process.cwd(), 'enhanced_date_matches.json');
    const standardFile = path.join(process.cwd(), 'date_matches.json');
    
    if (fs.existsSync(enhancedFile)) {
      console.log('从原始增强版文件获取数据');
      const data = JSON.parse(fs.readFileSync(enhancedFile, 'utf8'));
      const match = data.find((item: any) => item.主日期 === date);
      return match?.匹配 || null;
    }
    
    if (fs.existsSync(standardFile)) {
      console.log('从原始标准版文件获取数据');
      const data = JSON.parse(fs.readFileSync(standardFile, 'utf8'));
      const match = data.find((item: any) => item.主日期 === date);
      return match?.匹配 || null;
    }
    
    return null;
  } catch (error) {
    console.error('读取生日匹配数据失败:', error);
    return null;
  }
}

// 格式化生日介绍数据
function formatBirthdayIntro(intro: any): string {
  if (!intro) return '';
  
  let formatted = '生日介绍：\n';
  Object.entries(intro).forEach(([key, value]) => {
    formatted += `${key}：${value}\n\n`;
  });
  return formatted;
}

// 格式化生日匹配数据
function formatDateMatches(matches: any): string {
  if (!matches) return '';
  
  let formatted = '相关生日匹配：\n';
  Object.entries(matches).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      formatted += `${key}：${value.join('、')}\n`;
    } else {
      formatted += `${key}：${value}\n`;
    }
  });
  return formatted;
}

// 使用官方API调用DeepSeek服务
async function tryDeepSeekService(serviceUrl: string, userContext: string) {
  try {
    console.log(`尝试调用DeepSeek服务: ${serviceUrl}`);
    
    // 直接使用DeepSeek官方API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-1234567890abcdef' // 需要真实的API密钥
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: userContext
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    console.log(`DeepSeek服务响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek服务HTTP错误: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`DeepSeek服务响应数据:`, data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return { 
        success: true, 
        data: { final_result: data.choices[0].message.content }, 
        serviceUrl 
      };
    } else {
      throw new Error('DeepSeek服务返回格式错误');
    }
  } catch (error) {
    console.error(`DeepSeek服务调用失败:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误', 
      serviceUrl 
    };
  }
}

// 使用官方API调用豆包AI服务
async function tryDoubaoService(serviceUrl: string, userContext: string) {
  try {
    console.log(`尝试调用豆包AI服务: ${serviceUrl}`);
    
    // 直接使用豆包官方API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 6397d7fc-8c2a-4f09-97c6-cbef59557aa7'
      },
      body: JSON.stringify({
        model: 'doubao-1-5-pro-32k-character-250228',
        messages: [
          {
            role: 'user',
            content: userContext
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });
    
    console.log(`豆包AI服务响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`豆包AI服务HTTP错误: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`豆包AI服务响应数据:`, data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return { 
        success: true, 
        data: { final_result: data.choices[0].message.content }, 
        serviceUrl 
      };
    } else {
      throw new Error('豆包AI服务返回格式错误');
    }
  } catch (error) {
    console.error(`豆包AI服务调用失败:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误', 
      serviceUrl 
    };
  }
}

// 尝试调用元宝AI服务
async function tryYuanbaoService(serviceUrl: string, userContext: string) {
  try {
    console.log(`尝试调用元宝AI服务: ${serviceUrl}`);
    
    // 使用AbortController进行更好的超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45秒超时
    
    const response = await fetch(`${serviceUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Chat-App/1.0)',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        input: userContext,
        custom_prompt: "请基于用户信息提供个性化的建议和分析，用友好的语气回答。请确保回答详细、实用且结构清晰。"
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`元宝AI服务响应状态: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`元宝AI服务HTTP错误: ${response.status} - ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`元宝AI服务响应数据:`, data);
    
    if (data.success && data.data && data.data.response) {
      // 解析元宝AI的响应格式
      let responseText = '';
      try {
        // 首先尝试解析为JSON
        const responseData = JSON.parse(data.data.response);
        
        // 检查是否是数组格式（多个消息片段）
        if (Array.isArray(responseData)) {
          // 提取所有msg字段并拼接
          responseText = responseData
            .filter((item: any) => item && item.msg)
            .map((item: any) => item.msg)
            .join('');
        } else if (responseData.msg) {
          // 单个消息对象
          responseText = responseData.msg;
        } else {
          // 其他格式，尝试提取所有msg字段
          const messages: string[] = [];
          const extractMessages = (obj: any) => {
            if (obj && typeof obj === 'object') {
              if (obj.msg) {
                messages.push(obj.msg);
              }
              Object.values(obj).forEach(value => {
                if (typeof value === 'object' && value !== null) {
                  extractMessages(value);
                }
              });
            }
          };
          extractMessages(responseData);
          responseText = messages.join('');
        }
        
        // 如果解析后仍然为空，使用原始响应
        if (!responseText.trim()) {
          responseText = data.data.response;
        }
        
      } catch (parseError) {
        // 如果JSON解析失败，直接使用原始响应
        console.log('JSON解析失败，使用原始响应:', parseError);
        responseText = data.data.response;
      }
      
      // 清理响应文本，移除多余的JSON标记
      responseText = responseText
        .replace(/\{"type":\s*"text"\}/g, '') // 移除 {"type": "text"}
        .replace(/\{"type":\s*"text",\s*"msg":\s*"/g, '') // 移除 {"type": "text", "msg": "
        .replace(/"\}/g, '') // 移除 "}
        .replace(/\\n/g, '\n') // 转换换行符
        .replace(/\\"/g, '"') // 转换引号
        .replace(/\{"type":\s*"tips".*?\}/g, '') // 移除tips元数据
        .replace(/\{"type":\s*"meta".*?\}/g, '') // 移除meta元数据
        .trim();
      
      console.log('解析后的响应文本长度:', responseText.length);
      
      return { success: true, data: { final_result: responseText }, serviceUrl };
    } else {
      throw new Error(data.error || '服务返回错误');
    }
  } catch (error) {
    console.error(`元宝AI服务 ${serviceUrl} 调用失败:`, error);
    
    // 如果是超时错误，提供更友好的错误信息
    if (error instanceof Error && error.name === 'AbortError') {
      return { 
        success: false, 
        error: '元宝AI服务响应超时，请稍后重试', 
        serviceUrl 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误', 
      serviceUrl 
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userInfo, aiService = 'auto' }: { messages: Message[], userInfo: UserInfo, aiService?: string } = await req.json();
    
    console.log('收到AI聊天请求:', { aiService, userInfo: { mbti: userInfo.mbti, birthday: userInfo.birthday?.date } });
    
    // 验证输入
    if (!messages || !userInfo) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 获取要尝试的服务列表
    const servicesToTry = MCP_SERVICES[aiService as keyof typeof MCP_SERVICES] || MCP_SERVICES.auto;
    console.log('要尝试的服务:', servicesToTry);
    
    // 获取生日数据
    let birthdayIntro = '';
    let dateMatches = '';
    
    if (userInfo.birthday?.date) {
      const birthdayDate = userInfo.birthday.date;
      console.log('获取生日数据:', birthdayDate);
      
      // 获取生日介绍数据
      const introData = getBirthdayIntroFromKnowledgeBase(birthdayDate);
      if (introData) {
        birthdayIntro = formatBirthdayIntro(introData);
        console.log('已获取生日介绍数据');
      }
      
      // 获取生日匹配数据
      const matchesData = getDateMatchesFromKnowledgeBase(birthdayDate);
      if (matchesData) {
        dateMatches = formatDateMatches(matchesData);
        console.log('已获取生日匹配数据');
      }
    }
    
    // 构建用户上下文信息
    const userContext = `
用户信息：
- MBTI: ${userInfo.mbti || '未填写'}
- 性别: ${userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : '其他'}
- 年龄: ${userInfo.age || '未填写'}岁
- 婚姻状况: ${(() => {
  const statusMap: Record<string, string> = {
    'single': '单身',
    'married': '已婚',
    'divorced': '离异',
    'widowed': '丧偶',
    'other': '其他'
  };
  return statusMap[userInfo.maritalStatus || ''] || '未填写';
})()}
- 子女情况: ${(() => {
  const childrenMap: Record<string, string> = {
    'none': '无子女',
    'one': '1个孩子',
    'two': '2个孩子',
    'three': '3个孩子',
    'more': '3个以上孩子'
  };
  return childrenMap[userInfo.hasChildren || ''] || '未填写';
})()}
- 职业: ${userInfo.profession || '未填写'}
- 当前状态: ${userInfo.status || '未填写'}
- 生日: ${userInfo.birthday?.date || '未选择'}

${birthdayIntro}

${dateMatches}

对话历史：
${messages.map((msg: Message) => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`).join('\n')}

请基于以上信息，为用户提供个性化的建议和分析。重点关注：
1. 基于生日和MBTI的性格分析
2. 职业发展建议（考虑年龄和婚姻状况）
3. 人际关系指导（考虑家庭状况）
4. 个人成长建议（考虑人生阶段）
5. 家庭生活建议（如果已婚或有子女）
6. 工作与家庭平衡（如果已婚或有子女）
7. 情感匹配分析（基于生日和性格的伴侣建议）
8. 身心灵健康指导（结合年龄和人生阶段的建议）
9. 名人榜样分析（同年龄段名人的成功经验）
10. 能量获取指导（基于性格和年龄的能量来源建议）

请结合生日介绍和相关生日匹配信息，提供更精准的个性化分析。
    `.trim();
    
    // 尝试调用服务
    const results = await Promise.allSettled(
      servicesToTry.map(service => {
        if (service.type === 'deepseek') {
          return tryDeepSeekService(service.url, userContext);
        } else if (service.type === 'yuanbao') {
          return tryYuanbaoService(service.url, userContext);
        } else if (service.type === 'doubao') {
          return tryDoubaoService(service.url, userContext);
        } else {
          // 默认使用元宝AI服务
          return tryYuanbaoService(service.url, userContext);
        }
      })
    );
    
    console.log('所有服务调用结果:', results);
    
    // 查找成功的响应
    let successfulResponse = null;
    let usedService = '';
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        successfulResponse = result.value.data;
        usedService = result.value.serviceUrl;
        console.log('找到成功的服务:', usedService);
        break;
      }
    }
    
    if (successfulResponse) {
      // 处理成功的响应
      if (successfulResponse.final_result) {
        console.log('返回AI响应:', successfulResponse.final_result.substring(0, 100) + '...');
        return NextResponse.json({ 
          response: successfulResponse.final_result,
          service: usedService
        });
      } else {
        // 提供默认回复
        console.log('使用默认回复');
        return NextResponse.json({ 
          response: generateDefaultResponse(userInfo),
          service: usedService
        });
      }
    } else {
      // 所有服务都失败了，提供友好的错误回复
      console.error('所有AI服务都不可用');
      return NextResponse.json({ 
        response: generateFallbackResponse(userInfo)
      });
    }
    
  } catch (error) {
    console.error('API处理错误:', error);
    return NextResponse.json({ 
      response: generateFallbackResponse({})
    });
  }
}

// 生成默认回复
function generateDefaultResponse(userInfo: UserInfo) {
  const ageInfo = userInfo.age ? `年龄: ${userInfo.age}岁` : '';
  const maritalInfo = userInfo.maritalStatus ? `婚姻状况: ${(() => {
    const statusMap: Record<string, string> = {
      'single': '单身',
      'married': '已婚',
      'divorced': '离异',
      'widowed': '丧偶',
      'other': '其他'
    };
    return statusMap[userInfo.maritalStatus || ''] || '';
  })()}` : '';
  const childrenInfo = userInfo.hasChildren ? `子女情况: ${(() => {
    const childrenMap: Record<string, string> = {
      'none': '无子女',
      'one': '1个孩子',
      'two': '2个孩子',
      'three': '3个孩子',
      'more': '3个以上孩子'
    };
    return childrenMap[userInfo.hasChildren || ''] || '';
  })()}` : '';
  
  return `基于您的信息（MBTI: ${userInfo.mbti || '未填写'}, 生日: ${userInfo.birthday?.date || '未选择'}${ageInfo ? `, ${ageInfo}` : ''}${maritalInfo ? `, ${maritalInfo}` : ''}${childrenInfo ? `, ${childrenInfo}` : ''}），我建议您：

1. 性格分析：请填写完整的MBTI类型以获得更准确的分析
2. 职业发展：考虑您的兴趣和技能，寻找适合的职业方向
3. 人际关系：基于您的性格特点，改善与他人的沟通方式
4. 个人成长：设定明确的目标，持续学习和提升
${userInfo.maritalStatus === 'married' ? '5. 家庭生活：平衡工作与家庭，关注家庭关系' : ''}
${userInfo.hasChildren && userInfo.hasChildren !== 'none' ? '6. 子女教育：关注子女成长，建立良好的亲子关系' : ''}

如需更详细的分析，请提供更多个人信息。`;
}

// 生成备用回复
function generateFallbackResponse(userInfo: UserInfo) {
  return `抱歉，AI服务暂时不可用，请稍后重试。

建议：
1. 完善个人信息以获得更准确的分析
2. 考虑您的兴趣和技能选择职业
3. 关注个人成长和人际关系
4. 设定明确的目标并持续努力

请稍后再试，或联系技术支持。`;
} 