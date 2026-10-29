import { formatDuration } from './formatDuration';

describe('formatDuration', () => {
  it('formats as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(9.4)).toBe('0:09');
    expect(formatDuration(261)).toBe('4:21');
    expect(formatDuration(3725)).toBe('62:05');
  });

  it('treats negative durations as zero', () => {
    expect(formatDuration(-3)).toBe('0:00');
  });
});
