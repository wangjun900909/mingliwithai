import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const debugInfo: any = {
      nodeEnv: process.env.NODE_ENV,
      mongodbUri: process.env.MONGODB_URI ? '已设置' : '未设置',
      mongodbUriLength: process.env.MONGODB_URI?.length || 0,
      timestamp: new Date().toISOString()
    };

    // 尝试连接MongoDB
    if (process.env.MONGODB_URI) {
      try {
        const client = new MongoClient(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
        });
        
        await client.connect();
        debugInfo.mongodbConnection = '成功';
        await client.close();
      } catch (error) {
        debugInfo.mongodbConnection = '失败';
        debugInfo.mongodbError = error instanceof Error ? error.message : String(error);
      }
    } else {
      debugInfo.mongodbConnection = '跳过（无URI）';
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: '调试失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 