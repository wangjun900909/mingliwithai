#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
日期匹配数据使用示例
展示如何使用提取的JSON数据进行各种查询和分析
"""

import json
from typing import Dict, List

def load_data():
    """加载提取的数据"""
    with open('date_matches.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def load_reverse_index():
    """加载反向索引"""
    with open('reverse_index.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def search_by_main_date(main_date: str, data: List[Dict]) -> Dict:
    """根据主日期查询匹配信息"""
    for item in data:
        if item["主日期"] == main_date:
            return item
    return None

def search_by_match_date(match_date: str, reverse_index: Dict) -> List[Dict]:
    """根据匹配日期查询其在哪些主日期中出现"""
    return reverse_index.get(match_date, [])

def get_category_stats(data: List[Dict]) -> Dict[str, int]:
    """获取各分类的统计信息"""
    stats = {}
    for item in data:
        matches = item["匹配"]
        for category, dates in matches.items():
            if category not in stats:
                stats[category] = 0
            stats[category] += len(dates)
    return stats

def find_most_matches(data: List[Dict]) -> Dict:
    """找出匹配最多的主日期"""
    max_matches = 0
    max_item = None
    
    for item in data:
        total_matches = sum(len(dates) for dates in item["匹配"].values())
        if total_matches > max_matches:
            max_matches = total_matches
            max_item = item
    
    return max_item

def analyze_date_distribution(data: List[Dict]) -> Dict[str, int]:
    """分析日期分布（按月份）"""
    month_distribution = {}
    
    for item in data:
        matches = item["匹配"]
        for category, dates in matches.items():
            for date in dates:
                month = date.split('月')[0] + '月'
                if month not in month_distribution:
                    month_distribution[month] = 0
                month_distribution[month] += 1
    
    return month_distribution

def main():
    """主函数 - 演示各种查询功能"""
    print("=== 日期匹配数据使用示例 ===\n")
    
    # 加载数据
    print("正在加载数据...")
    data = load_data()
    reverse_index = load_reverse_index()
    print(f"✓ 成功加载 {len(data)} 个主日期的数据\n")
    
    # 示例1：查询特定主日期的匹配信息
    print("示例1：查询主日期 '1月1日' 的匹配信息")
    result = search_by_main_date("1月1日", data)
    if result:
        print(f"主日期: {result['主日期']}")
        for category, dates in result['匹配'].items():
            if dates:
                print(f"  {category}: {', '.join(dates[:5])}{'...' if len(dates) > 5 else ''}")
    print()
    
    # 示例2：查询特定匹配日期在哪些主日期中出现
    print("示例2：查询 '1月9日' 在哪些主日期中出现")
    matches = search_by_match_date("1月9日", reverse_index)
    if matches:
        print(f"'1月9日' 在以下主日期中出现：")
        for match in matches[:5]:  # 只显示前5个
            print(f"  {match['主日期']} - {match['分类']}")
        if len(matches) > 5:
            print(f"  ... 还有 {len(matches) - 5} 个匹配")
    print()
    
    # 示例3：获取各分类统计信息
    print("示例3：各分类匹配统计")
    stats = get_category_stats(data)
    for category, count in stats.items():
        print(f"  {category}: {count} 个匹配")
    print()
    
    # 示例4：找出匹配最多的主日期
    print("示例4：匹配最多的主日期")
    max_item = find_most_matches(data)
    if max_item:
        total_matches = sum(len(dates) for dates in max_item["匹配"].values())
        print(f"匹配最多的主日期: {max_item['主日期']} ({total_matches} 个匹配)")
        for category, dates in max_item['匹配'].items():
            if dates:
                print(f"  {category}: {len(dates)} 个匹配")
    print()
    
    # 示例5：分析日期分布
    print("示例5：按月份分析日期分布（前10个月）")
    distribution = analyze_date_distribution(data)
    sorted_months = sorted(distribution.items(), key=lambda x: int(x[0].split('月')[0]))
    for month, count in sorted_months[:10]:
        print(f"  {month}: {count} 个匹配")
    print()
    
    # 示例6：高级查询 - 查找特定分类的匹配
    print("示例6：查找所有主日期中的'灵魂伴侣'匹配")
    soul_matches = []
    for item in data:
        if "灵魂伴侣" in item["匹配"] and item["匹配"]["灵魂伴侣"]:
            soul_matches.append({
                "主日期": item["主日期"],
                "匹配": item["匹配"]["灵魂伴侣"]
            })
    
    print(f"找到 {len(soul_matches)} 个主日期有'灵魂伴侣'匹配")
    for match in soul_matches[:3]:  # 只显示前3个
        print(f"  {match['主日期']}: {', '.join(match['匹配'][:3])}{'...' if len(match['匹配']) > 3 else ''}")
    print()
    
    print("=== 示例演示完成 ===")
    print("这些示例展示了如何使用提取的数据进行各种查询和分析。")
    print("您可以根据具体需求修改和扩展这些功能。")

if __name__ == "__main__":
    main() 