export enum WorkflowStage {
  IDLE = 'IDLE',
  ANALYZING_PRODUCT = 'ANALYZING_PRODUCT',
  REVIEWING_IMAGE_PROMPT = 'REVIEWING_IMAGE_PROMPT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  REVIEWING_GENERATED_IMAGE = 'REVIEWING_GENERATED_IMAGE',
  ANALYZING_SCENE = 'ANALYZING_SCENE',
  REVIEWING_VIDEO_PROMPT = 'REVIEWING_VIDEO_PROMPT',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface GenerationResult {
  productImages: string[]; // Array of Base64 strings (Max 3)
  imagePrompt: string | null;
  generatedImage: string | null; // Base64
  videoPrompt: string | null;
  videoUrl: string | null;
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error';
}

// Extend Window interface for AI Studio auth
// Extend Window interface for AI Studio auth
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}