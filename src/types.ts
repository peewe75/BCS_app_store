
export enum AppView {
  HOME = 'home',
  CLIP_APP = 'clipapp',
  FORF_APP = 'forfapp',
  BOT_APP = 'botapp',
  PROMPT_APP = 'promptapp',
  SIGN_UP = 'signup',
  LOGIN = 'login'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FiscalData {
  saldoPrevisto: number;
  tasse: number;
  inps: number;
  percentuale: number;
}
