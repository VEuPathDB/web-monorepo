import { resolveProteinFeatures } from './resolveProteinFeatures';

type RowType = Record<string, string>;

describe('resolveProteinFeatures', () => {
  it('maps a selected full_id to a whole-sequence Feature using the row length', () => {
    const rows: RowType[] = [
      { full_id: 'osa_Os01g0100100', length: '350' },
      { full_id: 'atr_evm.model.AmTr_v1.1', length: '210' },
    ];

    const features = resolveProteinFeatures(['osa_Os01g0100100'], rows);

    expect(features).toEqual([
      {
        contig: 'osa_Os01g0100100',
        query: 'osa_Os01g0100100',
        start: 0,
        end: 350,
      },
    ]);
  });

  it('preserves selection order and handles multiple selected IDs', () => {
    const rows: RowType[] = [
      { full_id: 'osa_Os01g0100100', length: '350' },
      { full_id: 'atr_evm.model.AmTr_v1.1', length: '210' },
    ];

    const features = resolveProteinFeatures(
      ['atr_evm.model.AmTr_v1.1', 'osa_Os01g0100100'],
      rows
    );

    expect(features).toEqual([
      {
        contig: 'atr_evm.model.AmTr_v1.1',
        query: 'atr_evm.model.AmTr_v1.1',
        start: 0,
        end: 210,
      },
      {
        contig: 'osa_Os01g0100100',
        query: 'osa_Os01g0100100',
        start: 0,
        end: 350,
      },
    ]);
  });
});
