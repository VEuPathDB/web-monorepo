import React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

import { CommonModal } from '../Components';

import { makeClassNameHelper } from '../Utils/ComponentUtils';

import './PlatformModal.scss';

const cx = makeClassNameHelper('wdk-PlatformModal');

/**
 * Standard alerts. These can be thought of as platform-level utilities
 * to be used with action creators, etc, and should not be used in UI
 * components. The fact that they use the DOM + React is an implementation detail.
 */

/**
 * @return {Promise<void>}
 */
export function alert(title: string, message: string): Promise<void> {
  return dialog(title, message, [{ text: 'OK', focus: true }]);
}

/**
 * @return {Promise<boolean>}
 */
export function confirm(title: string, message: string): Promise<boolean> {
  return dialog(
    title,
    message,
    [
      { text: 'Cancel', value: false },
      { text: 'OK', value: true, focus: true },
    ],
    false
  );
}

interface ButtonDescriptor {
  text: string;
  value?: any;
  focus?: boolean;
}

/**
 * @param {string} title
 * @param {string} message
 * @param {Array<ButtonDescriptor>} buttons
 * @param {any} escapeValue The value to use when dialog is closed via pressing the escape key / clicking the close icon
 * @returns {Promise<any>}
 */
export function dialog(
  title: string,
  message: string,
  buttons: ButtonDescriptor[],
  escapeValue?: any
): Promise<any> {
  return new Promise(function (resolve, reject) {
    const dialogNode = document.createElement('div');
    document.body.appendChild(dialogNode);

    const onSelectValue = (value: any) => {
      resolve(value);
      ReactDOM.unmountComponentAtNode(dialogNode);
      document.body.removeChild(dialogNode);
    };

    try {
      const root = ReactDOMClient.createRoot(dialogNode);
      root.render(
        <PlatformModal
          title={title}
          message={message}
          buttons={buttons}
          onSelectValue={onSelectValue}
          escapeValue={escapeValue}
        />
      );
    } catch (err) {
      reject(err);
    }
  });
}

type PlatformModalProps = {
  title: string;
  message: string;
  buttons: ButtonDescriptor[];
  onSelectValue: (value?: any) => void;
  escapeValue?: any;
};

const PlatformModal = ({
  title,
  message,
  buttons,
  onSelectValue,
  escapeValue,
}: PlatformModalProps) => (
  <CommonModal title={title} onClose={() => onSelectValue(escapeValue)}>
    <div className={cx('Content')}>
      {message}
      <div className={cx('ContentActions')}>
        {buttons.map((buttonDescription) => (
          <button
            type="button"
            className="btn"
            key={buttonDescription.text}
            onClick={() => onSelectValue(buttonDescription.value)}
            autoFocus={buttonDescription.focus}
          >
            {buttonDescription.text}
          </button>
        ))}
      </div>
    </div>
  </CommonModal>
);
