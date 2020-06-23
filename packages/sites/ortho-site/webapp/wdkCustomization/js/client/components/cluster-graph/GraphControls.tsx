import React from 'react';

import { Checkbox } from 'wdk-client/Components';

import { EdgeTypeOption, EdgeType } from '../../utils/clusterGraph';

type Props = EdgeOptionsProps;

export function GraphControls({ edgeTypeOptions, selectEdgeTypeOption }: Props) {
  return (
    <div className="GraphControls">
      <EdgeOptions
        edgeTypeOptions={edgeTypeOptions}
        selectEdgeTypeOption={selectEdgeTypeOption}
      />
    </div>
  );
}

interface EdgeOptionsProps {
  edgeTypeOptions: EdgeTypeOption[];
  selectEdgeTypeOption: (selectedEdge: EdgeType, newValue: boolean) => void;
}

function EdgeOptions({ edgeTypeOptions, selectEdgeTypeOption }: EdgeOptionsProps) {
  return (
    <div className="EdgeOptions">
      <details open>
        <summary>
          Edge Options
        </summary>
        <div className="EdgeTypeOptions">
          {
            edgeTypeOptions.map(
              ({ key, display, isSelected }) =>
                <div className="EdgeTypeOption" key={key}>
                  <Checkbox
                    key={key}
                    value={isSelected}
                    onChange={newValue => selectEdgeTypeOption(key, newValue)}
                  />
                  <label>
                    {display}
                  </label>
                </div>
            )
          }
        </div>
      </details>
    </div>
  );
}
