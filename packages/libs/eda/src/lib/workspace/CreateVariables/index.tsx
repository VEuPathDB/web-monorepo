import { useMemo, useState } from 'react';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { OutlinedButton } from '@veupathdb/coreui/lib/components/buttons';
import { AnalysisState } from '../../core/hooks/analysis';
import { useStudyMetadata } from '../../core/hooks/workspace';
import {
  decodeDerivedVariables,
  FilterDefinedGroupsSpec,
} from '../../core/derivedVariables/types';
import { newFilterDefinedGroupsSpec } from '../../core/derivedVariables/groups';
import { VariableEditor } from './VariableEditor';

import './CreateVariables.scss';

const cx = makeClassNameHelper('CreateVariables');

interface Props {
  analysisState: AnalysisState;
}

type Selection =
  | { kind: 'existing'; variableId: string }
  | { kind: 'new'; spec: FilterDefinedGroupsSpec };

/** The "Create variables" tab: the analysis's grouping variables and an editor for one. */
export default function CreateVariables({ analysisState }: Props) {
  const { rootEntity } = useStudyMetadata();
  const derivedVariables = analysisState.analysis?.descriptor.derivedVariables;
  const { supported, unsupported } = useMemo(
    () => decodeDerivedVariables(derivedVariables ?? []),
    [derivedVariables]
  );

  const [selection, setSelection] = useState<Selection | undefined>(() =>
    supported.length > 0
      ? { kind: 'existing', variableId: supported[0].variableId }
      : undefined
  );
  // Bumped to discard the draft of an existing variable on Cancel.
  const [resetCount, setResetCount] = useState(0);

  const selectedSpec =
    selection?.kind === 'new'
      ? selection.spec
      : supported.find((s) => s.variableId === selection?.variableId);

  return (
    <div className={cx()}>
      <div className={cx('-List')}>
        <h3>Your variables</h3>
        {supported.length + unsupported.length > 0 ? (
          <ul>
            {supported.map((spec) => (
              <li key={spec.variableId}>
                <button
                  type="button"
                  className={cx(
                    '-ListItem',
                    spec.variableId === selectedSpec?.variableId
                      ? 'selected'
                      : ''
                  )}
                  aria-current={spec.variableId === selectedSpec?.variableId}
                  onClick={() =>
                    setSelection({
                      kind: 'existing',
                      variableId: spec.variableId,
                    })
                  }
                >
                  {spec.displayName || 'Unnamed variable'}
                </button>
              </li>
            ))}
            {unsupported.map((entry) => (
              <li
                key={entry.variableId}
                className={cx('-ListItem', 'unsupported')}
                title={entry.displayName}
              >
                Unsupported variable
              </li>
            ))}
          </ul>
        ) : (
          <p className={cx('-Muted')}>None yet.</p>
        )}
        <OutlinedButton
          text="+ New variable"
          size="small"
          themeRole="primary"
          onPress={() =>
            setSelection({
              kind: 'new',
              spec: newFilterDefinedGroupsSpec(rootEntity.id, ''),
            })
          }
        />
        <p className={cx('-Note')}>
          Variables made here can be used in Visualize, not for subsetting.
        </p>
      </div>
      <div className={cx('-EditorPane')}>
        {selectedSpec ? (
          <VariableEditor
            key={`${selectedSpec.variableId}/${resetCount}`}
            spec={selectedSpec}
            analysisState={analysisState}
            onSave={(spec) =>
              setSelection({ kind: 'existing', variableId: spec.variableId })
            }
            onCancel={() =>
              selection?.kind === 'new'
                ? setSelection(undefined)
                : setResetCount((n) => n + 1)
            }
            onDelete={() => setSelection(undefined)}
          />
        ) : (
          <p className={cx('-Muted')}>
            Pick a variable to edit, or make a new one.
          </p>
        )}
      </div>
    </div>
  );
}
