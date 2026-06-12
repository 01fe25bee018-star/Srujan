import Dexie, { type Table } from 'dexie';

export interface Challenge {
  id: string;
  type: string;
  custom_name?: string;
  duration: number;
  start_date: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
}

export interface CheckIn {
  id: string;
  challenge_id: string;
  date: string; // YYYY-MM-DD
  note?: string;
  mood?: string;
  shield_used: boolean;
  created_at: string;
  synced: boolean;
}

export interface WeeklyInsight {
  id: string;
  challenge_id: string;
  week_number: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  retention_pct: number;
  follower_change: number;
  reach: number;
  top_content?: string;
  best_day?: string;
  ai_summary?: string;
  ai_coach_message?: string;
  week_start_date: string;
  image_url?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  challenge_id: string;
  badge_key: string;
  badge_name: string;
  emoji: string;
  earned_at: string;
}

export class SrujanDB extends Dexie {
  challenges!: Table<Challenge>;
  checkins!: Table<CheckIn>;
  weekly_insights!: Table<WeeklyInsight>;
  badges!: Table<Badge>;

  constructor() {
    super('srujanChallengeTrackerDB');
    this.version(1).stores({
      challenges: 'id, status, type',
      checkins: 'id, challenge_id, date, [challenge_id+date], synced',
      weekly_insights: 'id, challenge_id, week_number',
      badges: 'id, challenge_id, badge_key'
    });
  }
}

export const db = new SrujanDB();
