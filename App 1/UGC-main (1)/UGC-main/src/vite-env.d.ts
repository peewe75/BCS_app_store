export interface WorkflowStage {
    // ... existing types ...
}
// ... existing content ...

declare global {
    interface Window {
        aistudio?: {
            hasSelectedApiKey: () => Promise<boolean>;
            openSelectKey: () => Promise<void>;
        };
    }
}
