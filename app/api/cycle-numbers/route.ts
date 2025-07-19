import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    // 读取循环数数据文件
    const filePath = path.join(process.cwd(), 'cycle_numbers.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const cycleNumbers = JSON.parse(data);
    
    return NextResponse.json(cycleNumbers);
  } catch (error) {
    console.error('Error loading cycle numbers data:', error);
    return NextResponse.json(
      { error: 'Failed to load cycle numbers data' },
      { status: 500 }
    );
  }
} 