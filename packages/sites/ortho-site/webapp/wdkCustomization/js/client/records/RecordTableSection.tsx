import React, { useContext, useMemo } from 'react';

import { WdkService } from 'wdk-client/Core';
import { WdkDepdendenciesContext } from 'wdk-client/Hooks/WdkDependenciesEffect';
import {
  RecordInstance,
  getSingleRecordAnswerSpec
} from 'wdk-client/Utils/WdkModel';

import {
  RecordTableSectionProps,
  WrappedComponentProps
} from 'ortho-client/records/Types';

type Props = WrappedComponentProps<RecordTableSectionProps>;

export function RecordTableSection(DefaultComponent: React.ComponentType<WrappedComponentProps<RecordTableSectionProps>>) {
  return function OrthoRecordTableSection(props: Props) {
    let { table, record, ontologyProperties } = props;

    let wdkDependencies = useContext(WdkDepdendenciesContext);
    let wdkService = wdkDependencies?.wdkService;

    let downloadRecordTable = useMemo(
      () => downloadRecordTableFactory(wdkService, record, table.name),
      []
    )

    // FIXME Revise this since we now lazy load tables...
    let showDownload = (
      record.tables[table.name] &&
      record.tables[table.name].length > 0 &&
      ontologyProperties.scope?.includes('download')
    );

    return (
      <DefaultComponent {...props} table={Object.assign({}, table, {
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
                  onClick={downloadRecordTable}
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
}


function downloadRecordTableFactory(wdkService: WdkService | undefined, record: RecordInstance, tableName: string) {
  if (wdkService == null) {
    return undefined;
  }

  return function downloadRecordTable(event: React.MouseEvent) {
    let answerSpec = getSingleRecordAnswerSpec(record);
    let formatting = {
      format: 'tableTabular',
      formatConfig: {
        tables: [ tableName ],
        includeHeader: true,
        attachmentType: "text"
      }
    };
    return wdkService.downloadAnswer({ answerSpec, formatting });
  }
}
