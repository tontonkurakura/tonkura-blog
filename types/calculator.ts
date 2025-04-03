import { BaseMetadata, ISODateString, SearchParams } from "./common";

/**
 * 神経学的スケールの共通インターフェース
 */
export interface NeurologicalScale {
  /** スケールの合計スコア */
  totalScore: number;
  /** 各項目のスコア */
  [key: string]: number;
}

/**
 * 長谷川式認知症スケール改訂版（HDS-R）のスコアを表す型
 */
export interface HDSRScores extends NeurologicalScale {
  /** 年齢 */
  age: number;
  /** 曜日の見当識 */
  date_weekday: number;
  /** 日にちの見当識 */
  date_day: number;
  /** 月の見当識 */
  date_month: number;
  /** 年の見当識 */
  date_year: number;
  /** 場所の見当識 */
  location: number;
  /** 単語の記銘1 */
  words_1: number;
  /** 単語の記銘2 */
  words_2: number;
  /** 単語の記銘3 */
  words_3: number;
  /** 計算1 */
  calc_1: number;
  /** 計算2 */
  calc_2: number;
  /** 計算3 */
  calc_3: number;
  /** 計算4 */
  calc_4: number;
  /** 計算5 */
  calc_5: number;
  /** 数字の逆唱（3桁） */
  reverse_3digit: number;
  /** 数字の逆唱（4桁） */
  reverse_4digit: number;
  /** 遅延再生1 */
  recall_1: number;
  /** 遅延再生2 */
  recall_2: number;
  /** 遅延再生3 */
  recall_3: number;
  /** 物品記銘1 */
  items_1: number;
  /** 物品記銘2 */
  items_2: number;
  /** 物品記銘3 */
  items_3: number;
  /** 物品記銘4 */
  items_4: number;
  /** 物品記銘5 */
  items_5: number;
  /** 野菜の流暢性 */
  vegetables: number;
}

/**
 * ミニメンタルステート検査（MMSE）のスコアを表す型
 */
export interface MMSEScores extends NeurologicalScale {
  /** 年の見当識 */
  time_year: number;
  /** 季節の見当識 */
  time_season: number;
  /** 日の見当識 */
  time_day: number;
  /** 月の見当識 */
  time_month: number;
  /** 日付の見当識 */
  time_date: number;
  /** 都道府県の見当識 */
  place_prefecture: number;
  /** 市町村の見当識 */
  place_city: number;
  /** 施設名の見当識 */
  place_hospital: number;
  /** 階数の見当識 */
  place_floor: number;
  /** 地域の見当識 */
  place_region: number;
  /** 即時記銘1 */
  recall_1: number;
  /** 即時記銘2 */
  recall_2: number;
  /** 即時記銘3 */
  recall_3: number;
  /** 計算1 */
  calculation_1: number;
  /** 計算2 */
  calculation_2: number;
  /** 計算3 */
  calculation_3: number;
  /** 計算4 */
  calculation_4: number;
  /** 計算5 */
  calculation_5: number;
  /** 遅延再生1 */
  delayed_recall_1: number;
  /** 遅延再生2 */
  delayed_recall_2: number;
  /** 遅延再生3 */
  delayed_recall_3: number;
  /** 物品呼称1 */
  naming_1: number;
  /** 物品呼称2 */
  naming_2: number;
  /** 文の復唱 */
  repeat_sentence: number;
  /** 三段階命令1 */
  follow_command_1: number;
  /** 三段階命令2 */
  follow_command_2: number;
  /** 三段階命令3 */
  follow_command_3: number;
  /** 書字命令の実行 */
  read_follow: number;
  /** 自発書字 */
  write_sentence: number;
  /** 図形模写 */
  copy_figure: number;
}

/**
 * NIH脳卒中スケール（NIHSS）のスコアを表す型
 */
export interface NIHSSScores extends NeurologicalScale {
  /** 意識レベル */
  consciousness_level: number;
  /** 意識レベル（質問） */
  consciousness_questions: number;
  /** 意識レベル（命令） */
  consciousness_commands: number;
  /** 視線 */
  gaze: number;
  /** 視野 */
  visual_fields: number;
  /** 顔面麻痺 */
  facial_palsy: number;
  /** 左上肢運動 */
  left_arm_motor: number;
  /** 右上肢運動 */
  right_arm_motor: number;
  /** 左下肢運動 */
  left_leg_motor: number;
  /** 右下肢運動 */
  right_leg_motor: number;
  /** 運動失調 */
  limb_ataxia: number;
  /** 感覚 */
  sensory: number;
  /** 言語 */
  language: number;
  /** 構音障害 */
  dysarthria: number;
  /** 無視 */
  neglect: number;
}

/**
 * 臨床認知症評価尺度（CDR）のスコアを表す型
 */
export interface CDRScores extends NeurologicalScale {
  /** 記憶 */
  memory: number;
  /** 見当識 */
  orientation: number;
  /** 判断力と問題解決 */
  judgment: number;
  /** 地域活動 */
  community: number;
  /** 家族とする趣味 */
  home: number;
  /** 介護状況 */
  care: number;
}

/**
 * 認知症スケール結果を表す型
 */
export interface CognitiveAssessmentResult extends BaseMetadata {
  /** 評価ID */
  id: string;
  /** 患者ID */
  patientId: string;
  /** 評価日 */
  assessmentDate: ISODateString;
  /** 評価スケールタイプ */
  scaleType: "HDSR" | "MMSE" | "CDR";
  /** スコア */
  scores: HDSRScores | MMSEScores | CDRScores;
  /** 評価者 */
  assessor: string;
  /** 備考 */
  notes?: string;
  /** 対象者の年齢 */
  patientAge: number;
  /** 対象者の教育年数 */
  educationYears?: number;
  /** 総合判定 */
  diagnosis?: string;
  /** 重症度 */
  severity?: "normal" | "mild" | "moderate" | "severe";
  /** 前回の評価結果との差分 */
  change?: number;
}

/**
 * 脳卒中スケール結果を表す型
 */
export interface StrokeAssessmentResult extends BaseMetadata {
  /** 評価ID */
  id: string;
  /** 患者ID */
  patientId: string;
  /** 評価日 */
  assessmentDate: ISODateString;
  /** 評価スケールタイプ */
  scaleType: "NIHSS" | "mRS" | "Barthel";
  /** スコア */
  scores: NIHSSScores | number;
  /** 評価者 */
  assessor: string;
  /** 備考 */
  notes?: string;
  /** 発症からの時間（時間） */
  timeFromOnset?: number;
  /** 対象者の年齢 */
  patientAge: number;
  /** 脳卒中タイプ */
  strokeType?: "ischemic" | "hemorrhagic" | "subarachnoid" | "tia";
  /** 病変部位 */
  lesionLocation?: string[];
  /** 前回の評価結果との差分 */
  change?: number;
}

/**
 * 神経学的評価検索フィルターを表す型
 */
export interface NeurologicalAssessmentFilter extends SearchParams {
  /** 患者IDでフィルタリング */
  patientId?: string;
  /** スケールタイプでフィルタリング */
  scaleType?: string;
  /** 評価日の範囲 */
  dateRange?: {
    /** 開始日 */
    from: ISODateString;
    /** 終了日 */
    to: ISODateString;
  };
  /** 重症度でフィルタリング */
  severity?: string;
  /** スコア範囲 */
  scoreRange?: {
    min?: number;
    max?: number;
  };
}
