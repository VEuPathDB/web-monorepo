import { CSSProperties } from 'react';

export { MapVeuContainer as default } from './MapVeuContainer';

export type SiteInformationProps = {
  siteHomeUrl: string;
  loginUrl: string;
  siteName: string;
  siteLogoSrc: string;
};

export const mapSidePanelBackgroundColor = 'white';
export const mapSidePanelBorder: CSSProperties['border'] = '1px solid #D9D9D9';

// Back end overlay values contain a special token for the "Other" category:
export const UNSELECTED_TOKEN = '__UNSELECTED__';
// This is what is displayed to the user instead:
export const UNSELECTED_DISPLAY_TEXT = 'All other values';
