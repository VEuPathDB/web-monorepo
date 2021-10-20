import React, { useEffect, useRef, useState } from 'react';

import { partition } from 'lodash';

import { Dialog, TextArea } from '@veupathdb/wdk-client/lib/Components';

import { cx } from './StudyAccess';

export const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


export interface Props {
  title: React.ReactNode;
  content: React.ReactNode;
  onClose: () => void;
}

export function UserTableDialog({
  title,
  content,
  onClose
}: Props) {
  return (
    <Dialog
      className={cx('--UserTableDialog')}
      title={title}
      open
      onClose={onClose}
      modal
    >
      {content}
    </Dialog>
  );
}

export type ContentProps =
  | { type: 'access-denial' } & AccessDenialContentProps
  | { type: 'add-users' } & AddUsersContentProps
  | { type: 'users-added' } & UsersAddedContentProps;

export interface AccessDenialContentProps {
  userName: string;
  onSubmit: (denialReason: string) => void;
}

export function AccessDenialContent({ onSubmit, userName }: AccessDenialContentProps) {
  const [ denialReason, setDenialReason ] = useState('');

  return (
    <form
      className={cx('--AccessDenialContent')}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(denialReason);
      }}
    >
      <div className={cx('--AccessDenialReason')}>
        <p>You are denying {userName} access to this study. Please provide a reason:</p>
        <TextArea
          required
          value={denialReason}
          onChange={setDenialReason}
          rows={6}
          cols={100}
        />
      </div>
      <div className={cx('--AccessDenialSubmit')}>
        <button
          type="submit"
          className="btn"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export interface AddUsersContentProps {
  permissionNamePlural: string;
  onSubmit: (userEmails: string[]) => void;
}

export function AddUsersContent({
  permissionNamePlural,
  onSubmit
}: AddUsersContentProps) {
  const [ emailField, setEmailField ] = useState('');
  const [ userEmails, setUserEmails ] = useState<string[]>([]);

  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const draftEmails = emailField.split(/[,;\s]+/g).filter(x => x.length > 0);

    const [ validEmails, invalidEmails ] = partition(draftEmails, email => EMAIL_REGEX.test(email));

    setUserEmails(validEmails);

    if (ref.current != null) {
      if (invalidEmails.length > 0) {
        ref.current.setCustomValidity(`Please correct the following emails: ${invalidEmails.join(', ')}.`);
      } else {
        ref.current.setCustomValidity('');
      }
    }
  }, [ emailField ]);

  return (
    <form
      className={cx('--AddUsersContent')}
      onSubmit={event => {
        event.preventDefault();
        onSubmit(userEmails);
      }}
    >
      <div className={cx('--AddUsersEmailField')}>
        <p>Please input the email(s) of the {permissionNamePlural} you wish to add:</p>
        <textarea
          required
          ref={ref}
          value={emailField}
          onChange={(e) => {
            setEmailField(e.target.value)
          }}
          rows={6}
          cols={100}
        />
      </div>
      <div className={cx('--AddUsersSubmit')}>
        <button
          type="submit"
          className="btn"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export interface UsersAddedContentProps {
  createdUsers: string[];
  emailedUsers: string[];
  permissionName: string;
  permissionNamePlural: string;
  onConfirm: () => void;
}

export function UsersAddedContent({
  createdUsers,
  emailedUsers,
  permissionName,
  permissionNamePlural,
  onConfirm
}: UsersAddedContentProps) {
  return (
    <div className={cx('--UsersAddedContent')}>
      {
        createdUsers.length > 0 &&
        <div className={cx('--UsersAddedCreatedUsers')}>
          <h2>Added Users:</h2>
          <p>The following users have been granted {permissionName}-level access to this study:</p>
          <ul>
            {
              createdUsers.map(
                (createdUser, i) => (
                  <li key={i}>{createdUser}</li>
                )
              )
            }
          </ul>
        </div>
      }
      {
        emailedUsers.length > 0 &&
        <div className={cx('--UsersAddedEmailedUsers')}>
          <h2>Emailed Users:</h2>
          <p>The following users could not be granted {permissionName}-level access, as they do not have an existing account. They have been invited to register with us:</p>
          <ul>
            {
              emailedUsers.map(
                (emailedUser, i) => (
                  <li key={i}>{emailedUser}</li>
                )
              )
            }
          </ul>
        </div>
      }
      <div className={cx('--UsersAddedConfirm')}>
        <button
          type="button"
          className="btn"
          onClick={onConfirm}
        >
          OK
        </button>
      </div>
    </div>
  );
}
