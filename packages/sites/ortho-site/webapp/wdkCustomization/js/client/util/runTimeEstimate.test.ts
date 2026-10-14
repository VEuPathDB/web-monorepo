import { estimateMsaSeconds, estimateTreeSeconds } from './runTimeEstimate';

describe('estimateTreeSeconds', () => {
  it('is zero for no sequences', () => {
    expect(estimateTreeSeconds(0, 500)).toBe(0);
  });

  it('adds the FastTree and MAFFT terms', () => {
    const fasttree = Math.exp(-8.229) * 100 ** 1.165 * 400 ** 0.849;
    const mafft = Math.exp(-12.453) * 100 ** 0.618 * 400 ** 1.47;
    expect(estimateTreeSeconds(100, 400)).toBeCloseTo(fasttree + mafft, 6);
  });

  it('grows with sequence count and with maximum length', () => {
    expect(estimateTreeSeconds(200, 400)).toBeGreaterThan(
      estimateTreeSeconds(100, 400)
    );
    expect(estimateTreeSeconds(100, 800)).toBeGreaterThan(
      estimateTreeSeconds(100, 400)
    );
  });
});

describe('estimateMsaSeconds', () => {
  it('is zero for no sequences', () => {
    expect(estimateMsaSeconds(0, 500)).toBe(0);
  });

  it('follows the fitted power law', () => {
    expect(estimateMsaSeconds(100, 400)).toBeCloseTo(
      Math.exp(-9.235) * 100 ** 1.016 * 400 ** 0.931,
      6
    );
  });
});
