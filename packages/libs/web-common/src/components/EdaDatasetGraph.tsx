import {
  RecordClass,
  RecordInstance,
  TableField,
  TableValue,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import * as t from 'io-ts';
import { useState } from 'react';
import { EdaScatterPlot } from './eda/EdaScatterPlot';
import { Link } from 'react-router-dom';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';

const PlotConfig = t.type({
  plotName: t.string,
  plotType: t.string,
  xAxisEntityId: t.string,
  xAxisVariableId: t.string,
  yAxisEntityId: t.string,
  yAxisVariableId: t.string,
});

const PlotConfigs = t.array(PlotConfig);

type RowData = TableValue[number];

interface RecordTableProps {
  record: RecordInstance;
  recordClass: RecordClass;
  value: TableValue;
  table: TableField;
  className?: string;
  searchTerm?: string;
  onSearchTermChange?: (searchTerm: string) => void;
}

interface DataTable {
  value: TableValue;
  table: TableField;
  record: RecordInstance;
  recordClass: RecordClass;
  DefaultComponent: React.ComponentType<RecordTableProps>;
}

interface Props {
  rowIndex: number;
  rowData: RowData;
  dataTable: DataTable;
}

export function EdaDatasetGraph(props: Props) {
  const {
    rowData: {
      plot_configs_json,
      dataset_id,
      dataset_name,
      graph_ids,
      source_id,
      default_graph_id,
    },
    dataTable,
  } = props;

  const plotConfigs = parseJson(plot_configs_json as string);

  const [selectedPlotsIndex, setSelectedPlotsIndex] = useState([0]);
  const [dataTableCollapsed, setDataTableCollapsed] = useState(true);

  if (plotConfigs == null) {
    return <div>Could not parse plot_configs_json</div>;
  }

  const graphIds = graph_ids?.toString().split(/\s*,\s*/);

  const selectedPlotConfigs = plotConfigs.filter((_, index) =>
    selectedPlotsIndex.includes(index)
  );

  return (
    <div>
      <h4>Choose graph(s) to display</h4>
      {plotConfigs.map((plotConfig, index) => {
        return (
          <label key={plotConfig.plotName}>
            <input
              type="checkbox"
              checked={selectedPlotsIndex.includes(index)}
              onChange={(e) => {
                setSelectedPlotsIndex((current) => {
                  return e.target.checked
                    ? current.concat(index).sort()
                    : current.filter((i) => i !== index);
                });
              }}
            />{' '}
            {plotConfig.plotName}{' '}
          </label>
        );
      })}

      {default_graph_id !== source_id ? (
        <div>
          <strong style={{ color: 'firebrick' }}>WARNING</strong>: This Gene (
          {source_id as string}) does not have data for this experiment.
          Instead, we are showing data for this same gene(s) from the reference
          strain for this species. This may or may NOT accurately represent the
          gene you are interested in.{' '}
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {selectedPlotConfigs.map((plotConfig) => {
          const xAxisVariable = {
            entityId: plotConfig.xAxisEntityId,
            variableId: plotConfig.xAxisVariableId,
          };
          const yAxisVariable = {
            entityId: plotConfig.yAxisEntityId,
            variableId: plotConfig.yAxisVariableId,
          };
          return (
            <div style={{ width: 500 }}>
              <EdaScatterPlot
                datasetId={dataset_id as string}
                xAxisVariable={xAxisVariable}
                yAxisVariable={yAxisVariable}
                highlightSpec={
                  graphIds && {
                    ids: graphIds,
                    // gene id
                    variableId: 'VAR_bdc8e679',
                    entityId: plotConfig.xAxisEntityId,
                    traceName: source_id?.toString(),
                  }
                }
              />
            </div>
          );
        })}
      </div>
      <div>
        <div style={{ display: 'flex', gap: '3ex' }}>
          {/* <h4>
            <Link
              to={`/workspace/analyses/${dataset_id}/new/visualizations/new`}
            >
              Use the Study Explorer for more advanced plot options
            </Link>
          </h4>
         */}
          <h4>
            <Link to={`/record/dataset/${dataset_id}`}>
              See the full dataset description
            </Link>
          </h4>
        </div>

        {props.dataTable && (
          <CollapsibleSection
            className={'eupathdb-' + props.dataTable.table.name + 'Container'}
            headerContent="Data table"
            headerComponent="h4"
            isCollapsed={dataTableCollapsed}
            onCollapsedChange={setDataTableCollapsed}
          >
            <dataTable.DefaultComponent
              record={dataTable.record}
              recordClass={dataTable.recordClass}
              table={dataTable.table}
              value={dataTable.value.filter(
                (dat) => dat.dataset_id === dataset_name
              )}
            />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}

function parseJson(json: string) {
  try {
    const object = JSON.parse(json);
    if (PlotConfigs.is(object)) {
      return object;
    }
    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
