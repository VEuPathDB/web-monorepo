import { ComputationPlugin } from '../Types';
import { plugin as alphadiv } from './alphaDiv';
import { plugin as pass } from './pass';

export const plugins: Record<string, ComputationPlugin> = {
  alphadiv,
  pass,
};
