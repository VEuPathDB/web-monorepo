import React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import WdkServiceJsonReporterForm from '../../Views/ReporterForm/WdkServiceJsonReporterForm';

type Props = Record<string, any>;

const DownloadForm: React.FC<Props> = (props) => (
  <WdkServiceJsonReporterForm {...(props as any)} />
);

export default wrappable(DownloadForm);
