import ScatterPlot from '../plots/ScatterPlot';
import React, { useState } from 'react';

export interface Props {
  studyId: string;
  xVariableId: string;
  yVariableId: string;
}

/**
 * Adapter to use scatter plot in ClinEpiDB workspace.
 * This would reside in ClinEpiWebsite.
 * @param props 
 */
export default function ScatterPlotAdapter(props: Props) {
  const { studyId, xVariableId, yVariableId } = props;
  const data = useClinEpiPlotReporter(studyId, xVariableId, yVariableId);
  const [ plotState, setPlotState ] = useState();
  return (
    <ScatterPlot
      data={[{
        x: data.xData,
        y: data.yData,
        name: 'foo'
      }]}
      xLabel={xVariableId}
      yLabel={yVariableId}
      height={200}
      width={200}
      onPlotUpdate={setPlotState}
    />
  )
}

// stubbed out functions
function useClinEpiPlotReporter(studyId: string, xVariableId: string, yVariableId: string) {
  // request data from wdk rest service and return response
  return {
    xData: generateNumberArray(20),
    yData: generateNumberArray(20)
  }
}

function generateNumberArray(size: number) {
  const array = [];
  let i = 0;
  while (i < size) {
    array.push(Math.random());
    i++;
  }
  return array;
}
