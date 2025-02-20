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
    rowData: { plot_configs_json, dataset_id, dataset_name, graph_ids },
    dataTable,
  } = props;

  const plotConfigs = parseJson(plot_configs_json as string);

  const [selectedPlotsIndex, setSelectedPlotsIndex] = useState([0]);
  const [selectedGraphIdIndex, setSelectedGraphIdIndex] = useState(0);
  const [dataTableCollapsed, setDataTableCollapsed] = useState(true);
  const [showLogScale, setShowLogScale] = useState(false);

  if (plotConfigs == null) {
    return <div>Could not parse plot_configs_json</div>;
  }

  const graphIds = graph_ids?.toString().split(/\s*,\s*/) ?? [];

  const selectedPlotConfigs = plotConfigs.filter((_, index) =>
    selectedPlotsIndex.includes(index)
  );

  return (
    <div>
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
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '2em' }}>
        <div>
          <h4>Choose gene for which to display graph</h4>
          {graphIds.map((graphId, index) => {
            return (
              <label key={graphId}>
                <input
                  type="radio"
                  checked={index === selectedGraphIdIndex}
                  onChange={() => setSelectedGraphIdIndex(index)}
                />{' '}
                {graphId}{' '}
              </label>
            );
          })}

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

          <h4>Graph options</h4>
          <div>
            <label>
              <input
                type="checkbox"
                checked={showLogScale}
                onChange={(e) => {
                  setShowLogScale(e.target.checked);
                }}
              />{' '}
              Show log Scale (not applicable for log(ratio) graphs, percentile
              graphs or data tables)
            </label>
          </div>
        </div>
        <div style={{ flex: '0 1 50%' }}>
          <h4>
            <Link to={`/record/dataset/${dataset_id}`}>
              Full Dataset Description
            </Link>
          </h4>
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
          {/*!isUserDataset ? (
            <CollapsibleSection
              className={'eupathdb-DatasetGraphDescription'}
              headerContent="Description"
              headerComponent="h4"
              isCollapsed={this.state.descriptionCollapsed}
              onCollapsedChange={this.handleDescriptionCollapseChange}
            >
              {safeHtml(description, {}, 'div')}
            </CollapsibleSection>
          ) : null*/}
        </div>
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
