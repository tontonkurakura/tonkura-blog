import json
import os

# 入力ファイルと出力ファイルのパス
input_file = 'public/data/brain/atlas/HCP-MMP1/HCP-MMP1_on_MNI152_ICBM2009a_nlin.txt'
output_file = 'public/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels.json'

# 結果を格納する辞書
labels = {}

# 右半球のIDをマッピングするための辞書も作成（IDを直接変換）
right_hemisphere_labels = {}

try:
    with open(input_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
                
            # ID と ラベル名を分割
            parts = line.split(' ', 1)
            if len(parts) < 2:
                continue
                
            id_str, label_full = parts
            try:
                id_num = int(id_str)
            except ValueError:
                continue
                
            # L_NAME_ROI の形式から半球と名前を抽出
            label_parts = label_full.split('_')
            if len(label_parts) < 2:
                continue
                
            hemisphere = label_parts[0]  # L or R
            
            # _ROI を削除して名前部分を抽出
            name = "_".join(label_parts[1:-1]) if label_parts[-1] == "ROI" else "_".join(label_parts[1:])
            
            # 辞書に追加
            labels[id_str] = {
                "id": id_num,
                "hemisphere": hemisphere,
                "name": name
            }
            
            # 右半球の場合、IDを直接変換（例：1→201, 2→202）
            if hemisphere == 'L' and id_num <= 180:
                right_id = id_num + 200
                right_hemisphere_labels[str(right_id)] = {
                    "id": right_id,
                    "hemisphere": 'R',
                    "name": name
                }
    
    # 右半球のラベルを追加
    labels.update(right_hemisphere_labels)
    
    # 結果をJSONファイルに書き込み
    with open(output_file, 'w') as f:
        json.dump(labels, f, indent=2)
        
    print(f"変換が完了しました。{len(labels)}個のラベルをJSONに変換しました。")
    
except Exception as e:
    print(f"エラーが発生しました: {e}") 