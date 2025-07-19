import json
import re
import shutil

# 需要标准化的栏目
COLUMNS = [
    "内核", "恋爱与婚姻", "工作与财运", "个性特征", "成为自己的捷径", "未来的你", "过去的你", "生日名人"
]

# 备份原文件
def backup_file(filename):
    shutil.copy(filename, filename + ".bak")

# 尝试分割混杂内容（如栏目名出现在内容里）
def split_mixed_content(content):
    # 用所有栏目名做分割
    pattern = r"(" + "|".join([re.escape(col) for col in COLUMNS if col != "生日名人"]) + r")[:：\n]"
    # 只分割一次，避免误伤
    parts = re.split(pattern, content)
    if len(parts) <= 1:
        return None
    # 重新组装为 dict
    result = {}
    key = None
    for part in parts:
        part = part.strip()
        if part in COLUMNS:
            key = part
            result[key] = ""
        elif key:
            if result[key]:
                result[key] += "\n" + part
            else:
                result[key] = part
    return result if result else None

# 主修正逻辑
def fix_json(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    fixed = {}
    for date, info in data.items():
        new_info = {}
        buffer = ""
        for col in COLUMNS:
            val = info.get(col, "")
            # 处理生日名人混在内容里的情况
            if not val and col == "生日名人":
                # 尝试从其他栏目内容里提取
                for k, v in info.items():
                    if isinstance(v, str) and ("生日名人" in v or "生日名人：" in v or "生日名人:" in v):
                        # 提取后面的内容
                        match = re.search(r"生日名人[:：]?\n?(.+)", v, re.DOTALL)
                        if match:
                            val = match.group(1).strip()
                            # 去掉后面“从你的生日看命运”等无关内容
                            val = re.split(r"[·●●从你的生日看命运|\n]+", val)[0].strip()
                        break
            # 处理栏目内容混杂
            if isinstance(val, str) and any(other in val for other in COLUMNS if other != col):
                # 尝试分割
                split_result = split_mixed_content(val)
                if split_result:
                    for k2, v2 in split_result.items():
                        if k2 in COLUMNS:
                            new_info[k2] = v2.strip()
                    continue
            new_info[col] = val.strip() if isinstance(val, str) else val
        fixed[date] = new_info

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    input_file = "birthday_intros_classified.json"
    output_file = "birthday_intros_classified_fixed.json"
    backup_file(input_file)
    fix_json(input_file, output_file)
    print(f"修正完成，输出文件：{output_file}，原文件已备份。") 