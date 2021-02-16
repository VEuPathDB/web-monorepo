import React from 'react';
import { useHistory } from 'react-router';
import { cx } from './Utils';
import { ActionIconButton } from './ActionIconButton';
import { Session } from '@veupathdb/eda-workspace-core';
import { SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  session: Session;
  setSessionName: (name: string) => void;
  copySession: () => Promise<string>;
  saveSession: () => void;
  deleteSession: () => void;
}

export function SessionSummary(props: Props) {
  const {
    session,
    setSessionName,
    copySession,
    saveSession,
    deleteSession,
  } = props;
  const history = useHistory();
  const handleCopy = async () => {
    const id = await copySession();
    history.push(id);
  };
  return (
    <div className={cx('-SessionSummary')}>
      <SaveableTextEditor
        className={cx('-SessionNameEditBox')}
        value={session.name}
        onSave={setSessionName}
      />
      <ActionIconButton
        iconClassName="clone"
        hoverText="Copy session"
        action={handleCopy}
      />
      <ActionIconButton
        iconClassName="floppy-o"
        hoverText="Save session"
        action={saveSession}
      />
      <ActionIconButton
        iconClassName="trash"
        hoverText="Delete session"
        action={deleteSession}
      />
    </div>
  );
}
