import ScatterPlot from '../plots/scatter-plot';
import { useState } from 'react';

interface Props {
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
      xData={data.xData}
      yData={data.yData}
      xLabel={xVariableId}
      yLabel={yVariableId}
      onUpdate={setPlotState}
    />
  )
}

// stubbed out functions
function useClinEpiPlotReporter(studyId: string, xVariableId: string, yVariableId: string) {
  // request data from wdk rest service and return response
  return {
    xData: [1,2,3],
    yData: [4,5,6]
  }
}
