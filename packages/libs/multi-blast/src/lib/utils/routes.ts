import { SelectedResult } from '../utils/CommonTypes';

export function parseBlastResultSubpath(
  subPath: string | undefined
): SelectedResult | { type: 'unknown' } | undefined {
  if (subPath == null) {
    return undefined;
  }

  if (subPath === 'combined') {
    return { type: 'combined' };
  }

  if (subPath.startsWith('individual')) {
    const match = subPath.match(/individual\/(\d+)/);

    return match == null
      ? { type: 'unknown' }
      : { type: 'individual', resultIndex: Number(match[1]) };
  }

  return { type: 'unknown' };
}
