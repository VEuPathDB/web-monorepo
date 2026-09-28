import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { AnyAction } from 'redux';
import {
  RecordActions,
  QuestionActions,
} from '@veupathdb/wdk-client/lib/Actions';
import { observeStrainMsaFilter } from './Record';

function makeRecordReceivedAction(
  recordClassName: string,
  attributes: Record<string, string>
) {
  return {
    type: RecordActions.RECORD_RECEIVED,
    payload: {
      record: {
        recordClassName,
        attributes,
      },
    },
  };
}

describe('observeStrainMsaFilter', () => {
  it('seeds StrainSegmentsByMeta from a Gene record', (done) => {
    const action$ = of(
      makeRecordReceivedAction('GeneRecordClasses.GeneRecordClass', {
        organism_full: 'Plasmodium falciparum 3D7',
        sequence_id: 'Pf3D7_11_v3',
      })
    );

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions: AnyAction[]) => {
        expect(actions).toHaveLength(1);
        expect(actions[0]).toEqual({
          type: QuestionActions.UPDATE_ACTIVE_QUESTION,
          payload: {
            searchName: 'StrainSegmentsByMeta',
            initialParamData: {
              organismSinglePick: 'Plasmodium falciparum 3D7',
              sequenceId: 'Pf3D7_11_v3',
              sequence_strand: 'f',
              variation_sample_meta: JSON.stringify({ filters: [] }),
            },
          },
        });
        done();
      });
  });

  it('seeds StrainSegmentsByMeta from a Variant record, using Variant-specific attribute names', (done) => {
    const action$ = of(
      makeRecordReceivedAction('VariantRecordClasses.VariantRecordClass', {
        organism_text: 'Plasmodium falciparum 3D7',
        sequence_source_id: 'Pf3D7_11_v3',
      })
    );

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions: AnyAction[]) => {
        expect(actions).toHaveLength(1);
        expect(actions[0].payload.searchName).toBe('StrainSegmentsByMeta');
        expect(actions[0].payload.initialParamData).toEqual(
          expect.objectContaining({
            organismSinglePick: 'Plasmodium falciparum 3D7',
            sequenceId: 'Pf3D7_11_v3',
          })
        );
        done();
      });
  });

  it('emits nothing for an unrelated record class', (done) => {
    const action$ = of(
      makeRecordReceivedAction('PathwayRecordClasses.PathwayRecordClass', {})
    );

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions: AnyAction[]) => {
        expect(actions).toHaveLength(0);
        done();
      });
  });

  it('emits nothing for actions that are not RECORD_RECEIVED', (done) => {
    const action$ = of({ type: 'some/other-action' });

    observeStrainMsaFilter(action$)
      .pipe(toArray())
      .subscribe((actions: AnyAction[]) => {
        expect(actions).toHaveLength(0);
        done();
      });
  });
});
