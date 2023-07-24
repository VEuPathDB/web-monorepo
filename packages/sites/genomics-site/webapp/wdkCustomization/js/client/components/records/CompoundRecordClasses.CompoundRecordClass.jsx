import React, { Component } from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { pure } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { CompoundStructure } from '../common/Compound';
import DatasetGraph from '@veupathdb/web-common/lib/components/DatasetGraph';

let expressionRE = /MassSpecGraphs$/;
export function RecordTable(props) {
  return props.table.name === 'Structures' ? (
    <CompoundStructures {...props} />
  ) : expressionRE.test(props.table.name) ? (
    <DatasetGraphTable {...props} />
  ) : (
    <props.DefaultComponent {...props} />
  );
}

/**
 * Render Structures table as 2D drawings of structure.
 */
class CompoundStructures extends Component {
  constructor(props) {
    super(props);
    this.state = { otherVisible: false };
    this.toggleOther = () => {
      this.setState({ otherVisible: !this.state.otherVisible });
    };
  }

  render() {
    let [primary, ...other] = this.props.value;
    return (
      <div className="eupathdb-CompoundStructures">
        <div>
          <CompoundStructure moleculeString={primary.structure} />
        </div>
        {other.length > 0 && (
          <CollapsibleSection
            headerContent="Alternate compound structures"
            onCollapsedChange={this.toggleOther}
            isCollapsed={!this.state.otherVisible}
            className="eupathdb-OtherCompoundStructures"
          >
            {other.map((row) => {
              return (
                <CompoundStructure
                  key={row.struct_num}
                  moleculeString={row.structure}
                />
              );
            })}
          </CollapsibleSection>
        )}
      </div>
    );
  }
}

const DatasetGraphTable = pure(function DatasetGraphTable(props) {
  let dataTable = Object.assign(
    {},
    {
      value: props.record.tables.MassSpecGraphsDataTable,
      table: props.recordClass.tables.find(
        (obj) => obj.name == 'MassSpecGraphsDataTable'
      ),
      record: props.record,
      recordClass: props.recordClass,
      DefaultComponent: props.DefaultComponent,
    }
  );

  return (
    <props.DefaultComponent
      {...props}
      childRow={(childProps) => (
        <DatasetGraph
          rowData={props.value[childProps.rowIndex]}
          dataTable={dataTable}
        />
      )}
    />
  );
});
