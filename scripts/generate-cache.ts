import { generatePostMetaCache } from "../utils/markdown";

async function main() {
  console.log("キャッシュの生成を開始します...");
  try {
    await generatePostMetaCache();
    console.log("キャッシュの生成が完了しました。");
  } catch (error) {
    console.error("キャッシュの生成に失敗しました:", error);
    process.exit(1);
  }
}

main();
