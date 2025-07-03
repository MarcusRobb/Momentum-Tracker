export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  isIncomeGenerating: boolean;
  notes: string;
  scheduledTime: string;
  completedAt?: string; // ISO string
  duration?: number; // Duration in minutes
}

export interface LapsData {
  date: string; // YYYY-MM-DD
  leads: number;
  appointments: number;
  presentations: number;
  sales: number;
}

export interface AccountabilityData {
  date: string; // YYYY-MM-DD
  appointment: boolean;
  spokeToPerson: boolean;
  taughtSomeone: boolean;
  madeOffer: boolean;
}