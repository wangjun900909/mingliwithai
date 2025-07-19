import json

# 标准栏目列表
STANDARD_COLUMNS = [
    "内核", "恋爱与婚姻", "工作与财运", "个性特征", 
    "成为自己的捷径", "未来的你", "过去的你", "生日名人"
]

def check_birthday_data():
    """检查生日数据的完整性和正确性"""
    
    # 读取JSON文件
    with open('birthday_intros_classified.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("🔍 开始检查生日数据完整性...")
    print("=" * 60)
    
    # 统计信息
    total_dates = len(data)
    complete_dates = 0
    incomplete_dates = []
    empty_dates = []
    
    # 检查每个日期
    for date, content in data.items():
        print(f"\n📅 检查: {date}")
        
        # 检查栏目数量
        columns = list(content.keys())
        missing_columns = [col for col in STANDARD_COLUMNS if col not in columns]
        extra_columns = [col for col in columns if col not in STANDARD_COLUMNS]
        
        # 检查内容是否为空
        empty_columns = []
        for col in STANDARD_COLUMNS:
            if col in content and content[col].strip() == "":
                empty_columns.append(col)
        
        # 输出检查结果
        if missing_columns:
            print(f"  ❌ 缺失栏目: {missing_columns}")
        
        if extra_columns:
            print(f"  ⚠️  多余栏目: {extra_columns}")
        
        if empty_columns:
            print(f"  ⚠️  空内容栏目: {empty_columns}")
        
        if not missing_columns and not empty_columns:
            print(f"  ✅ 栏目完整，内容齐全")
            complete_dates += 1
        else:
            incomplete_dates.append(date)
            if len(empty_columns) == len(STANDARD_COLUMNS):
                empty_dates.append(date)
    
    # 输出统计结果
    print("\n" + "=" * 60)
    print("📊 检查结果统计:")
    print(f"总日期数: {total_dates}")
    print(f"完整日期数: {complete_dates}")
    print(f"不完整日期数: {len(incomplete_dates)}")
    print(f"完全空内容日期数: {len(empty_dates)}")
    
    if incomplete_dates:
        print(f"\n❌ 不完整的日期: {incomplete_dates[:10]}{'...' if len(incomplete_dates) > 10 else ''}")
    
    if empty_dates:
        print(f"\n⚠️  完全空内容的日期: {empty_dates[:10]}{'...' if len(empty_dates) > 10 else ''}")
    
    # 检查内容位置正确性
    print("\n🔍 检查内容位置正确性...")
    check_content_placement(data)
    
    return complete_dates, len(incomplete_dates), len(empty_dates)

def check_content_placement(data):
    """检查内容是否在正确的栏目位置"""
    
    # 关键词映射，用于检查内容是否在正确栏目
    column_keywords = {
        "内核": ["内核", "核心", "本质", "自由之士", "贯彻"],
        "恋爱与婚姻": ["恋爱", "婚姻", "爱情", "感情", "伴侣", "性", "外遇", "劈腿"],
        "工作与财运": ["工作", "财运", "事业", "业务", "服务业", "美容", "演艺"],
        "个性特征": ["个性", "性格", "特质", "出生日期", "数字"],
        "成为自己的捷径": ["捷径", "使命", "讯息", "忠于自我", "自由自在"],
        "未来的你": ["今生", "使命", "未来", "课题", "无私的爱"],
        "过去的你": ["前世", "过去", "故事", "流浪", "欧洲"],
        "生日名人": ["生日名人", "名人", "作家", "演员", "导演"]
    }
    
    misplaced_content = []
    
    for date, content in data.items():
        for column, keywords in column_keywords.items():
            if column in content:
                content_text = content[column].lower()
                # 检查是否包含其他栏目的关键词
                for other_column, other_keywords in column_keywords.items():
                    if other_column != column:
                        for keyword in other_keywords:
                            if keyword in content_text:
                                misplaced_content.append({
                                    'date': date,
                                    'column': column,
                                    'misplaced_keyword': keyword,
                                    'should_be_in': other_column
                                })
    
    if misplaced_content:
        print(f"\n⚠️  发现 {len(misplaced_content)} 个可能内容位置错误:")
        for item in misplaced_content[:5]:  # 只显示前5个
            print(f"  {item['date']} - {item['column']} 包含 '{item['misplaced_keyword']}' (应该在 {item['should_be_in']})")
        if len(misplaced_content) > 5:
            print(f"  ... 还有 {len(misplaced_content) - 5} 个")
    else:
        print("✅ 内容位置检查通过")

if __name__ == "__main__":
    complete, incomplete, empty = check_birthday_data()
    
    print(f"\n🎯 总结:")
    if complete == 366:  # 366天（包括闰年）
        print("✅ 所有日期都完整！")
    else:
        print(f"⚠️  还有 {366 - complete} 个日期需要补全")
    
    if empty > 0:
        print(f"⚠️  有 {empty} 个日期完全空内容，需要添加数据") 