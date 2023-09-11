import { ComputationPlugin } from '../Types';
import { plugin as alphadiv } from './alphaDiv';
import { plugin as betadiv } from './betadiv';
import { plugin as pass } from './pass';
import { plugin as distributions } from './distributions';
import { plugin as countsandproportions } from './countsAndProportions';
import { plugin as abundance } from './abundance';
import { plugin as differentialabundance } from './differentialabundance';
import { plugin as xyrelationships } from './xyRelationships';

export const plugins: Record<string, ComputationPlugin> = {
  abundance,
  alphadiv,
  betadiv,
  // differentialabundance,
  countsandproportions,
  distributions,
  pass,
  xyrelationships,
};
