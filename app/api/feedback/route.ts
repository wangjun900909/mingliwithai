import { NextRequest, NextResponse } from 'next/server';

interface FeedbackData {
  messageId: string;
  type: 'positive' | 'negative';
  comment?: string;
  timestamp: string;
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackData = await request.json();
    
    // 验证数据
    if (!body.messageId || !body.type) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 添加时间戳
    const feedbackData: FeedbackData = {
      ...body,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
    };

    // 这里可以集成 MCP Feedback Enhanced 服务
    // 目前先记录到控制台
    console.log('📝 收到用户反馈:', feedbackData);

    // 可以发送到 MCP Feedback Enhanced 服务
    // const mcpResponse = await fetch('mcp-feedback-enhanced-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(feedbackData),
    // });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '反馈已提交',
      data: feedbackData,
    });

  } catch (error) {
    console.error('❌ 处理反馈时出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 获取反馈统计信息
    // 这里可以连接到数据库或 MCP 服务获取统计数据
    
    return NextResponse.json({
      success: true,
      stats: {
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        averageRating: 0,
      },
    });
  } catch (error) {
    console.error('❌ 获取反馈统计时出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 