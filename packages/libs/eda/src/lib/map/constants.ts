import { CSSProperties } from 'react';

export const mapSidePanelBackgroundColor = 'white';
export const mapSidePanelBorder: CSSProperties['border'] = '1px solid #D9D9D9';

// Back end overlay values contain a special token for the "Other" category:
export const UNSELECTED_TOKEN = '__UNSELECTED__';
// This is what is displayed to the user instead:
export const UNSELECTED_DISPLAY_TEXT = 'All other values';

export const STUDIES_ENTITY_ID = 'EUPATH_0000605';
export const STUDY_ID_VARIABLE_ID = 'OBI_0001622';
