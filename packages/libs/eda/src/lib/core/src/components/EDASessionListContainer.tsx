import React from 'react';
import { SessionStore, SessionListContext } from '../hooks/useSession';
import { StudyMetadataStore, useWdkStudyRecord, useStudyMetadata, StudyContext } from '../hooks/useStudy';
import { usePromise } from '../hooks/usePromise';
import { LoadError } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  sessionStore: SessionStore;
  studyMetadataStore: StudyMetadataStore;
}

export function EDASessionListContainer(props: Props) {
  const { studyId, studyMetadataStore, sessionStore, className = 'EDAWorkspace', children } = props;
  const studyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, studyMetadataStore);
  const sessionList = usePromise(async () => {
    const list = await sessionStore.getSessions();
    return list.filter(a => a.studyId == studyId);
  }, [sessionStore]);
  if (studyMetadata.error || sessionList.error) return <LoadError/>
  if (studyRecordState == null || studyMetadata.value == null || sessionList.value == null) return null;
  return (
    <div className={className}>
      <StudyContext.Provider value={{ ...studyRecordState, studyMetadata: studyMetadata.value }}>
        <SessionListContext.Provider value={sessionList.value}>
          {children}
        </SessionListContext.Provider>
      </StudyContext.Provider>
    </div>
  )
}
