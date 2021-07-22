// load Barplot component
import Barplot, { BarplotProps } from '@veupathdb/components/lib/plots/Barplot';
import LabelledGroup from '@veupathdb/components/lib/components/widgets/LabelledGroup';
import RadioButtonGroup from '@veupathdb/components/lib/components/widgets/RadioButtonGroup';
import Switch from '@veupathdb/components/lib/components/widgets/Switch';

import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

// need to set for Barplot
import { DataClient, BarplotRequestParams } from '../../../api/data-api';

import { usePromise } from '../../../hooks/promise';
import { useFindEntityAndVariable } from '../../../hooks/study';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { Filter } from '../../../types/filter';
import { PromiseType } from '../../../types/utility';
import { VariableDescriptor } from '../../../types/variable';

import { VariableCoverageTable } from '../../VariableCoverageTable';

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
  return {
    dependentAxisLogScale: false,
    valueSpec: 'count',
  };
}

type ValueSpec = t.TypeOf<typeof ValueSpec>;
const ValueSpec = t.keyof({ count: null, proportion: null });

type BarplotConfig = t.TypeOf<typeof BarplotConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const BarplotConfig = t.intersection([
  t.type({
    dependentAxisLogScale: t.boolean,
    valueSpec: ValueSpec,
  }),
  t.partial({
    xAxisVariable: VariableDescriptor,
    overlayVariable: VariableDescriptor,
    facetVariable: VariableDescriptor,
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

  const onDependentAxisLogScaleChange = useCallback(
    (newState?: boolean) => {
      updateVizConfig({
        dependentAxisLogScale: newState,
      });
    },
    [updateVizConfig]
  );

  const onValueSpecChange = useCallback(
    (newValueSpec: ValueSpec) => {
      updateVizConfig({
        valueSpec: newValueSpec,
      });
    },
    [updateVizConfig]
  );

  const findEntityAndVariable = useFindEntityAndVariable(entities);

  const data = usePromise(
    useCallback(async (): Promise<any> => {
      const xAxisVariable = findEntityAndVariable(vizConfig.xAxisVariable);

      // check variable inputs: this is necessary to prevent from data post
      if (vizConfig.xAxisVariable == null || xAxisVariable == null)
        return undefined;

      // add visualization.type here
      const params = getRequestParams(studyId, filters ?? [], vizConfig);

      // barplot
      const response = dataClient.getBarplot(
        computation.type,
        params as BarplotRequestParams
      );

      // send visualization.type as well
      return barplotResponseToData(await response);
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig.xAxisVariable,
      vizConfig.overlayVariable,
      vizConfig.facetVariable,
      vizConfig.valueSpec,
      findEntityAndVariable,
      computation.type,
    ])
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
              valueSpec={vizConfig.valueSpec}
              onValueSpecChange={onValueSpecChange}
              dependentAxisLogScale={vizConfig.dependentAxisLogScale}
              onDependentAxisLogScaleChange={onDependentAxisLogScaleChange}
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
          dependentAxisLogScale={vizConfig.dependentAxisLogScale}
        />
      )}
    </div>
  );
}

type BarplotWithControlsProps = BarplotProps & {
  dependentAxisLogScale: boolean;
  onDependentAxisLogScaleChange: (newState: boolean) => void;
  valueSpec: ValueSpec;
  onValueSpecChange: (newValueSpec: ValueSpec) => void;
};

function BarplotWithControls({
  data,
  dependentAxisLogScale,
  onDependentAxisLogScaleChange,
  valueSpec,
  onValueSpecChange,
  ...barPlotProps
}: BarplotWithControlsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Barplot
        {...barPlotProps}
        dependentAxisLogScale={dependentAxisLogScale}
        data={data}
        // add controls
        // displayLegend={true}
        displayLibraryControls={false}
      />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <LabelledGroup label="Y-axis">
          <Switch
            label="Log Scale:"
            state={dependentAxisLogScale}
            onStateChange={onDependentAxisLogScaleChange}
          />
          <RadioButtonGroup
            selectedOption={
              valueSpec === 'proportion' ? 'proportional' : 'count'
            }
            options={['count', 'proportional']}
            onOptionSelected={(newOption) => {
              if (newOption === 'proportional') {
                onValueSpecChange('proportion');
              } else {
                onValueSpecChange('count');
              }
            }}
          />
        </LabelledGroup>
      </div>
    </div>
  );
}

/**
 * Reformat response from Barplot endpoints into complete BarplotData
 * @param response
 * @returns BarplotData
 */
export function barplotResponseToData(
  response: PromiseType<ReturnType<DataClient['getBarplot']>>
) {
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
  vizConfig: BarplotConfig
): BarplotRequestParams {
  return {
    studyId,
    filters,
    config: {
      // is outputEntityId correct?
      outputEntityId: vizConfig.xAxisVariable!.entityId,
      xAxisVariable: vizConfig.xAxisVariable!,
      overlayVariable: vizConfig.overlayVariable,
      // valueSpec: manually inputted for now
      valueSpec: vizConfig.valueSpec,
    },
  } as BarplotRequestParams;
}
