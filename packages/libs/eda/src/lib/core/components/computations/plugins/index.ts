import { ComputationPlugin } from '../Types';
import { plugin as alphadiv } from './alphaDiv';
import { plugin as betadiv } from './betadiv';
import { plugin as pass } from './pass';
import { plugin as distributions } from './distributions';
import { plugin as countsandproportions } from './countsAndProportions';
import { plugin as abundance } from './abundance';
import { plugin as differentialabundance } from './differentialabundance';
import { plugin as correlationassaymetadata } from './correlationAssayMetadata'; // mbio
import { plugin as correlationassayassay } from './correlationAssayAssay'; // mbio
import { plugin as correlation } from './correlation'; // genomics (- vb)
import { plugin as xyrelationships } from './xyRelationships';
export const plugins: Record<string, ComputationPlugin> = {
  abundance,
  alphadiv,
  betadiv,
  differentialabundance,
  correlationassaymetadata,
  correlationassayassay,
  correlation,
  countsandproportions,
  distributions,
  pass,
  xyrelationships,
};
