export interface SaleDetail {
  id: string;
  setupFee: number;
  mrr: number;
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  isIncomeGenerating: boolean;
  notes: string;
  scheduledTime: string;
  completedAt?: string;
  duration?: number;
  tags?: string[];
  description?: string;
  source?: 'manual' | 'hl_briefing' | 'claude_prioritiser';
   urgency?: 'urgent-important' | 'urgent-not-important' | 'important' | 'not-important';
}

export interface LapsData {
  date: string;
  leads: number;
  appointments: number;
  presentations: number;
  sales: number;
  outreach_emails: number;
  voice_drops: number;
  li_comments: number;
  li_posts: number;
  li_dms: number;
  mrr_current: number;
  salesDetails?: SaleDetail[];
}

export interface AccountabilityData {
  date: string;
  appointment: boolean;
  spokeToPerson: boolean;
  taughtSomeone: boolean;
  madeOffer: boolean;
}
