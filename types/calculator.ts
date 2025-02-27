export interface HDSRScores {
  age: number;
  date_weekday: number;
  date_day: number;
  date_month: number;
  date_year: number;
  location: number;
  words_1: number;
  words_2: number;
  words_3: number;
  calc_1: number;
  calc_2: number;
  calc_3: number;
  calc_4: number;
  calc_5: number;
  reverse_3digit: number;
  reverse_4digit: number;
  recall_1: number;
  recall_2: number;
  recall_3: number;
  items_1: number;
  items_2: number;
  items_3: number;
  items_4: number;
  items_5: number;
  vegetables: number;
  [key: string]: number;
}

export interface MMSEScores {
  time_year: number;
  time_season: number;
  time_day: number;
  time_month: number;
  time_date: number;
  place_prefecture: number;
  place_city: number;
  place_hospital: number;
  place_floor: number;
  place_region: number;
  recall_1: number;
  recall_2: number;
  recall_3: number;
  calculation_1: number;
  calculation_2: number;
  calculation_3: number;
  calculation_4: number;
  calculation_5: number;
  delayed_recall_1: number;
  delayed_recall_2: number;
  delayed_recall_3: number;
  naming_1: number;
  naming_2: number;
  repeat_sentence: number;
  follow_command_1: number;
  follow_command_2: number;
  follow_command_3: number;
  read_follow: number;
  write_sentence: number;
  copy_figure: number;
  [key: string]: number;
}

export interface NIHSSScores {
  consciousness_level: number;
  consciousness_questions: number;
  consciousness_commands: number;
  gaze: number;
  visual_fields: number;
  facial_palsy: number;
  left_arm_motor: number;
  right_arm_motor: number;
  left_leg_motor: number;
  right_leg_motor: number;
  limb_ataxia: number;
  sensory: number;
  language: number;
  dysarthria: number;
  neglect: number;
  [key: string]: number;
}

export interface CDRScores {
  memory: number;
  orientation: number;
  judgment: number;
  community: number;
  home: number;
  care: number;
  [key: string]: number;
}
