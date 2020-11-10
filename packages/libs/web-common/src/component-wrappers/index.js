export * from './AnswerController';
export * from './DownloadForm';
export * from './Error';
export * from './Footer';
export * from './Header';
export * from './RecordPage';
export * from './UserMessageController';

import ApiApplicationSpecificProperties from '../components/ApiApplicationSpecificProperties';

/**
 * Overrides the Preferences fieldset on the User Profile/Account form from the WDK.  The WDK
 * has no application specific properties although it provides for that possibility.  The empty
 * React component placeholder is overridden with an ApiDB specific component.
 * @returns {*} - Application specific properties component
 * @constructor
 */
export function ApplicationSpecificProperties() {
  return ApiApplicationSpecificProperties;
}
