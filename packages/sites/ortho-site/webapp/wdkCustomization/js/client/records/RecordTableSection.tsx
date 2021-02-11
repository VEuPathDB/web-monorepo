import React, { useContext, useMemo } from 'react';

import { WdkService } from 'wdk-client/Core';
import { WdkDepdendenciesContext } from 'wdk-client/Hooks/WdkDependenciesEffect';
import {
  RecordInstance,
  getSingleRecordAnswerSpec
} from 'wdk-client/Utils/WdkModel';
import { Props as RecordTableSectionProps } from 'wdk-client/Views/Records/RecordTable/RecordTableSection';
import { DefaultSectionTitle } from 'wdk-client/Views/Records/SectionTitle';

import { WrappedComponentProps } from 'ortho-client/records/Types';

type Props = WrappedComponentProps<RecordTableSectionProps>;

export function RecordTableSection(DefaultComponent: React.ComponentType<WrappedComponentProps<RecordTableSectionProps>>) {
  return function OrthoRecordTableSection(props: Props) {
    const { table, record, ontologyProperties } = props;

    const wdkDependencies = useContext(WdkDepdendenciesContext);
    const wdkService = wdkDependencies?.wdkService;

    const downloadRecordTable = useMemo(
      () => downloadRecordTableFactory(wdkService, record, table.name),
      [ wdkService, record, table.name ]
    );

    // FIXME Revise this since we now lazy load tables...
    const showDownload = (
      record.tables[table.name] &&
      record.tables[table.name].length > 0 &&
      ontologyProperties.scope?.includes('download')
    );

    const title = (
      <span>
        <DefaultSectionTitle
          displayName={table.displayName}
          help={table.help}
        />
        {' '}
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
    );

    return <DefaultComponent {...props} title={title} />;
  }
}


function downloadRecordTableFactory(wdkService: WdkService | undefined, record: RecordInstance, tableName: string) {
  if (wdkService == null) {
    return undefined;
  }

  return function downloadRecordTable(event: React.MouseEvent) {
    event.stopPropagation();

    const answerSpec = getSingleRecordAnswerSpec(record);
    const formatting = {
      format: 'tableTabular',
      formatConfig: {
        tables: [ tableName ],
        includeHeader: true,
        attachmentType: 'text'
      }
    };
    return wdkService.downloadAnswer({ answerSpec, formatting });
  }
}
