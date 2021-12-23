import { CSSProperties } from 'react';

type TabStyle = {
  backgroundColor?: CSSProperties['backgroundColor'];
  textColor?: CSSProperties['color'];
  indicatorColor?: CSSProperties['color'];
};

export type TabbedDisplayStyleSpec = {
  container: CSSProperties;
  inactive: TabStyle;
  active: TabStyle;
  hover: TabStyle;
};
