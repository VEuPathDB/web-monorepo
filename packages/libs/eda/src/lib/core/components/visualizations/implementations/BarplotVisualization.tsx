// load Barplot component
import Barplot from '@veupathdb/components/lib/plots/Barplot';
import { ErrorManagement } from '@veupathdb/components/lib/types/general';

import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

// need to set for Barplot
import { DataClient, BarplotRequestParams } from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { Variable } from '../../../types/variable';

//DKDK need to check which variable is suitable tableVariable/isTableVariable fit to the condition of overlayVariable
import { isTableVariable, isHistogramVariable } from '../../filter/guards';
// import { ScatterplotVariable } from '../../filter/types';

import { InputVariables } from '../InputVariables';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

export const barplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  return <BarplotViz {...props} fullscreen={false} />;
}

// this needs a handling of text/image for scatter, line, and density plots
function SelectorComponent() {
  return <div>Pick me, I'm a Bar Plot!</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  return <BarplotViz {...props} fullscreen />;
}

function createDefaultConfig(): BarplotConfig {
  return {
    enableOverlay: true,
  };
}

type BarplotConfig = t.TypeOf<typeof BarplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BarplotConfig = t.intersection([
  t.type({
    enableOverlay: t.boolean,
  }),
  t.partial({
    xAxisVariable: Variable,
    overlayVariable: Variable,
  }),
]);

type Props = VisualizationProps & {
  fullscreen: boolean;
};

function BarplotViz(props: Props) {
  const {
    computation,
    visualization,
    updateVisualization,
    filters,
    fullscreen,
    dataElementConstraints,
    dataElementDependencyOrder,
    starredVariables,
    toggleStarredVariable,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useMemo(
    () =>
      Array.from(preorder(studyMetadata.rootEntity, (e) => e.children || [])),
    [studyMetadata]
  );
  const dataClient: DataClient = useDataClient();

  const vizConfig = useMemo(() => {
    return pipe(
      BarplotConfig.decode(visualization.configuration),
      getOrElse((): t.TypeOf<typeof BarplotConfig> => createDefaultConfig())
    );
  }, [visualization.configuration]);

  const updateVizConfig = useCallback(
    (newConfig: Partial<BarplotConfig>) => {
      if (updateVisualization) {
        updateVisualization({
          ...visualization,
          configuration: {
            ...vizConfig,
            ...newConfig,
          },
        });
      }
    },
    [updateVisualization, visualization, vizConfig]
  );

  const handleInputVariableChange = useCallback(
    (
      values: Record<
        string,
        { entityId: string; variableId: string } | undefined
      >
    ) => {
      const { xAxisVariable, overlayVariable } = values;
      updateVizConfig({
        xAxisVariable,
        overlayVariable,
      });
    },
    [updateVizConfig, vizConfig]
  );

  const findVariable = useCallback(
    (variable?: Variable) => {
      if (variable == null) return undefined;
      return entities
        .find((e) => e.id === variable.entityId)
        ?.variables.find((v) => v.id === variable.variableId);
    },
    [entities]
  );

  const data = usePromise(
    // set any for now
    // useCallback(async (): Promise<BarplotData> => {
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findVariable(vizConfig.xAxisVariable);
      const overlayVariable = findVariable(vizConfig.overlayVariable);

      // check variable inputs and add densityplot
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return Promise.reject(new Error('Please choose a X-axis variable'));
      // overlay
      else if (
        vizConfig.overlayVariable != null &&
        overlayVariable != null &&
        !isTableVariable(overlayVariable)
      )
        return Promise.reject(
          new Error(
            `'${overlayVariable.displayName}' is not suitable for this plot. Only categorical, binary, or ordinal type is allowed for the Overlay variable.`
          )
        );

      // add visualization.type here. valueSpec too?
      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable!,
        vizConfig.enableOverlay ? vizConfig.overlayVariable : undefined,
        // add visualization.type
        visualization.type
      );

      // barplot
      const response = dataClient.getBarplot(
        computation.type,
        params as BarplotRequestParams
      );

      // send visualization.type as well
      return barplotResponseToData(await response, visualization.type);
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      findVariable,
      computation.type,
      visualization.type,
    ])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {fullscreen && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'x-axis variable',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay variable (Optional)',
              },
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
              overlayVariable: vizConfig.overlayVariable,
            }}
            onChange={handleInputVariableChange}
            constraints={dataElementConstraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
            starredVariables={starredVariables}
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
      )}

      {data.pending && (
        <Loading style={{ position: 'absolute', top: '-1.5em' }} radius={2} />
      )}
      {data.error && fullscreen && (
        <div
          style={{
            fontSize: '1.2em',
            padding: '1em',
            background: 'rgb(255, 233, 233) none repeat scroll 0% 0%',
            borderRadius: '.5em',
            margin: '.5em 0',
            color: '#333',
            border: '1px solid #d9cdcd',
            display: 'flex',
          }}
        >
          <i className="fa fa-warning" style={{ marginRight: '1ex' }}></i>{' '}
          {data.error instanceof Error
            ? data.error.message
            : String(data.error)}
        </div>
      )}
      {data.value ? (
        fullscreen ? (
          <BarplotWithControls
            // data.value
            data={data.value}
            // width={1000}
            // height={600}
            orientation={'vertical'}
            barLayout={'group'}
            displayLegend={data.value?.series.length > 1}
            independentAxisLabel={'Label'}
            dependentAxisLabel={'Count'}
          />
        ) : (
          // thumbnail/grid view
          <Barplot
            data={data.value}
            width={230}
            height={165}
            //DKDK check this option (possibly plot control?)
            orientation={'vertical'}
            barLayout={'group'}
            //DKDK show/hide independent/dependent axis tick label
            showIndependentAxisTickLabel={false}
            showDependentAxisTickLabel={false}
            // new props for better displaying grid view
            displayLegend={false}
            displayLibraryControls={false}
            staticPlot={true}
            //DKDK set margin for better display at thumbnail/grid view
            margin={{ l: 30, r: 20, b: 0, t: 20 }}
          />
        )
      ) : (
        //DKDK no data case
        <Barplot
          data={{ series: [] }}
          width={fullscreen ? 1000 : 230}
          height={fullscreen ? 600 : 165}
          orientation={'vertical'}
          barLayout={'group'}
          independentAxisLabel={fullscreen ? 'Label' : undefined}
          dependentAxisLabel={fullscreen ? 'Count' : undefined}
          //DKDK show/hide independent/dependent axis tick label
          showIndependentAxisTickLabel={fullscreen ? undefined : false}
          showDependentAxisTickLabel={fullscreen ? undefined : false}
          displayLegend={fullscreen ? true : false}
          displayLibraryControls={false}
          staticPlot={fullscreen ? false : true}
          margin={fullscreen ? {} : { l: 30, r: 20, b: 0, t: 20 }}
        />
      )}
    </div>
  );
}

function BarplotWithControls({
  data,
  vizType,
  ...BarplotProps
}: //
// }: BarplotWithControlsProps) {
any) {
  // TODO Use UIState
  const errorManagement = useMemo((): ErrorManagement => {
    return {
      errors: [],
      addError: (error: Error) => {},
      removeError: (error: Error) => {},
      clearAllErrors: () => {},
    };
  }, []);

  // console.log('BarplotWithControls.data = ', data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Barplot
        {...BarplotProps}
        data={data}
        // add controls
        // displayLegend={true}
        displayLibraryControls={false}
      />
      {/* DKDK potential BarplotControls: commented out for now  */}
      {/* <BarplotControls
          label="Scatter Plot Controls"
          errorManagement={errorManagement}
        /> */}
    </div>
  );
}

/**
 * Reformat response from Scatter Plot endpoints into complete BarplotData
 * @param response
 * @returns BarplotData
 */
//DKDK add densityplot
export function barplotResponseToData(
  response: PromiseType<ReturnType<DataClient['getBarplot']>>,
  // vizType may be used for handling other plots in this component like line and density
  vizType: string
): any {
  // console.log('visualization type at BarplotResponseToData = ', vizType);
  // console.log('response.data =', response);

  return {
    series: response.barplot.data.map((data, index) => ({
      //DKDK name has value if using overlay variable
      name: data.overlayVariableDetails?.value ?? `series ${index}`,
      // color: TO DO
      label: data.label,
      value: data.value,
    })),
  };
}

// add an extended type
type getRequestParamsProps = BarplotRequestParams & { vizType?: string };

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: Variable,
  overlayVariable?: Variable,
  // add visualization.type
  vizType?: string
): getRequestParamsProps {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: xAxisVariable.entityId,
      xAxisVariable: xAxisVariable,
      overlayVariable: overlayVariable,
      //DKDK valueSpec: manually inputted for now
      valueSpec: 'count',
      //DKDK this works too
      // valueSpec: 'proportion',
      // valueSpec: 'identity',
    },
  } as BarplotRequestParams;
}
