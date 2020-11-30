import React from 'react';
import { connect } from 'react-redux';

import { emptyAction } from 'wdk-client/Core/WdkMiddleware';
import { getSingleRecordAnswerSpec } from 'wdk-client/Utils/WdkModel';

function downloadRecordTable(record, tableName) {
  return ({ wdkService }) => {
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

export function RecordTableSection(DefaultComponent) {
  return connect(null, { downloadRecordTable })(class ApiRecordTableSection extends React.PureComponent {
    render () {

      let { table, record, downloadRecordTable, ontologyProperties } = this.props;

      let callDownloadTable = event => {
        event.stopPropagation();
        downloadRecordTable(record, table.name);
      };

      // FIXME Revise this since we now lazy load tables...
      let showDownload = (
        record.tables[table.name] &&
        record.tables[table.name].length > 0 &&
        ontologyProperties.scope.includes('download')
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
                  <button type="button"
                    className="wdk-Link"
                    onClick={callDownloadTable}>
                    <i className="fa fa-download"/> Download
                  </button>
                </span>
              }

            </span>
          )
        })}/>
      );
    }
  });
}
