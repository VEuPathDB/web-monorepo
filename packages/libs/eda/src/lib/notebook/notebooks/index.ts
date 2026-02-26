import { PresetNotebook } from '../Types';
import { differentialExpressionNotebook } from './differentialExpression';
import { wgcnaCorrelationNotebook } from './wgcnaCorrelation';
import { boxplotNotebook } from './boxplot';

export const presetNotebooks: Record<string, PresetNotebook> = {
  differentialExpressionNotebook,
  wgcnaCorrelationNotebook,
  // Note - boxplot notebook has no plan for use yet, just good for testing.
  boxplotNotebook,
};
