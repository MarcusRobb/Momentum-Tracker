export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  isIncomeGenerating: boolean;
  notes: string;
  scheduledTime: string;
  completedAt?: string; // ISO string
  duration?: number; // Duration in minutes
  // Build 2 Additions
  tags?: string[];          
  description?: string;    // Longer notes field
  source?: 'manual' | 'hl_briefing' | 'claude_prioritiser';
}

export interface LapsData {
  date: string; // YYYY-MM-DD
  leads: number;
  appointments: number;
  presentations: number;
  sales: number;
  // Build 2 Activity Layer Additions
  outreach_emails: number; // Target: 5
  voice_drops: number;
  li_comments: number;     // Target: 2
  li_posts: number;
  li_dms: number;          // Target: 2
  mrr_current: number;     // MRR Row Addition
}

export interface AccountabilityData {
  date: string; // YYYY-MM-DD
  appointment: boolean;
  spokeToPerson: boolean;
  taughtSomeone: boolean;
  madeOffer: boolean;
}