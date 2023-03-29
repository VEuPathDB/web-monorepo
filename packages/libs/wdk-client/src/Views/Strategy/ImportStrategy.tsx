import React, { useEffect } from 'react';

import { Loading } from '../../Components';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';

import '../../Views/Strategy/ImportStrategy.scss';

const cx = makeClassNameHelper('ImportStrategy');

interface Props {
  strategySignature: string;
  requestImportStrategy: (strategySignature: string) => void;
}

export const ImportStrategy = ({
  strategySignature,
  requestImportStrategy,
}: Props) => {
  useEffect(() => {
    requestImportStrategy(strategySignature);
  }, [strategySignature]);

  return (
    <div className={cx()}>
      <h2>Importing strategy to your workspace</h2>
      <Loading />
    </div>
  );
};
