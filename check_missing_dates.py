#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查缺失的生日日期
"""

import json

def check_missing_dates():
    """检查缺失的日期"""
    # 读取当前数据
    with open('birthday_intros_final.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"当前生日数量: {len(data)}")
    
    # 生成所有可能的日期
    all_dates = set()
    months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    days = list(range(1, 32))
    
    for month in months:
        for day in days:
            # 处理2月
            if month == '2月' and day > 29:
                continue
            # 处理30天的月份
            if month in ['4月', '6月', '9月', '11月'] and day > 30:
                continue
            all_dates.add(f'{month}{day}日')
    
    existing_dates = set(data.keys())
    missing_dates = all_dates - existing_dates
    
    print(f"\n缺失 {len(missing_dates)} 个日期:")
    for date in sorted(missing_dates):
        print(f"  {date}")
    
    print(f"\n总计: {len(all_dates)} 个可能的日期")
    print(f"现有: {len(existing_dates)} 个日期")
    print(f"缺失: {len(missing_dates)} 个日期")
    
    return missing_dates

if __name__ == "__main__":
    check_missing_dates() 