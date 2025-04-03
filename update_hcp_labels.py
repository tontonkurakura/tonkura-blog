import json
import csv
import os

# ファイルパスの設定
json_file_path = 'public/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels.json'
glasser_table_path = 'public/data/brain/atlas/HCP-MMP1/Glasser_2016_Table.csv'
atlas_dseg_path = 'public/data/brain/atlas/HCP-MMP1/atlas-Glasser_dseg.csv'
output_json_path = 'public/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels_updated.json'

# 既存のJSONファイルを読み込む
with open(json_file_path, 'r', encoding='utf-8') as f:
    labels_data = json.load(f)

# Glasser_2016_Table.csvから正式な英語名を抽出
english_names = {}
with open(glasser_table_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # ヘッダーをスキップ
    for row in reader:
        if len(row) >= 3:
            index = row[0].strip()
            name = row[1].strip()
            description = row[2].strip()
            
            # インデックスが数値であることを確認
            try:
                index = int(index)
                english_names[index] = {
                    'name': name,
                    'description': description
                }
            except ValueError:
                continue

# atlas-Glasser_dseg.csvからYeo 7ネットワークの情報を抽出
# このファイルでは、1-180が右半球、181-360が左半球
networks_by_name = {}
with open(atlas_dseg_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # ヘッダーをスキップ
    for row in reader:
        if len(row) >= 4:
            label = row[1]
            network = row[3]
            
            # 領域名（V1, MST, V6など）を抽出
            if "Right_" in label:
                region_name = label.replace("Right_", "")
            else:
                region_name = label.replace("Left_", "")
            
            # 半球情報
            hemisphere = "R" if "Right_" in label else "L"
            
            # 領域名と半球情報をキーとして保存
            networks_by_name[(region_name, hemisphere)] = network

# JSONデータを更新
for key, value in labels_data.items():
    key_int = int(key)
    
    # 英語名と説明を追加
    if key_int in english_names:
        value['english_name'] = english_names[key_int]['name']
        value['description'] = english_names[key_int]['description']
    elif key_int - 200 in english_names and key_int > 200:  # 右半球の場合
        value['english_name'] = english_names[key_int - 200]['name']
        value['description'] = english_names[key_int - 200]['description']
    
    # ネットワーク情報を追加
    region_name = value['name']
    hemisphere = value['hemisphere']
    
    if (region_name, hemisphere) in networks_by_name:
        value['network'] = networks_by_name[(region_name, hemisphere)]
    
    # デバッグ情報
    if key_int <= 5:
        print(f"Key: {key_int}, Value: {value}")
        print(f"Region: {region_name}, Hemisphere: {hemisphere}")
        if (region_name, hemisphere) in networks_by_name:
            print(f"Network: {networks_by_name[(region_name, hemisphere)]}")
        else:
            print(f"No network info for {region_name}, {hemisphere}")

# 更新したJSONを保存
with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(labels_data, f, indent=2, ensure_ascii=False)

print(f"JSONファイルを更新しました: {output_json_path}")

# 更新されたJSONファイルの最初の数エントリを表示
count = 0
print("\n更新されたJSONファイルのサンプル:")
for key, value in labels_data.items():
    if count < 5:
        print(f"{key}: {value}")
        count += 1
    else:
        break 