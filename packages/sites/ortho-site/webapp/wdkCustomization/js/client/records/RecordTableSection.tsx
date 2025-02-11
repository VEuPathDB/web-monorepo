import React, { useContext, useMemo } from 'react';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import {
  RecordInstance,
  getSingleRecordAnswerSpec,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as RecordTableSectionProps } from '@veupathdb/wdk-client/lib/Views/Records/RecordTable/RecordTableSection';
import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';

import { WrappedComponentProps } from 'ortho-client/records/Types';

type Props = WrappedComponentProps<RecordTableSectionProps>;

export function RecordTableDescription(
  DefaultComponent: React.ComponentType<
    WrappedComponentProps<RecordTableSectionProps>
  >
) {
  return function OrthoRecordTableDescription(props: Props) {
    const { table, record, ontologyProperties } = props;

    const wdkDependencies = useContext(WdkDependenciesContext);
    const wdkService = wdkDependencies?.wdkService;

    const downloadRecordTable = useMemo(
      () => downloadRecordTableFactory(wdkService, record, table.name),
      [wdkService, record, table.name]
    );

    const showDownload =
      record.tables[table.name] &&
      record.tables[table.name].length > 0 &&
      ontologyProperties.scope?.includes('download');

    const links = (
      <div style={{ marginBottom: '1em' }}>
        {showDownload && (
          <span
            style={{
              fontSize: '.8em',
              fontWeight: 'normal',
            }}
          >
            <button
              type="button"
              className="wdk-Link"
              onClick={downloadRecordTable}
            >
              <i className="fa fa-download" /> Download
            </button>
          </span>
        )}
      </div>
    );

    return (
      <>
        {links}
        <DefaultComponent {...props} />
      </>
    );
  };
}

function downloadRecordTableFactory(
  wdkService: WdkService | undefined,
  record: RecordInstance,
  tableName: string
) {
  if (wdkService == null) {
    return undefined;
  }

  return function downloadRecordTable(event: React.MouseEvent) {
    event.stopPropagation();

    const answerSpec = getSingleRecordAnswerSpec(record);
    const formatting = {
      format: 'tableTabular',
      formatConfig: {
        tables: [tableName],
        includeHeader: true,
        attachmentType: 'text',
      },
    };
    return wdkService.downloadAnswer({ answerSpec, formatting });
  };
}
