import {
  getPollingDisposition,
  getPollingIntervalMs,
} from './polling-schedule';
describe('getPollingDisposition', () => {
  it('continues while queued', () => {
    expect(getPollingDisposition('queued')).toBe('continue');
  });
  it('continues while in-progress', () => {
    expect(getPollingDisposition('in-progress')).toBe('continue');
  });
  it('stops on complete', () => {
    expect(getPollingDisposition('complete')).toBe('stop');
  });
  it('stops on failed', () => {
    expect(getPollingDisposition('failed')).toBe('stop');
  });
  it('stops on expired', () => {
    expect(getPollingDisposition('expired')).toBe('stop');
  });
});
describe('getPollingIntervalMs', () => {
  it('uses the 2s tier for the first 5 polls', () => {
    expect(getPollingIntervalMs(0)).toBe(2000);
    expect(getPollingIntervalMs(4)).toBe(2000);
  });
  it('uses the 5s tier from poll 5 through 10', () => {
    expect(getPollingIntervalMs(5)).toBe(5000);
    expect(getPollingIntervalMs(10)).toBe(5000);
  });
  it('uses the 15s steady tier from poll 11 onward', () => {
    expect(getPollingIntervalMs(11)).toBe(15000);
    expect(getPollingIntervalMs(1000)).toBe(15000);
  });
});
//# sourceMappingURL=polling-schedule.test.js.map
