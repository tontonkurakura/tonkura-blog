// Glasser Atlas領域情報JSONファイル生成スクリプト
const fs = require("fs");
const path = require("path");

// 入力ファイルパス
const glasserTablePath = path.join(
  "public",
  "data",
  "brain",
  "atlas",
  "HCP-MMP1",
  "Glasser_2016_Table.csv"
);
const glasserDsegPath = path.join(
  "public",
  "data",
  "brain",
  "atlas",
  "HCP-MMP1",
  "atlas-Glasser_dseg.csv"
);

// 出力ファイルパス
const outputPath = path.join(
  "public",
  "data",
  "brain",
  "atlas",
  "HCP-MMP1",
  "glasser_atlas_regions.json"
);

// CSVの特定行を解析する
function parseCSVRow(line) {
  const result = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  if (currentValue) {
    result.push(currentValue);
  }

  return result;
}

// メイン処理
async function main() {
  try {
    // ファイル読み込み
    const tableContent = fs.readFileSync(glasserTablePath, "utf8");
    const dsegContent = fs.readFileSync(glasserDsegPath, "utf8");

    // CSVを行に分割
    const tableLines = tableContent
      .split("\n")
      .filter((line) => line.trim() !== "");
    const dsegLines = dsegContent
      .split("\n")
      .filter((line) => line.trim() !== "");

    // データ配列
    const tableData = [];
    const dsegData = [];

    // Glasser_2016_Tableの手動パース（特殊なCSV形式のため）
    for (let i = 1; i < tableLines.length; i++) {
      const line = tableLines[i];

      // 引用符に囲まれた列を正しく処理するためのパース
      const parts = parseCSVRow(line);

      if (parts.length >= 3) {
        // ID、名前、説明の取得
        const id = parseInt(parts[0]);
        const name = parts[1].replace(/"/g, "").trim();
        const description = parts[2]
          .replace(/"/g, "")
          .replace(/\n/g, " ")
          .trim();

        tableData.push({
          id,
          name,
          description,
        });
      }
    }

    // atlas-Glasser_dsegのパース
    for (let i = 1; i < dsegLines.length; i++) {
      const line = dsegLines[i];
      const parts = line.split(",");

      if (parts.length >= 4) {
        const row = {
          index: parseInt(parts[0]),
          label: parts[1],
          cifti_label: parts[2],
          community_yeo: parts[3].replace(/\r|\n/g, ""), // 改行文字を削除
        };
        dsegData.push(row);
      }
    }

    console.log(`Table Rows: ${tableData.length}, First row:`, tableData[0]);
    console.log(`Dseg Rows: ${dsegData.length}, First row:`, dsegData[0]);

    // Glasser_2016_Tableの説明文が切れているため、手動で修正
    // 主要な切れている説明文を修正
    const descriptionFixes = {
      2: "Medial Superior Temporal Area",
      8: "Primary Motor Cortex",
      9: "Primary Sensory Cortex",
      22: "Posterior InferoTemporal complex",
      23: "Middle Temporal Area",
      25: "PeriSylvian Language Area",
      26: "Superior Frontal Language Area",
      27: "PreCuneus Visual Area",
      28: "Superior Temporal Visual Area",
      31: "Parieto-Occipital Sulcus Area 1",
      139: "Area TemporoParietoOccipital Junction 1",
      140: "Area TemporoParietoOccipital Junction 2",
      141: "Area TemporoParietoOccipital Junction 3",
      142: "Dorsal Transitional Visual Area",
      167: "Area Posterior Insular 1",
      168: "Insular Granular Complex",
      169: "Area Frontal Opercular 5",
      179: "Area anterior 32 prime",
    };

    // 結果オブジェクト
    const resultData = {
      regions: [],
    };

    // データマッピング
    tableData.forEach((tableRow) => {
      // Glasser_2016_Tableからの基本情報を取得
      const id = tableRow.id;
      const name = tableRow.name;
      let description = tableRow.description;

      // 説明文の修正を適用
      if (descriptionFixes[id]) {
        description = descriptionFixes[id];
      }

      // atlas-Glasser_dsegからの情報を取得（右半球のデータ）
      const rightDseg = dsegData.find(
        (d) => d.index === id && d.label.startsWith("Right_")
      );

      // ネットワーク情報
      const network = rightDseg ? rightDseg.community_yeo : "";

      // リージョン情報を追加
      if (id && name) {
        resultData.regions.push({
          id,
          name,
          description,
          network,
        });
      }
    });

    // 結果を整列
    resultData.regions.sort((a, b) => a.id - b.id);

    // JSONファイル書き込み
    fs.writeFileSync(outputPath, JSON.stringify(resultData, null, 2), "utf8");

    console.log(`Successfully generated ${outputPath}`);
    console.log(`Total regions: ${resultData.regions.length}`);
  } catch (error) {
    console.error("Error generating Glasser atlas JSON:", error);
  }
}

main();
