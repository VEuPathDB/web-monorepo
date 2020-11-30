import React from 'react';
import { connect } from 'react-redux';

import {
  ActionCreatorServices,
  emptyAction
} from 'wdk-client/Core/WdkMiddleware';
import {
  RecordInstance,
  getSingleRecordAnswerSpec
} from 'wdk-client/Utils/WdkModel';

import {
  RecordTableSectionProps,
  WrappedComponentProps
} from 'ortho-client/records/Types';

function downloadRecordTable(record: RecordInstance, tableName: string) {
  return ({ wdkService }: ActionCreatorServices) => {
    let answerSpec = getSingleRecordAnswerSpec(record);
    let formatting = {
      format: 'tableTabular',
      formatConfig: {
        tables: [ tableName ],
        includeHeader: true,
        attachmentType: "text"
      }
    };
    wdkService.downloadAnswer({ answerSpec, formatting });
    return emptyAction;
  };
}

interface Props extends WrappedComponentProps<RecordTableSectionProps> {
  downloadRecordTable: (record: RecordInstance, tableName: string) => void;
}

export function RecordTableSection(DefaultComponent: React.ComponentType<WrappedComponentProps<RecordTableSectionProps>>) {
  return connect(null, { downloadRecordTable })(class ApiRecordTableSection extends React.PureComponent<Props> {
    render () {
      let { table, record, downloadRecordTable, ontologyProperties } = this.props;

      let callDownloadTable = (event: React.MouseEvent) => {
        event.stopPropagation();
        downloadRecordTable(record, table.name);
      };

      // FIXME Revise this since we now lazy load tables...
      let showDownload = (
        record.tables[table.name] &&
        record.tables[table.name].length > 0 &&
        ontologyProperties.scope?.includes('download')
      );

      return (
        <DefaultComponent {...this.props} table={Object.assign({}, table, {
          displayName: (
            <span>
              {table.displayName}
              {showDownload &&
                <span
                  style={{
                    fontSize: '.8em',
                    fontWeight: 'normal',
                    marginLeft: '1em'
                  }}>
                  <a
                    role="button"
                    tabIndex={0}
                    onClick={callDownloadTable}
                  >
                    <i className="fa fa-download"/> Download
                  </a>
                </span>
              }

            </span>
          )
        })}/>
      );
    }
  });
}
