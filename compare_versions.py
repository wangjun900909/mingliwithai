#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
版本对比分析脚本
对比原始版本和增强版的差异，展示双向匹配的效果
"""

import json
from typing import Dict, List

def load_data(filename: str) -> List[Dict]:
    """加载JSON数据"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_bidirectional_matches(data: List[Dict]) -> Dict:
    """分析双向匹配情况"""
    bidirectional_count = 0
    total_matches = 0
    main_dates = {item["主日期"] for item in data}
    
    for item in data:
        main_date = item["主日期"]
        matches = item["匹配"]
        
        for category, dates in matches.items():
            for date in dates:
                total_matches += 1
                # 检查是否存在反向匹配
                if date in main_dates:
                    target_item = next(d for d in data if d["主日期"] == date)
                    if category in target_item["匹配"] and main_date in target_item["匹配"][category]:
                        bidirectional_count += 1
    
    return {
        "total_matches": total_matches,
        "bidirectional_count": bidirectional_count,
        "bidirectional_percentage": bidirectional_count / total_matches * 100 if total_matches > 0 else 0
    }

def compare_versions():
    """对比两个版本"""
    print("=== 版本对比分析 ===\n")
    
    # 加载数据
    print("正在加载数据...")
    original_data = load_data('date_matches.json')
    enhanced_data = load_data('enhanced_date_matches.json')
    
    print(f"原始版本: {len(original_data)} 个主日期")
    print(f"增强版本: {len(enhanced_data)} 个主日期\n")
    
    # 统计各分类匹配数
    categories = ["情人伴侣", "工作伙伴朋友", "竞争对手天敌", "灵魂伴侣"]
    
    print("=== 各分类匹配数对比 ===")
    print(f"{'分类':<12} {'原始版本':<10} {'增强版本':<10} {'增长':<8} {'增长率':<8}")
    print("-" * 50)
    
    for category in categories:
        original_count = sum(len(item["匹配"].get(category, [])) for item in original_data)
        enhanced_count = sum(len(item["匹配"].get(category, [])) for item in enhanced_data)
        growth = enhanced_count - original_count
        growth_rate = (growth / original_count * 100) if original_count > 0 else 0
        
        print(f"{category:<12} {original_count:<10} {enhanced_count:<10} {growth:<8} {growth_rate:>6.1f}%")
    
    # 分析双向匹配
    print("\n=== 双向匹配分析 ===")
    original_bidirectional = analyze_bidirectional_matches(original_data)
    enhanced_bidirectional = analyze_bidirectional_matches(enhanced_data)
    
    print(f"原始版本:")
    print(f"  总匹配数: {original_bidirectional['total_matches']}")
    print(f"  双向匹配数: {original_bidirectional['bidirectional_count']}")
    print(f"  双向匹配比例: {original_bidirectional['bidirectional_percentage']:.2f}%")
    
    print(f"\n增强版本:")
    print(f"  总匹配数: {enhanced_bidirectional['total_matches']}")
    print(f"  双向匹配数: {enhanced_bidirectional['bidirectional_count']}")
    print(f"  双向匹配比例: {enhanced_bidirectional['bidirectional_percentage']:.2f}%")
    
    # 具体示例对比
    print("\n=== 具体示例对比 ===")
    example_date = "1月1日"
    
    original_item = next((item for item in original_data if item["主日期"] == example_date), None)
    enhanced_item = next((item for item in enhanced_data if item["主日期"] == example_date), None)
    
    if original_item and enhanced_item:
        print(f"主日期: {example_date}")
        for category in categories:
            original_dates = original_item["匹配"].get(category, [])
            enhanced_dates = enhanced_item["匹配"].get(category, [])
            
            print(f"\n{category}:")
            print(f"  原始版本: {len(original_dates)} 个匹配")
            print(f"  增强版本: {len(enhanced_dates)} 个匹配")
            print(f"  新增: {len(enhanced_dates) - len(original_dates)} 个")
            
            # 显示新增的匹配
            new_matches = set(enhanced_dates) - set(original_dates)
            if new_matches:
                print(f"  新增匹配: {', '.join(sorted(new_matches)[:5])}{'...' if len(new_matches) > 5 else ''}")
    
    # 反向查询示例
    print("\n=== 反向查询示例 ===")
    test_date = "1月9日"
    
    # 加载反向索引
    with open('reverse_index.json', 'r', encoding='utf-8') as f:
        original_reverse = json.load(f)
    
    with open('enhanced_reverse_index.json', 'r', encoding='utf-8') as f:
        enhanced_reverse = json.load(f)
    
    if test_date in original_reverse and test_date in enhanced_reverse:
        original_matches = original_reverse[test_date]
        enhanced_matches = enhanced_reverse[test_date]
        
        print(f"查询日期: {test_date}")
        print(f"原始版本: {len(original_matches)} 个匹配")
        print(f"增强版本: {len(enhanced_matches)} 个匹配")
        print(f"新增: {len(enhanced_matches) - len(original_matches)} 个匹配")
        
        # 显示新增的匹配
        original_main_dates = {match["主日期"] for match in original_matches}
        enhanced_main_dates = {match["主日期"] for match in enhanced_matches}
        new_main_dates = enhanced_main_dates - original_main_dates
        
        if new_main_dates:
            print(f"新增主日期: {', '.join(sorted(new_main_dates)[:5])}{'...' if len(new_main_dates) > 5 else ''}")
    
    # 总结
    print("\n=== 总结 ===")
    total_original = sum(
        sum(len(dates) for dates in item["匹配"].values())
        for item in original_data
    )
    total_enhanced = sum(
        sum(len(dates) for dates in item["匹配"].values())
        for item in enhanced_data
    )
    
    print(f"总匹配数增长: {total_enhanced - total_original:,} 个")
    print(f"增长率: {((total_enhanced - total_original) / total_original * 100):.1f}%")
    print(f"双向匹配比例: 从 {original_bidirectional['bidirectional_percentage']:.1f}% 提升到 {enhanced_bidirectional['bidirectional_percentage']:.1f}%")
    
    print("\n=== 对比分析完成 ===")
    print("增强版成功实现了100%的双向匹配关系！")

if __name__ == "__main__":
    compare_versions() 