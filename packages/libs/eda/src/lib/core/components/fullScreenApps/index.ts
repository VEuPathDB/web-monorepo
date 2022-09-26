import { FullScreenAppPlugin } from '../../types/fullScreenApp';
import { fullScreenMapPlugin } from './fullScreenMap';

export const fullScreenAppPlugins: Record<
  string,
  FullScreenAppPlugin | undefined
> = {
  map: fullScreenMapPlugin,
};
