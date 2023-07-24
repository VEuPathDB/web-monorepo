import React from 'react';
export type ReporterFormComponent = React.ComponentType<any> & {
  getInitialState: () => {
    formState: Record<string, string | number | boolean>;
  };
};
