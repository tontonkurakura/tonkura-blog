import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const WEBP_DIR = path.join(process.cwd(), "public/images/webp");
const PHOTOS_YAML_PATH = path.join(process.cwd(), "content/photos.yaml");

interface PhotoInfo {
  [key: string]: {
    description: string;
  };
}

async function generatePhotoYaml() {
  try {
    // 既存のYAMLファイルを読み込む
    let existingPhotoInfo: PhotoInfo = {};
    if (fs.existsSync(PHOTOS_YAML_PATH)) {
      const yamlContent = fs.readFileSync(PHOTOS_YAML_PATH, "utf8");
      existingPhotoInfo = (yaml.load(yamlContent) as PhotoInfo) || {};
    }

    // WEBPディレクトリ内のファイルを取得
    const webpFiles = fs
      .readdirSync(WEBP_DIR)
      .filter((file) => file.endsWith(".webp"));

    // 各WEBPファイルに対応するJPGファイル名を生成
    const photoInfo: PhotoInfo = { ...existingPhotoInfo };

    webpFiles.forEach((webpFile) => {
      const jpgFile = webpFile.replace(".webp", ".jpg");

      // 既存のエントリがない場合のみ追加
      if (!photoInfo[jpgFile]) {
        photoInfo[jpgFile] = {
          description: "撮影場所を入力してください",
        };
      }
    });

    // YAMLファイルに書き出し
    const yamlContent = yaml.dump(photoInfo, {
      indent: 2,
      lineWidth: -1,
      quotingType: '"',
    });

    // ヘッダーコメントを追加
    const yamlWithHeader = `# 写真の説明を設定するファイル
# 各写真に対して以下の情報を設定できます：
# - description: 撮影場所

${yamlContent}`;

    fs.writeFileSync(PHOTOS_YAML_PATH, yamlWithHeader);
    console.log("photos.yaml has been generated successfully!");
    console.log(`Total photos: ${Object.keys(photoInfo).length}`);
  } catch (error) {
    console.error("Error generating photos.yaml:", error);
  }
}

// スクリプトを実行
generatePhotoYaml();
