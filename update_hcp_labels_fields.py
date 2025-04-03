import json
import os

# 入力ファイルと出力ファイルのパス
input_file = 'public/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels.json'
output_file = 'public/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels_updated.json'

# JSONファイルを読み込む
with open(input_file, 'r', encoding='utf-8') as f:
    labels_data = json.load(f)

# フィールド名を修正
for key, value in labels_data.items():
    # 現在のフィールド構造:
    # id: 数値ID
    # hemisphere: 半球情報 (L/R)
    # name: ラベルID (V1, MST等)
    # english_name: ラベルID (V1, MST等) - nameと同じ
    # description: 英語での説明
    # network: ネットワーク情報
    
    # 新しいフィールド構造:
    # id: 数値ID (変更なし)
    # hemisphere: 半球情報 (L/R) (変更なし)
    # label_id: ラベルID (V1, MST等) - 旧nameから
    # english_name: 英語での説明 - 旧descriptionから
    # network: ネットワーク情報 (変更なし)
    
    # nameをlabel_idとして保存
    value['label_id'] = value['name']
    
    # descriptionをenglish_nameとして保存
    if 'description' in value:
        value['english_name'] = value['description']
        del value['description']
    
    # 元のenglish_nameを削除（nameと重複しているため）
    if 'english_name' in value and value['english_name'] == value['name']:
        del value['english_name']
    
    # nameを削除（label_idに移行したため）
    del value['name']

# 更新したJSONを保存
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(labels_data, f, indent=2, ensure_ascii=False)

print(f"JSONファイルを更新しました: {output_file}")

# 更新されたJSONファイルの最初の数エントリを表示
count = 0
print("\n更新されたJSONファイルのサンプル:")
for key, value in labels_data.items():
    if count < 5:
        print(f"{key}: {value}")
        count += 1
    else:
        break 