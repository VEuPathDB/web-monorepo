import { Viewport } from '@veupathdb/components/lib/map/MapVEuMap';
import { CSSProperties } from 'react';

// export default viewport for custom zoom control
export const defaultViewport: Viewport = {
  center: [0, 0],
  zoom: 1,
};

export const mapSidePanelBackgroundColor = 'white';
export const mapSidePanelBorder: CSSProperties['border'] = '1px solid #D9D9D9';

// Back end overlay values contain a special token for the "Other" category:
export const UNSELECTED_TOKEN = '__UNSELECTED__';
// This is what is displayed to the user instead:
export const UNSELECTED_DISPLAY_TEXT = 'All other values';
