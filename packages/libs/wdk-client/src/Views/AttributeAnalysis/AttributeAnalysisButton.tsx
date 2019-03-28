import React from 'react';

import Dialog from 'wdk-client/Components/Overlays/Dialog';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { Reporter } from 'wdk-client/Utils/WdkModel';

import 'wdk-client/Views/AttributeAnalysis/AttributeAnalysis.scss';

const cx = makeClassNameHelper('AttributeAnalysis');

type Props = {
  stepId: number;
  reporter: Reporter;
  isOpen: boolean;
  onOpen: (reporterName: string, stepId: number) => void;
  onClose: (reporterName: string, stepId: number) => void;
  children: React.ReactChild;
}

export default function AttributeAnalysisButton(props: Props) {
const {
  reporter,
  children,
  onOpen,
  onClose,
  isOpen,
  stepId,
} = props;
  const title = `Analyze/Graph the contents of this column by ${reporter.displayName.toLowerCase()}`;

  return (
    <React.Fragment>
      <button
        className={cx('Button')}
        type="button"
        title={title}
        onClick={() => onOpen(reporter.name, stepId)}
      />
      <Dialog
        modal={true}
        open={isOpen}
        onClose={() => onClose(reporter.name, stepId)}
        className={cx()}
        title={reporter.displayName}>
        {children}
      </Dialog>
    </React.Fragment>
  );
}
