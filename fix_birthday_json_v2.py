import json
import re
import shutil

# 需要标准化的栏目
COLUMNS = [
    "内核", "恋爱与婚姻", "工作与财运", "个性特征", 
    "成为自己的捷径", "未来的你", "过去的你", "生日名人"
]

# 栏目关键词映射（用于识别内容属于哪个栏目）
COLUMN_KEYWORDS = {
    "内核": ["内核", "核心", "本质"],
    "恋爱与婚姻": ["恋爱", "婚姻", "爱情", "感情", "伴侣", "性", "外遇", "劈腿"],
    "工作与财运": ["工作", "财运", "事业", "业务", "服务业", "美容", "演艺"],
    "个性特征": ["个性", "性格", "特质", "出生日期", "数字"],
    "成为自己的捷径": ["捷径", "使命", "讯息"],
    "未来的你": ["今生", "使命", "未来", "课题"],
    "过去的你": ["前世", "过去", "故事"],
    "生日名人": ["生日名人", "名人"]
}

def backup_file(filename):
    """备份原文件"""
    shutil.copy(filename, filename + ".bak")
    print(f"已备份原文件为 {filename}.bak")

def extract_date_content(text):
    """从混乱的文本中提取日期和内容"""
    # 匹配日期格式：X月X日
    date_pattern = r'(\d{1,2}月\d{1,2}日)'
    match = re.search(date_pattern, text)
    if match:
        date = match.group(1)
        # 移除日期部分，保留内容
        content = text.replace(date, "").strip()
        return date, content
    return None, text

def parse_mixed_content(content):
    """解析混合内容，分离到对应栏目"""
    result = {col: "" for col in COLUMNS}
    
    # 按段落分割
    paragraphs = re.split(r'\n+', content)
    
    current_column = None
    current_content = []
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
            
        # 检查是否是栏目标题
        found_column = None
        for col, keywords in COLUMN_KEYWORDS.items():
            for keyword in keywords:
                if keyword in para and len(para) < 50:  # 标题通常较短
                    found_column = col
                    break
            if found_column:
                break
        
        if found_column:
            # 保存之前的内容
            if current_column and current_content:
                result[current_column] = '\n'.join(current_content).strip()
            
            # 开始新栏目
            current_column = found_column
            current_content = [para]
        else:
            # 继续添加到当前栏目
            if current_column:
                current_content.append(para)
            else:
                # 如果没有识别到栏目，尝试根据内容判断
                for col, keywords in COLUMN_KEYWORDS.items():
                    if any(keyword in para for keyword in keywords):
                        current_column = col
                        current_content = [para]
                        break
                if not current_column:
                    # 默认添加到个性特征
                    current_column = "个性特征"
                    current_content = [para]
    
    # 保存最后一个栏目
    if current_column and current_content:
        result[current_column] = '\n'.join(current_content).strip()
    
    return result

def fix_json_structure():
    """修正JSON文件结构"""
    input_file = "birthday_intros_classified.json"
    output_file = "birthday_intros_classified_fixed_v2.json"
    
    # 备份原文件
    backup_file(input_file)
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"读取文件失败: {e}")
        return
    
    fixed_data = {}
    processed_dates = set()
    
    # 处理每个主日期
    for date_key, content in data.items():
        if isinstance(content, str):
            # 如果是字符串，尝试解析
            date, mixed_content = extract_date_content(content)
            if date:
                parsed_content = parse_mixed_content(mixed_content)
                fixed_data[date] = parsed_content
                processed_dates.add(date)
            else:
                # 如果无法提取日期，使用原键
                parsed_content = parse_mixed_content(content)
                fixed_data[date_key] = parsed_content
                processed_dates.add(date_key)
        elif isinstance(content, dict):
            # 如果已经是字典，检查格式
            fixed_content = {}
            for col in COLUMNS:
                if col in content:
                    fixed_content[col] = content[col]
                else:
                    fixed_content[col] = ""
            fixed_data[date_key] = fixed_content
            processed_dates.add(date_key)
    
    # 检查是否有缺失的日期（1月1日到12月31日）
    all_dates = set()
    for month in range(1, 13):
        for day in range(1, 32):
            date_str = f"{month}月{day}日"
            all_dates.add(date_str)
    
    missing_dates = all_dates - processed_dates
    if missing_dates:
        print(f"发现缺失的日期: {sorted(missing_dates)}")
        # 为缺失的日期添加空内容
        for date in sorted(missing_dates):
            fixed_data[date] = {col: "" for col in COLUMNS}
    
    # 按日期排序
    def sort_key(item):
        date = item[0]
        month = int(date.split('月')[0])
        day = int(date.split('月')[1].split('日')[0])
        return (month, day)
    
    sorted_data = dict(sorted(fixed_data.items(), key=sort_key))
    
    # 保存修正后的文件
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)
    
    print(f"修正完成！输出文件: {output_file}")
    print(f"处理了 {len(processed_dates)} 个日期")
    print(f"添加了 {len(missing_dates)} 个缺失的日期")

if __name__ == "__main__":
    fix_json_structure() 