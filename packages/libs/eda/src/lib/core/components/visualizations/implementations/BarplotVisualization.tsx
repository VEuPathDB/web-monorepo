// load Barplot component
import Barplot, { BarplotProps } from '@veupathdb/components/lib/plots/Barplot';
import { BarplotData } from '@veupathdb/components/lib/types/plots';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

// need to set for Barplot
import {
  DataClient,
  BarplotResponse,
  BarplotRequestParams,
} from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';
import { CoverageStatistics } from '../../../types/visualization';

import { InputVariables } from '../InputVariables';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

import bar from './selectorIcons/bar.svg';

export const barplotVisualization: VisualizationType = {
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function GridComponent(props: VisualizationProps) {
  return <BarplotViz {...props} fullscreen={false} />;
}

function SelectorComponent() {
  return (
    <img alt="Bar plot" style={{ height: '100%', width: '100%' }} src={bar} />
  );
}

function FullscreenComponent(props: VisualizationProps) {
  return <BarplotViz {...props} fullscreen />;
}

function createDefaultConfig(): BarplotConfig {
  return {};
}

type BarplotConfig = t.TypeOf<typeof BarplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BarplotConfig = t.partial({
  xAxisVariable: VariableDescriptor,
  overlayVariable: VariableDescriptor,
  facetVariable: VariableDescriptor,
});

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

  // TODO Handle facetVariable
  const handleInputVariableChange = useCallback(
    (
      values: Record<
        string,
        { entityId: string; variableId: string } | undefined
      >
    ) => {
      const { xAxisVariable, overlayVariable, facetVariable } = values;
      updateVizConfig({
        xAxisVariable,
        overlayVariable,
        facetVariable,
      });
    },
    [updateVizConfig]
  );

  const findEntityAndVariable = useFindEntityAndVariable(entities);
  const { variable } = useMemo(() => {
    return (
      findEntityAndVariable(vizConfig.xAxisVariable) ?? { variable: undefined }
    );
  }, [vizConfig.xAxisVariable]);

  const data = usePromise(
    useCallback(async (): Promise<any> => {
      if (variable == null) return undefined;

      const params = getRequestParams(
        studyId,
        filters ?? [],
        vizConfig.xAxisVariable!,
        vizConfig.overlayVariable
      );

      const response = dataClient.getBarplot(
        computation.type,
        params as BarplotRequestParams
      );

      return barplotResponseToData(await response);
    }, [studyId, filters, dataClient, vizConfig, variable, computation.type])
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {fullscreen && (
        <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
          <InputVariables
            inputs={[
              {
                name: 'xAxisVariable',
                label: 'Main',
              },
              {
                name: 'overlayVariable',
                label: 'Overlay (optional)',
              },
              {
                name: 'facetVariable',
                label: 'Facet (optional)',
              },
            ]}
            entities={entities}
            values={{
              xAxisVariable: vizConfig.xAxisVariable,
              overlayVariable: vizConfig.overlayVariable,
              facetVariable: vizConfig.facetVariable,
            }}
            onChange={handleInputVariableChange}
            constraints={dataElementConstraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
            starredVariables={starredVariables}
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
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
      {fullscreen ? (
        <>
          <OutputEntityTitle
            entity={findEntityAndVariable(vizConfig.xAxisVariable)?.entity}
            outputSize={data.pending ? undefined : data.value?.outputSize}
          />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <BarplotWithControls
              data={data.value && !data.pending ? data.value : { series: [] }}
              containerStyles={{
                width: '750px',
                height: '450px',
              }}
              orientation={'vertical'}
              barLayout={'group'}
              displayLegend={
                data.value &&
                (data.value.series.length > 1 ||
                  vizConfig.overlayVariable != null)
              }
              independentAxisLabel={
                findEntityAndVariable(vizConfig.xAxisVariable)?.variable
                  .displayName ?? 'Main'
              }
              dependentAxisLabel={'Count'}
              legendTitle={
                findEntityAndVariable(vizConfig.overlayVariable)?.variable
                  .displayName
              }
              interactive
              showSpinner={data.pending}
              categoricalAxisCategoryOrder={variable?.vocabulary}
            />
            <VariableCoverageTable
              completeCases={
                data.pending ? undefined : data.value?.completeCases
              }
              filters={filters}
              outputEntityId={vizConfig.xAxisVariable?.entityId}
              variableSpecs={[
                {
                  role: 'Main',
                  required: true,
                  display: findEntityAndVariable(vizConfig.xAxisVariable)
                    ?.variable.displayName,
                  variable: vizConfig.xAxisVariable,
                },
                {
                  role: 'Overlay',
                  display: findEntityAndVariable(vizConfig.overlayVariable)
                    ?.variable.displayName,
                  variable: vizConfig.overlayVariable,
                },
              ]}
            />
          </div>
        </>
      ) : (
        // thumbnail/grid view
        <Barplot
          data={data.value && !data.pending ? data.value : { series: [] }}
          containerStyles={{
            width: '230px',
            height: '150px',
          }}
          // check this option (possibly plot control?)
          orientation={'vertical'}
          barLayout={'group'}
          // show/hide independent/dependent axis tick label
          showIndependentAxisTickLabel={false}
          showDependentAxisTickLabel={false}
          // new props for better displaying grid view
          displayLegend={false}
          displayLibraryControls={false}
          interactive={false}
          // set margin for better display at thumbnail/grid view
          spacingOptions={{
            marginLeft: 30,
            marginRight: 20,
            marginBottom: 0,
            marginTop: 20,
          }}
          showSpinner={data.pending}
          categoricalAxisCategoryOrder={variable?.vocabulary}
        />
      )}
    </div>
  );
}

type BarplotWithControlsProps = BarplotProps & {
  vizType?: string;
};

function BarplotWithControls({
  data,
  vizType,
  ...BarplotControlsProps
}: // eslint-disable-next-line @typescript-eslint/no-unused-vars
BarplotWithControlsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Barplot
        {...BarplotControlsProps}
        data={data}
        // add controls
        // displayLegend={true}
        displayLibraryControls={false}
      />
      {/* potential BarplotControls: commented out for now  */}
      {/* <BarplotControls
          label="Bar Plot Controls"
          errorManagement={errorManagement}
        /> */}
    </div>
  );
}

/**
 * Reformat response from Barplot endpoints into complete BarplotData
 * @param response
 * @returns BarplotData & completeCases & outputSize
 */
export function barplotResponseToData(
  response: BarplotResponse
): BarplotData & CoverageStatistics {
  return {
    series: response.barplot.data.map((data, index) => ({
      // name has value if using overlay variable
      name: data.overlayVariableDetails?.value ?? `series ${index}`,
      // color: TO DO
      label: data.label,
      value: data.value,
    })),
    completeCases: response.completeCasesTable,
    outputSize: response.barplot.config.completeCases,
  };
}

function getRequestParams(
  studyId: string,
  filters: Filter[],
  xAxisVariable: VariableDescriptor,
  overlayVariable?: VariableDescriptor
): BarplotRequestParams {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: xAxisVariable.entityId,
      xAxisVariable: xAxisVariable,
      overlayVariable: overlayVariable,
      // valueSpec: manually inputted for now
      valueSpec: 'count',
      barMode: 'group', // or 'stack'
      // this works too
      // valueSpec: 'proportion',
      // valueSpec: 'identity',
    },
  } as BarplotRequestParams;
}
