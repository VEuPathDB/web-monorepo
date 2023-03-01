import React, { ReactNode } from 'react';

import { Formula } from './Formula';
import { Fraction } from './Fraction';
import { ComparisonLabel } from './ComparisonLabel';
import { ReferenceLabel } from './ReferenceLabel';

import {
  FoldChangeOperation,
  FoldChangeDirection
} from './Types';

const isBroadest = (
  referenceOperation: FoldChangeOperation,
  comparisonOperation: FoldChangeOperation,
  direction: FoldChangeDirection
) => {
  if (direction === 'up-regulated') {
    // we are interested in expression values increasing

    // a broad window exists when we choose the lowest ref expression value
    // and the highest comp expression value
    if (
      (referenceOperation === 'none' || referenceOperation === 'minimum') &&
      comparisonOperation === 'maximum'
    ) {
      return true;
    } else if (
      referenceOperation === 'minimum' &&
      (comparisonOperation === 'none' || comparisonOperation === 'minimum')
    ) {
      return true;
    } else {
      return false;
    }
  } else if (direction === 'down-regulated') {
    // we are interested in expression values decreasing

    // a narrow window exists when we choose the highest ref expression value
    // and the lowest comp expression value
    if (
      (referenceOperation === 'none' || referenceOperation === 'maximum') &&
      comparisonOperation === 'minimum'
    ) {
      return true;
    } else if (
      referenceOperation === 'maximum' &&
      (comparisonOperation === 'none' || comparisonOperation === 'minimum')
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const isNarrowest = (
  referenceOperation: FoldChangeOperation,
  comparisonOperation: FoldChangeOperation,
  direction: FoldChangeDirection
) => {
  if (direction === 'up-regulated') {
    // we are interested in expression values increasing

    // a narrow window exists when we choose the highest ref expression value
    // and the lowest comp expression value
    if (
      (referenceOperation === 'none' || referenceOperation === 'maximum') &&
      comparisonOperation === 'minimum'
    ) {
      return true;
    } else if (
      referenceOperation === 'maximum' &&
      (comparisonOperation === 'none' || comparisonOperation === 'minimum')
    ) {
      return true;
    } else {
      return false;
    }
  } else if (direction === 'down-regulated') {
    // we are interested in expression values decreasing

    // a narrow window exists when we choose the lowest ref expression value
    // and the highest comp expression value
    if (
      (referenceOperation === 'none' || referenceOperation === 'minimum') &&
      comparisonOperation === 'maximum'
    ) {
      return true;
    } else if (
      referenceOperation === 'minimum' &&
      (comparisonOperation === 'none' || comparisonOperation === 'maximum')
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

interface NarrowAndBroadenOps {
  narrow: FoldChangeOperation[];
  broaden: FoldChangeOperation[];
}

interface NarrowAndBroadenOpsBySampleType {
  comp: NarrowAndBroadenOps;
  ref: NarrowAndBroadenOps;
}

const minToMaxWindow: FoldChangeOperation[] = [
  'minimum',
  'average',
  'maximum'
];

const maxToMinWindow: FoldChangeOperation[] = [
  'maximum',
  'average',
  'minimum'
];

const narrowAndBroadenOps = (
  referenceOperation: FoldChangeOperation,
  comparisonOperation: FoldChangeOperation,
  direction: FoldChangeDirection
): NarrowAndBroadenOpsBySampleType => {
  if (direction === 'up or down regulated') {
    return {
      comp: {
        narrow: [],
        broaden: []
      },
      ref: {
        narrow: [],
        broaden: []
      }
    };
  }

  const [ compWindow, refWindow ] = direction === 'up-regulated'
    ? [ minToMaxWindow, maxToMinWindow ]
    : [ maxToMinWindow, minToMaxWindow ];

  const compOpIndex = compWindow.indexOf(comparisonOperation);
  const refOpIndex = refWindow.indexOf(referenceOperation);

  const compOps: NarrowAndBroadenOps = compOpIndex === -1
    ? {
      narrow: [],
      broaden: []
    }
    : {
      narrow: compWindow.slice(0, compOpIndex).sort(),
      broaden: compWindow.slice(compOpIndex + 1).sort()
    };

  const refOps: NarrowAndBroadenOps = refOpIndex === -1
    ? {
      narrow: [],
      broaden: []
    }
    : {
      narrow: refWindow.slice(0, refOpIndex).sort(),
      broaden: compWindow.slice(refOpIndex + 1).sort()
    };

  return {
    comp: compOps,
    ref: refOps
  };
};

interface HelpSubExpressionProps {
  valueType: string;
  hasMultipleComps: boolean;
  hasMultipleRefs: boolean;
  referenceOperation: FoldChangeOperation;
  comparisonOperation: FoldChangeOperation;
}

const helpSubExpression = (sampleType: 'reference' | 'comparison'): React.FunctionComponent<HelpSubExpressionProps> => ({
  valueType,
  hasMultipleComps,
  hasMultipleRefs,
  referenceOperation,
  comparisonOperation
}) => {
  const [ 
    SampleLabel, 
    hasMultipleSamples,
    operation
  ] = sampleType === 'reference'
    ? [ ReferenceLabel, hasMultipleRefs, referenceOperation ]
    : [ ComparisonLabel, hasMultipleComps, comparisonOperation ];
  
  return hasMultipleSamples
    ? <><SampleLabel>{operation}</SampleLabel> {valueType} in <SampleLabel>{sampleType}</SampleLabel></>
    : <><SampleLabel>{sampleType}</SampleLabel> {valueType}</>
};

const ReferenceHelpSubExpression = helpSubExpression('reference');
const ComparisonHelpSubExpression = helpSubExpression('comparison');

interface HelpFormulaProps extends HelpSubExpressionProps {
  leftHandSide: ReactNode;
  hasHardFloorParam: boolean;
  referenceIsNumerator: boolean;
};

const HelpFormula: React.FunctionComponent<HelpFormulaProps> = props => {
  const referenceHelpSubExpression = <ReferenceHelpSubExpression {...props} />;
  const comparisonHelpSubExpression = <ComparisonHelpSubExpression {...props} />;

  return (
    <Formula
      leftHandSide={props.leftHandSide}
      operator="="
      rightHandSide={<Fraction
        numerator={
          props.referenceIsNumerator 
            ? referenceHelpSubExpression 
            : comparisonHelpSubExpression
        }
        denominator={
          props.referenceIsNumerator 
            ? comparisonHelpSubExpression 
            : referenceHelpSubExpression
        }
      />}
    />
  )
};

interface HelpTextProps {
  foldChange: number;
  hasHardFloorParam: boolean;
  recordDisplayName: string;
  recordDisplayNamePlural: string;
  valueType: string;
  valueTypePlural: string;
  refSampleSize: number;
  compSampleSize: number;
  referenceOperation: FoldChangeOperation;
  comparisonOperation: FoldChangeOperation;
  direction: FoldChangeDirection;
}

export const HelpText: React.FunctionComponent<HelpTextProps> = ({
  foldChange,
  hasHardFloorParam,
  recordDisplayName,
  recordDisplayNamePlural,
  valueType,
  valueTypePlural,
  refSampleSize,
  compSampleSize,
  referenceOperation,
  comparisonOperation,
  direction
}) => {
  if (!refSampleSize || !compSampleSize) {
    return (
      <div className="wdk-FoldChangeHelpIncomplete">
        <p>
          This graphic will help you visualize the parameter
          choices you make at the left. It will begin to display when you choose a <b>Reference Sample</b> or a <b>Comparison Sample</b>.
        </p>
      	<div className="wdk-FoldChangeHelpDetailed">
          <p>
            See the <a href='/assets/Fold_Change_Help.pdf' target='_blank'>detailed help for this search</a>.
          </p>
	      </div>
      </div>
    );
  }

  const hasMultipleRefs = refSampleSize > 1;
  const hasMultipleComps = compSampleSize > 1;

  const formulas = direction === 'up-regulated'
    ? [
      <HelpFormula
        leftHandSide="fold change"
        hasHardFloorParam={hasHardFloorParam}
        referenceIsNumerator={false}
        valueType={valueType}
        hasMultipleRefs={hasMultipleRefs}
        hasMultipleComps={hasMultipleComps}
        referenceOperation={referenceOperation}
        comparisonOperation={comparisonOperation}
      />
    ]
    : direction === 'down-regulated'
    ? [
      <HelpFormula
        leftHandSide="fold change"
        hasHardFloorParam={hasHardFloorParam}
        referenceIsNumerator={true}
        valueType={valueType}
        hasMultipleRefs={hasMultipleRefs}
        hasMultipleComps={hasMultipleComps}
        referenceOperation={referenceOperation}
        comparisonOperation={comparisonOperation}
      />
    ]
    : [
      <HelpFormula
        leftHandSide={<>fold change<sub>up</sub></>}
        hasHardFloorParam={hasHardFloorParam}
        referenceIsNumerator={false}
        valueType={valueType}
        hasMultipleRefs={hasMultipleRefs}
        hasMultipleComps={hasMultipleComps}
        referenceOperation={referenceOperation}
        comparisonOperation={comparisonOperation}
      />,
      <HelpFormula
        leftHandSide={<>fold change<sub>down</sub></>}
        hasHardFloorParam={hasHardFloorParam}
        referenceIsNumerator={true}
        valueType={valueType}
        hasMultipleRefs={hasMultipleRefs}
        hasMultipleComps={hasMultipleComps}
        referenceOperation={referenceOperation}
        comparisonOperation={comparisonOperation}
      />
    ];

  const criteria = direction === 'up or down regulated'
    ? (
      <>
        <b>fold change<sub>up</sub> {'>='} {foldChange}</b> or{' '}
        <b>fold change<sub>down</sub> {'>='} {foldChange}</b>
      </>
    )
    : (
      <>
        <b>fold change {'>='} {foldChange}</b>
      </>
    );

  const { 
    comp: {
      narrow: compNarrowOps = [],
      broaden: compBroadenOps = []
    },
    ref: {
      narrow: refNarrowOps = [],
      broaden: refBroadenOps = []
    }
   } = narrowAndBroadenOps(referenceOperation, comparisonOperation, direction);

  const toNarrowText = [
    refNarrowOps.length ? `${refNarrowOps.join(' or ')} reference value` : '',
    compNarrowOps.length ? `${compNarrowOps.join(' or ')} comparison value` : ''
  ]
    .filter(str => str !== '')
    .join(', or ');

  const toBroadenText = [
    refBroadenOps.length ? `${refBroadenOps.join(' or ')} reference value` : '',
    compBroadenOps.length ? `${compBroadenOps.join(' or ')} comparison value` : ''
  ]
    .filter(str => str !== '')
    .join(', or ');

  return (
    <div className="wdk-FoldChangeHelpComplete">
      <p>For each {recordDisplayName}, the search calculates:</p>
      {formulas}
      <p>and returns {recordDisplayNamePlural} when {criteria}.</p>
      <p>
        You are searching for {recordDisplayNamePlural} that are <b>{direction}</b> between{' '}
        {
          hasMultipleRefs 
            ? <>at least two <b>reference samples</b></>
            : <>one <b>reference sample</b></>
        }{' '}
        and{' '}
        {
          hasMultipleComps
            ? <>at least two <b>comparison samples</b>.</>
            : <>one <b>comparison sample</b>.</>
        }
      </p>
      <p>
        {
          isBroadest(referenceOperation, comparisonOperation, direction) && (
            <>
              This calculation creates the <b>broadest</b> window of {valueTypePlural} in which to look for {recordDisplayNamePlural} that meet your fold change cutoff.{' '}
            </>
          )
        }
        {
          isNarrowest(referenceOperation, comparisonOperation, direction) && (
            <>
              This calculation creates the <b>narrowest</b> window of {valueTypePlural} in which to look for {recordDisplayNamePlural} that meet your fold change cutoff.{' '}
            </>
          )
        }
        {
          toNarrowText && (
            <>
              To narrow the window, use the {toNarrowText}.{' '}
            </>
          )
        }
        {
          toBroadenText && (
            <>
              To broaden the window, use the {toBroadenText}.{' '}
            </>
          )
        }
      </p>
    </div>
  );
};
