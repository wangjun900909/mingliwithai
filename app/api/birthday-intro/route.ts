import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // 读取分类数据
    const filePath = path.join(process.cwd(), 'birthday_intros_classified.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Birthday data not found' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data[date]) {
      return NextResponse.json({
        date: date,
        intro: data[date],
        found: true
      });
    } else {
      return NextResponse.json({ 
        date: date,
        intro: '',
        found: false 
      });
    }
  } catch (error) {
    console.error('Error reading birthday data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 