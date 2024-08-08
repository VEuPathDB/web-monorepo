import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useStudyRecord } from '../../core';
import { DownloadsTabProps } from './types';
import Downloads from './Downloads';

export default function DownloadTabs(props: DownloadsTabProps) {
  const studyRecord = useStudyRecord();
  if (studyRecord == null) {
    return <Loading />;
  }
  if (typeof studyRecord.attributes.custom_download_tab === 'string') {
    return (
      <Banner
        banner={{
          type: 'info',
          message: safeHtml(
            studyRecord.attributes.custom_download_tab,
            null,
            'div'
          ),
        }}
      />
    );
  }
  return <Downloads {...props} />;
}
