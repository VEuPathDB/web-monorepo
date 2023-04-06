import { CSSProperties } from 'react';

export { MapVeuContainer as default } from './MapVeuContainer';

export type SiteInformationProps = {
  siteHomeUrl: string;
  loginUrl: string;
  siteName: string;
  siteLogoSrc: string;
};

export const mapNavigationBackgroundColor = 'white';
export const mapNavigationBorder: CSSProperties['border'] = '1px solid #D9D9D9';
export const mapSideNavigationActiveMenuItemBackground: CSSProperties['background'] =
  '#ECF7F9';
