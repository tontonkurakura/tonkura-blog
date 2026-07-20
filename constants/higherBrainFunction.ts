/**
 * 高次脳機能データベースのカテゴリ定義。
 *
 * 分類の骨格は DSM-5 の6神経認知領域（複雑性注意／遂行機能／学習と記憶／言語／
 * 知覚–運動／社会的認知）に半球離断を加えたもの。
 * 以前は機能軸5つに部位軸（前頭葉）が1つ混ざっていたため、軸を揃えた。
 *
 * この配列と content/database/higher-brain-function/symptoms/ の実ファイルは
 * 二重管理になっている。ずれると孤児やリンク切れが生まれるので、
 * __tests__/higherBrainFunction.test.ts で機械的に突き合わせている。
 * 項目を足すときはファイルと配列の両方を触ること。
 */

export type SymptomItem = {
  /** Markdown のファイル名（拡張子なし） */
  id: string;
  /** Markdown の H1 と一致させる */
  title: string;
};

export type SymptomCategory = {
  /** content/.../symptoms/ 配下のディレクトリ名 */
  id: string;
  title: string;
  /** カテゴリの位置づけ。一覧に補足として出す */
  note?: string;
  items: SymptomItem[];
};

export const categories: SymptomCategory[] = [
  {
    id: "attention",
    title: "複雑性注意の障害",
    note: "半側空間無視をここに置いている。視空間認知に置く立場もあり、決着していない（各項の「分類上の論点」を参照）",
    items: [
      { id: "general-attention-deficit", title: "全般性注意障害" },
      { id: "unilateral-spatial-neglect", title: "半側空間無視" },
      { id: "extinction", title: "消去現象" },
      { id: "representational-neglect", title: "表象無視" },
      { id: "motor-neglect", title: "運動無視" },
      { id: "directional-hypokinesia", title: "方向性運動低下" },
    ],
  },
  {
    id: "executive",
    title: "遂行機能の障害",
    items: [
      { id: "executive-dysfunction", title: "遂行機能障害" },
      { id: "motivational-disorder", title: "意欲障害（アパシー）" },
      { id: "perseveration", title: "保続" },
      { id: "environmental-dependency-syndrome", title: "環境依存症候群" },
      { id: "utilization-behavior", title: "使用行動" },
      { id: "compulsive-tool-use", title: "道具の強迫的使用" },
      { id: "imitation-behavior", title: "模倣行動" },
      { id: "grasping-reflex", title: "把握現象" },
    ],
  },
  {
    id: "memory",
    title: "学習と記憶の障害",
    items: [
      { id: "amnesic-syndrome", title: "健忘症候群" },
      { id: "anterograde-retrograde-amnesia", title: "前向性健忘・逆向性健忘" },
      { id: "medial-temporal-amnesia", title: "内側側頭葉型健忘" },
      { id: "korsakoff-syndrome", title: "Korsakoff症候群" },
      { id: "transient-global-amnesia", title: "一過性全健忘" },
      { id: "transient-epileptic-amnesia", title: "一過性てんかん性健忘" },
      { id: "dissociative-amnesia", title: "解離性健忘" },
      { id: "accelerated-long-term-forgetting", title: "加速的長期忘却" },
      { id: "semantic-memory-impairment", title: "意味記憶障害" },
      { id: "prospective-memory-impairment", title: "展望記憶障害" },
      { id: "confabulation", title: "作話" },
    ],
  },
  {
    id: "language",
    title: "言語の障害",
    note: "古典的分類は臨床の共通語として残しているが、病巣の推定には使えない。総論を参照",
    items: [
      { id: "aphasia-overview", title: "失語症 — 総論と分類" },
      { id: "broca-aphasia", title: "運動性失語（Broca失語）" },
      { id: "wernicke-aphasia", title: "感覚性失語（Wernicke失語）" },
      { id: "global-aphasia", title: "全失語" },
      { id: "conduction-aphasia", title: "伝導失語" },
      { id: "transcortical-motor-aphasia", title: "超皮質性運動失語" },
      { id: "transcortical-sensory-aphasia", title: "超皮質性感覚失語" },
      { id: "mixed-transcortical-aphasia", title: "超皮質性混合失語" },
      { id: "anomic-aphasia", title: "失名辞失語（健忘失語）" },
      { id: "subcortical-aphasia", title: "皮質下性失語" },
      { id: "gogi-aphasia", title: "語義失語" },
      { id: "optic-aphasia", title: "視覚失語" },
      { id: "pure-anarthria", title: "純粋語唖" },
      { id: "aphemia", title: "失構音（アナルトリー）" },
      { id: "apraxia-of-speech", title: "発語失行" },
      { id: "alexia-agraphia", title: "失読失書" },
      { id: "pure-alexia", title: "純粋失読" },
      { id: "pure-agraphia", title: "純粋失書" },
      { id: "surface-dyslexia-dysgraphia", title: "表層失読/表層失書" },
      { id: "phonological-dyslexia-dysgraphia", title: "音韻失読/音韻失書" },
      { id: "deep-dyslexia-dysgraphia", title: "深層失読/深層失書" },
    ],
  },
  {
    id: "perception",
    title: "知覚–運動の障害（失認・視空間）",
    items: [
      { id: "visual-agnosia", title: "視覚性失認" },
      { id: "visual-object-agnosia", title: "視覚性物体失認" },
      { id: "prosopagnosia", title: "相貌失認" },
      { id: "topographical-disorder", title: "地誌的障害" },
      { id: "landmark-agnosia", title: "街並失認" },
      { id: "heading-disorientation", title: "道順障害" },
      { id: "cerebral-achromatopsia", title: "大脳性色覚障害" },
      { id: "akinetopsia", title: "失運動視" },
      { id: "balint-syndrome", title: "Balint症候群" },
      { id: "simultanagnosia", title: "同時失認" },
      { id: "optic-ataxia", title: "視覚性運動失調" },
      { id: "ocular-apraxia", title: "精神性注視麻痺" },
      { id: "cortical-deafness", title: "皮質聾" },
      { id: "auditory-agnosia", title: "聴覚性失認" },
      { id: "pure-word-deafness", title: "純粋語聾" },
      { id: "environmental-sound-agnosia", title: "環境音失認" },
      { id: "amusia", title: "失音楽" },
      { id: "tactile-agnosia", title: "触覚失認" },
      { id: "asomatognosia", title: "身体失認" },
      { id: "autotopagnosia", title: "身体部位失認" },
      { id: "anosognosia", title: "病態失認" },
      { id: "anton-syndrome", title: "Anton症候群" },
      { id: "gerstmann-syndrome", title: "Gerstmann症候群" },
      { id: "finger-agnosia", title: "手指失認" },
      { id: "acalculia", title: "失算" },
      { id: "right-left-disorientation", title: "左右失認" },
    ],
  },
  {
    id: "praxis",
    title: "行為の障害（失行）",
    items: [
      { id: "limb-kinetic-apraxia", title: "肢節運動失行" },
      { id: "ideomotor-apraxia", title: "観念運動失行" },
      { id: "ideational-apraxia", title: "観念失行" },
      { id: "conceptual-apraxia", title: "概念失行" },
      { id: "buccofacial-apraxia", title: "口部顔面失行" },
      { id: "constructional-disorder", title: "構成障害" },
      { id: "dressing-apraxia", title: "着衣失行" },
      { id: "alien-hand-syndrome", title: "他人の手徴候" },
      { id: "apraxia-of-eyelid-opening", title: "開眼失行" },
    ],
  },
  {
    id: "social",
    title: "社会的認知の障害",
    note: "行政用語の「社会的行動障害」とは1対1に対応しない。脱抑制の項の対応表を参照",
    items: [
      { id: "theory-of-mind-deficit", title: "心の理論の障害" },
      { id: "facial-emotion-recognition-deficit", title: "表情認知障害" },
      { id: "impaired-empathy", title: "共感の障害" },
      { id: "alexithymia", title: "失感情症" },
      { id: "disinhibition", title: "脱抑制" },
      { id: "emotional-incontinence", title: "感情失禁" },
      { id: "personality-change", title: "性格変化" },
    ],
  },
  {
    id: "disconnection",
    title: "半球離断",
    items: [
      { id: "callosal-disconnection", title: "脳梁離断症候群" },
      { id: "antagonistic-apraxia", title: "拮抗失行" },
    ],
  },
];
