import nibabel as nib
import numpy as np
import json
import pandas as pd
from collections import Counter

# アトラスファイルのパス
atlas_file = 'public/data/brain/atlas/HCP-MMP1/HCP-MMP1_on_MNI152_ICBM2009a_nlin.nii.gz'
json_file = 'public/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels.json'

print(f"アトラスファイルを読み込んでいます: {atlas_file}")

try:
    # NIfTIファイルを読み込む
    img = nib.load(atlas_file)
    data = img.get_fdata()
    
    # データの形状を表示
    print(f"アトラスデータの形状: {data.shape}")
    
    # ユニークな値をカウント
    # 0は背景なので除外し、整数に変換
    unique_values = np.unique(data)
    unique_values = [int(val) for val in unique_values if val > 0]
    
    print(f"ユニークなラベル値の数: {len(unique_values)}")
    print(f"ラベル値の範囲: {min(unique_values)} から {max(unique_values)}")
    
    # 値の出現頻度をカウント
    flat_data = data.flatten()
    # 0以外の値のみをカウント
    non_zero_values = [int(val) for val in flat_data if val > 0]
    value_counts = Counter(non_zero_values)
    
    # 上位20個の出現頻度を表示
    print("\n最も頻繁に出現するラベル値（上位20個）:")
    for val, count in value_counts.most_common(20):
        print(f"ラベルID: {val}, 出現回数: {count}")
    
    # JSONラベルファイルの読み込み
    with open(json_file, 'r') as f:
        labels = json.load(f)
    
    print(f"\nJSONラベルファイルには {len(labels)} 個のエントリがあります")
    
    # ラベルファイルに存在しないアトラス値をチェック
    missing_labels = [val for val in unique_values if str(val) not in labels]
    if missing_labels:
        print(f"\nラベルファイルに存在しないアトラス値: {missing_labels}")
    else:
        print("\nすべてのアトラス値がラベルファイルに存在しています")
    
    # アトラスに存在しないラベル値をチェック
    unused_labels = [int(key) for key in labels.keys() if int(key) not in unique_values]
    if unused_labels:
        print(f"\nアトラスに存在しないラベル値: {len(unused_labels)} 個")
        print(f"例: {unused_labels[:10]} ...")
    else:
        print("\nすべてのラベル値がアトラスで使用されています")
    
    # ラベル情報とCSVファイルを作成
    results = []
    for val in unique_values:
        val_str = str(val)
        if val_str in labels:
            label_info = labels[val_str]
            results.append({
                'LabelID': val,
                'Hemisphere': label_info['hemisphere'],
                'RegionName': label_info['name'],
                'FullName': f"{label_info['hemisphere']}_{label_info['name']}",
                'Count': value_counts[val]
            })
        else:
            results.append({
                'LabelID': val,
                'Hemisphere': 'Unknown',
                'RegionName': 'Unknown',
                'FullName': 'Unknown',
                'Count': value_counts[val]
            })
    
    # DataFrameに変換してCSVに保存
    df = pd.DataFrame(results)
    df = df.sort_values('LabelID')
    csv_file = 'public/data/brain/atlas/HCP-MMP1/atlas_labels_analysis.csv'
    df.to_csv(csv_file, index=False)
    print(f"\nラベル情報を {csv_file} に保存しました")
    
    # サンプルとして最初の10行を表示
    print("\nラベル情報のサンプル（最初の10行）:")
    print(df.head(10))
    
except Exception as e:
    print(f"エラーが発生しました: {e}") 