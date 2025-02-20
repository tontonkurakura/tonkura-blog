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
