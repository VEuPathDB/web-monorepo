import { AnalysisClient } from '../api/analysis-api';
import { Analysis } from './analysis';

interface SubscribeCallback {
  (analysis: Analysis): void;
}

export class AnalysisStore {
  private callbacks = new Set<SubscribeCallback>();

  private analysis: Analysis | undefined = undefined;

  constructor(private client: AnalysisClient) {}

  subscribe(callback: SubscribeCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private updateAnalysis(partialAnalysis: Partial<Analysis>) {
    if (this.analysis == null) return;
    this.analysis = {
      ...this.analysis,
      ...partialAnalysis,
    };
    for (const callback of this.callbacks) {
      callback(this.analysis);
    }
  }
}
