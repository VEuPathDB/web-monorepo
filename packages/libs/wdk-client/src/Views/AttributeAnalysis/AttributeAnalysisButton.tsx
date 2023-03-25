import React from 'react';

import Dialog from '../../Components/Overlays/Dialog';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import { Reporter } from '../../Utils/WdkModel';

import '../../Views/AttributeAnalysis/AttributeAnalysis.scss';
import { ResultType } from '../../Utils/WdkResult';

const cx = makeClassNameHelper('AttributeAnalysis');

type Props = {
  resultType: ResultType;
  reporter: Reporter;
  isOpen: boolean;
  onOpen: (reporterName: string, resultType: ResultType) => void;
  onClose: (reporterName: string, resultType: ResultType) => void;
  children: React.ReactChild;
};

export default function AttributeAnalysisButton(props: Props) {
  const { reporter, children, onOpen, onClose, isOpen, resultType } = props;
  const title = `Analyze/Graph the contents of this column by ${reporter.displayName.toLowerCase()}`;

  return (
    <React.Fragment>
      <button
        className={cx('Button')}
        type="button"
        title={title}
        onClick={() => onOpen(reporter.name, resultType)}
      />
      <Dialog
        modal={true}
        open={isOpen}
        onClose={() => onClose(reporter.name, resultType)}
        className={cx()}
        title={reporter.displayName}
      >
        {children}
      </Dialog>
    </React.Fragment>
  );
}
