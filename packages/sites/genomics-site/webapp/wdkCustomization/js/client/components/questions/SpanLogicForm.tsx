import React, { useCallback, useEffect, useState } from 'react';

import { partial, toUpper } from 'lodash';

import { TextBox, SingleSelect } from '@veupathdb/wdk-client/lib/Components';
import { Props as DefaultFormProps, SubmitButton, useDefaultOnSubmit } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import { RecordClass } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

const cx = makeClassNameHelper('SpanLogicForm');

import './SpanLogicForm.scss';

type SpanLogicFormProps = DefaultFormProps & {
  currentStepRecordClass?: RecordClass,
  newStepRecordClass?: RecordClass,
  insertingBeforeFirstStep: boolean,
  typeChangeAllowed: boolean,
  currentStepName?: string,
  newStepName?: string
};
type RegionName = 'a' | 'b';
type RegionType = 'exact' | 'upstream' | 'downstream' | 'custom';
type RegionOrigin = 'start' | 'stop';
type RegionDirection = '+' | '-';

const regionTypeOrder: RegionType[] = [
  'exact',
  'upstream',
  'downstream',
  'custom'
];

const operationItemsAB = [
  {
    value: 'overlap',
    display: 'overlaps'
  },
  {
    value: 'a_contain_b',
    display: 'contains'
  },
  {
    value: 'b_contain_a',
    display: 'is contained in',
  }
];

const operationItemsBA = [
  {
    value: 'overlap',
    display: 'overlaps'
  },
  {
    value: 'b_contain_a',
    display: 'contains'
  },
  {
    value: 'a_contain_b',
    display: 'is contained in',
  }
];

export function SpanLogicForm(
  { 
    dispatchAction,
    eventHandlers: { updateParamValue }, 
    state: { paramValues, question: { parametersByName, urlSegment }, submitting },
    parameterElements,
    currentStepRecordClass,
    newStepRecordClass,
    insertingBeforeFirstStep,
    submissionMetadata,
    submitButtonText,
    typeChangeAllowed,
    currentStepName = 'the current step',
    newStepName = 'the new step'
  }: SpanLogicFormProps
) {
  const [ upstreamOffsetA, setUpstreamOffsetA ] = useState(paramValues['region_a'] === 'upstream' ? paramValues['span_begin_offset_a'] : '1000');
  const [ downstreamOffsetA, setDownstreamOffsetA ] = useState(paramValues['region_a'] === 'downstream' ? paramValues['span_end_offset_a'] : '1000');
  const [ upstreamOffsetB, setUpstreamOffsetB ] = useState(paramValues['region_b'] === 'upstream' ? paramValues['span_begin_offset_b'] : '1000');
  const [ downstreamOffsetB, setDownstreamOffsetB ] = useState(paramValues['region_b'] === 'downstream' ? paramValues['span_end_offset_b'] : '1000');

  const updateSpanLogicParam = useCallback((paramName: string, regionName: RegionName | undefined, paramValue: string) => {
    updateParamValue({
      parameter: parametersByName[regionName ? `${paramName}_${regionName}` : `${paramName}`],
      paramValues,
      paramValue,
      searchName: urlSegment
    });
  }, [ paramValues, parametersByName, urlSegment ]);

  useEffect(() => {
    // TODO: Discuss whether we still need this parameter
    updateSpanLogicParam('span_sentence', undefined, 'sentence');
  }, [ urlSegment ]);

  useEffect(() => {
    if (!paramValues['span_output'] || paramValues['span_output'] === 'none') {
      updateSpanLogicParam(
        'span_output', 
        undefined, 
        !insertingBeforeFirstStep ? 'a' : 'b'
      );
    }
  }, [ urlSegment, insertingBeforeFirstStep ]);

  const updateOutputParam = useCallback((newOutputParam: RegionName) => {
    updateSpanLogicParam('span_output', undefined, newOutputParam);
  }, [ updateSpanLogicParam ] );

  const updateOperationParam = useCallback((newOperationParam: string) => {
    updateSpanLogicParam('span_operation', undefined, newOperationParam);
  }, [ updateSpanLogicParam ] );

  const updateUpstreamOffset = useCallback((regionName: RegionName, newUpstream: string) => {
    if (regionName === 'a') {
      setUpstreamOffsetA(newUpstream);
    } else {
      setUpstreamOffsetB(newUpstream);
    }

    updateSpanLogicParam('span_begin', regionName, 'start');
    updateSpanLogicParam('span_begin_direction', regionName, '-');
    updateSpanLogicParam('span_begin_offset', regionName, newUpstream);
    updateSpanLogicParam('span_end', regionName, 'start');
    updateSpanLogicParam('span_end_direction', regionName, '-');
    updateSpanLogicParam('span_end_offset', regionName, '1');
  }, [ updateSpanLogicParam ]);

  const updateDownstreamOffset = useCallback((regionName: RegionName, newDownstream: string) => {
    if (regionName === 'a') {
      setDownstreamOffsetA(newDownstream);
    } else {
      setDownstreamOffsetB(newDownstream);
    }

    updateSpanLogicParam('span_begin', regionName, 'stop');
    updateSpanLogicParam('span_begin_direction', regionName, '+');
    updateSpanLogicParam('span_begin_offset', regionName, '1');
    updateSpanLogicParam('span_end', regionName, 'stop');
    updateSpanLogicParam('span_end_direction', regionName, '+');
    updateSpanLogicParam('span_end_offset', regionName, newDownstream);
  }, [ updateSpanLogicParam ]);

  const updateRegionType = useCallback((regionName: RegionName, regionType: RegionType) => {
    updateSpanLogicParam('region', regionName, regionType);

    if (regionType === 'exact') {
      updateSpanLogicParam('span_begin', regionName, 'start');
      updateSpanLogicParam('span_begin_direction', regionName, '-');
      updateSpanLogicParam('span_begin_offset', regionName, '0');
      updateSpanLogicParam('span_end', regionName, 'stop');
      updateSpanLogicParam('span_end_direction', regionName, '-');
      updateSpanLogicParam('span_end_offset', regionName, '0');
    } else if (regionType === 'upstream') {
      updateUpstreamOffset(regionName, regionName === 'a' ? upstreamOffsetA : upstreamOffsetB);
    } else if (regionType === 'downstream') {
      updateDownstreamOffset(regionName, regionName === 'a' ? downstreamOffsetA : downstreamOffsetB)
    }
  }, [ upstreamOffsetA, upstreamOffsetB, downstreamOffsetA, downstreamOffsetB, updateUpstreamOffset, updateDownstreamOffset, updateSpanLogicParam ]);

  const onSubmit = useDefaultOnSubmit(dispatchAction, urlSegment, submissionMetadata, false);

  const [ leftRegion, rightRegion ] = paramValues['span_output'] !== 'b' && !insertingBeforeFirstStep
    ? [ 'region_a', 'region_b' ]
    : paramValues['span_output'] !== 'b' && insertingBeforeFirstStep
    ? [ 'region_b', 'region_a' ]
    : paramValues['span_output'] !== 'a' && !insertingBeforeFirstStep
    ? [ 'region_b', 'region_a' ]
    : [ 'region_a', 'region_b' ];

  const regionConfigA = (
    <RegionConfig
      regionTypeParamValue={paramValues['region_a'] as RegionType}
      regionTypeParamName={'region_a'}
      spanBeginElement={parameterElements['span_begin_a']}
      spanBeginDirectionElement={parameterElements['span_begin_direction_a']}
      spanBeginOffsetElement={parameterElements['span_begin_offset_a']}
      spanEndElement={parameterElements['span_end_a']}
      spanEndDirectionElement={parameterElements['span_end_direction_a']}
      spanEndOffsetElement={parameterElements['span_end_offset_a']}
      upstreamOffset={upstreamOffsetA}
      downstreamOffset={downstreamOffsetA}
      updateRegionType={partial(updateRegionType, 'a')}
      updateUpstreamOffset={partial(updateUpstreamOffset, 'a')}
      updateDownstreamOffset={partial(updateDownstreamOffset, 'a')}
      recordClass={!insertingBeforeFirstStep ? currentStepRecordClass : newStepRecordClass}
      spanBeginValue={paramValues['span_begin_a'] as RegionOrigin}
      spanBeginDirectionValue={paramValues['span_begin_direction_a'] as RegionDirection}
      spanBeginOffsetValue={parseInt(paramValues['span_begin_offset_a'], 10) || 0}
      spanEndValue={paramValues['span_end_a'] as RegionOrigin}
      spanEndDirectionValue={paramValues['span_end_direction_a'] as RegionDirection}
      spanEndOffsetValue={parseInt(paramValues['span_end_offset_a'], 10) || 0}
    />
  );

  const regionConfigB = (
    <RegionConfig
      regionTypeParamValue={paramValues['region_b'] as RegionType}
      regionTypeParamName={'region_b'}
      spanBeginElement={parameterElements['span_begin_b']}
      spanBeginDirectionElement={parameterElements['span_begin_direction_b']}
      spanBeginOffsetElement={parameterElements['span_begin_offset_b']}
      spanEndElement={parameterElements['span_end_b']}
      spanEndDirectionElement={parameterElements['span_end_direction_b']}
      spanEndOffsetElement={parameterElements['span_end_offset_b']}
      upstreamOffset={upstreamOffsetB}
      downstreamOffset={downstreamOffsetB}
      updateRegionType={partial(updateRegionType, 'b')}
      updateUpstreamOffset={partial(updateUpstreamOffset, 'b')}
      updateDownstreamOffset={partial(updateDownstreamOffset, 'b')}
      recordClass={!insertingBeforeFirstStep ? newStepRecordClass : currentStepRecordClass}
      spanBeginValue={paramValues['span_begin_b'] as RegionOrigin}
      spanBeginDirectionValue={paramValues['span_begin_direction_b'] as RegionDirection}
      spanBeginOffsetValue={parseInt(paramValues['span_begin_offset_b'], 10) || 0}
      spanEndValue={paramValues['span_end_b'] as RegionOrigin}
      spanEndDirectionValue={paramValues['span_end_direction_b'] as RegionDirection}
      spanEndOffsetValue={parseInt(paramValues['span_end_offset_b'], 10) || 0}
    />
  );

  return (
    <div className={cx()}>
      <div className={cx('--SpanSentence-Output')}>
        <span>
          "Return each
          {' '}
          <SpanOutputParam 
            currentStepRecordClass={currentStepRecordClass} 
            newStepRecordClass={newStepRecordClass} 
            paramValue={paramValues['span_output'] as RegionName}
            updateOutputParam={updateOutputParam} 
            insertingBeforeFirstStep={insertingBeforeFirstStep}
            typeChangeAllowed={typeChangeAllowed}
            currentStepName={currentStepName}
            newStepName={newStepName}
          />
          {' '}
          whose
        </span>
      </div>
      <div className={cx('--SpanSentence-LeftRegion')}>
        <div className={leftRegion}>{paramValues[leftRegion]} region</div>
      </div>
      <div className={cx('--SpanSentence-Operation')}>
        <span>
          <SingleSelect
            value={paramValues['span_operation']} 
            items={leftRegion === 'region_a' ? operationItemsAB : operationItemsBA}
            onChange={updateOperationParam}
          />
          {' '}
          the
        </span>
      </div>
      <div className={cx('--SpanSentence-RightRegion')}>
        <span className={rightRegion}>{paramValues[rightRegion]} region</span>
      </div>
      <div className={cx('--SpanSentence-Strand')}>
        <span>
          of a {rightRegion === 'region_b' 
            ? `${newStepRecordClass ? newStepRecordClass.displayName : 'Unknown'} from ${newStepName}` 
            : `${currentStepRecordClass ? currentStepRecordClass.displayName : ' Unknown'} from ${currentStepName}`
          }
          {' '}
          and is on
          {' '}
          {parameterElements['span_strand']}"
        </span>
      </div>

      <div className={cx('--LeftRegionGutter')}></div>
      <div className={cx('--LeftRegionTabBottom')}></div>
      <div className={cx('--RightRegionTabBottom')}></div>
      <div className={cx('--RightRegionGutter')}></div>

      <div className={cx('--LeftRegionConfigGutter')}></div>
      <div className={cx('--RegionConfig-LeftRegion')}>
        {
          leftRegion === 'region_a' ? regionConfigA : regionConfigB
        }
      </div>
      <div className={cx('--OperationDescription')}>
        <div className={cx('--SpanOperator', toUpper(paramValues['span_operation']))}></div>
      </div>
      <div className={cx('--RegionConfig-RightRegion')}>
        {
          rightRegion === 'region_b' ? regionConfigB : regionConfigA
        }
      </div>
      <div className={cx('--RightRegionConfigGutter')}></div>
      <div className={cx('--SubmissionContainer')}>
        <form onSubmit={onSubmit}>
          <SubmitButton 
            submissionMetadata={submissionMetadata} 
            submitting={submitting} 
            submitButtonText={submitButtonText} 
          />
        </form>
      </div>
    </div>
  );
}

type SpanOutputParamProps = {
  currentStepRecordClass?: RecordClass,
  newStepRecordClass?: RecordClass,
  paramValue: RegionName,
  updateOutputParam: (newOutputParam: RegionName) => void,
  insertingBeforeFirstStep: boolean,
  typeChangeAllowed: boolean,
  currentStepName: string,
  newStepName: string
};

const SpanOutputParam = ({
  currentStepRecordClass,
  newStepRecordClass,
  paramValue,
  updateOutputParam,
  insertingBeforeFirstStep,
  typeChangeAllowed,
  currentStepName,
  newStepName
}: SpanOutputParamProps) => {
  const currentStepRecordClassDisplayName = (currentStepRecordClass && currentStepRecordClass.displayName) || 'Unknown';
  const newStepRecordClassDisplayName = (newStepRecordClass && newStepRecordClass.displayName) || 'Unknown';

  return (
    typeChangeAllowed || 
    (
      currentStepRecordClass && 
      newStepRecordClass && 
      currentStepRecordClass.urlSegment === newStepRecordClass.urlSegment
    )
  ) ? <select onChange={e => updateOutputParam(e.target.value as RegionName)} value={paramValue}>
        <option value={!insertingBeforeFirstStep ? 'a' : 'b'}>
          {currentStepRecordClassDisplayName} from {currentStepName}
        </option>
        <option value={!insertingBeforeFirstStep ? 'b' : 'a'}>
          {newStepRecordClassDisplayName} from {newStepName}
        </option>   
      </select>
    : <span>
        {
          (paramValue !== 'b' && !insertingBeforeFirstStep) || (paramValue !== 'a' && insertingBeforeFirstStep)
            ? `${currentStepRecordClassDisplayName} from ${currentStepName}`
            : `${newStepRecordClassDisplayName} from ${newStepName}`
        }
      </span>;
};


type RegionConfigProps = {
  regionTypeParamValue: RegionType,
  regionTypeParamName: string,
  spanBeginElement: React.ReactNode,
  spanBeginDirectionElement: React.ReactNode,
  spanBeginOffsetElement: React.ReactNode,
  spanEndElement: React.ReactNode,
  spanEndDirectionElement: React.ReactNode,
  spanEndOffsetElement: React.ReactNode,
  upstreamOffset: string,
  downstreamOffset: string,
  updateRegionType: (newRegion: RegionType) => void,
  updateUpstreamOffset: (newUpstream: string) => void
  updateDownstreamOffset: (newDownstream: string) => void,
  recordClass?: RecordClass,
  spanBeginValue: RegionOrigin,
  spanBeginDirectionValue: RegionDirection,
  spanBeginOffsetValue: number,
  spanEndValue: RegionOrigin,
  spanEndDirectionValue: RegionDirection,
  spanEndOffsetValue: number
};

const RegionConfig = ({
  regionTypeParamValue,
  regionTypeParamName,
  spanBeginElement,
  spanBeginOffsetElement,
  spanBeginDirectionElement,
  spanEndElement,
  spanEndDirectionElement,
  spanEndOffsetElement,
  upstreamOffset,
  downstreamOffset,
  updateRegionType,
  updateUpstreamOffset,
  updateDownstreamOffset,
  recordClass,
  spanBeginValue,
  spanBeginDirectionValue,
  spanBeginOffsetValue,
  spanEndValue,
  spanEndDirectionValue,
  spanEndOffsetValue
}: RegionConfigProps) => {
  // TODO Figure out how to eliminate this hardcoding
  const singleBpFeature = recordClass && recordClass.urlSegment === 'snp';
  const featureLength = singleBpFeature ? 1 : 2000;

  const beginFeatureEndpoint = spanBeginValue === 'start' ? 0 : featureLength;
  const beginSignedOffset = (spanBeginDirectionValue === '+' ? 1 : -1) * spanBeginOffsetValue;

  const endFeatureEndpoint = spanEndValue === 'start' ? 0 : featureLength;
  const endSignedOffset = (spanEndDirectionValue === '+' ? 1 : -1) * spanEndOffsetValue;

  const regionInterval = [
    beginFeatureEndpoint + beginSignedOffset,
    endFeatureEndpoint + endSignedOffset
  ];

  const [ r_left, r_right ] = [ Math.min(...regionInterval), Math.max(...regionInterval) ];
  const [ f_left, f_right ] = [0, featureLength];
  const unpaddedWidth = Math.max(
    Math.max(r_right, f_right) - Math.min(f_left, r_left),
    1000
  );
  const unpaddedHeight = unpaddedWidth / 4;
  const padding = unpaddedHeight / 12;

  const viewBox = [
    -padding + Math.min(f_left, r_left),
    -padding + 0,
    unpaddedWidth + 2 * padding,
    unpaddedHeight + 2 * padding
  ].join(' ');

  const dy = unpaddedHeight / 12;

  return (
    <div className={cx('--RegionConfig')}>
      <div className={cx('--RegionConfig-Preview')}>
        <svg viewBox={viewBox}>
          <Region
            left={r_left}
            right={r_right}
            dy={dy}
            y={3 * dy}
            name="Region"
            className={regionTypeParamName}
          />
          <Feature
            left={f_left}
            right={f_right}
            dy={dy}
            y={8 * dy}
            name={recordClass ? recordClass.displayName : 'Unknown'}
            className="feature"
            singleBp={singleBpFeature}
          />
        </svg>
      </div>
      <div className={cx('--RegionConfig-ParamGroup')}>
        <div className={cx('--RegionConfig-ParamGroup-Params')}>
          {
            regionTypeOrder.map(
              regionType => (
                <div key={`${regionTypeParamName} ${regionType}`} onFocus={() => updateRegionType(regionType)}>
                  <input 
                    id={`${regionTypeParamName} ${regionType}`}
                    name={regionTypeParamName}
                    type="radio" 
                    value={regionType}
                    checked={regionType === regionTypeParamValue}
                    onChange={() => updateRegionType(regionType)}
                  />
                  <label htmlFor={`${regionTypeParamName} ${regionType}`}>
                    {
                      regionType === 'exact'
                        ? <span>
                            Exact
                          </span>
                        : regionType === 'upstream'
                        ? <span>
                            Upstream: <TextBox value={upstreamOffset} onChange={updateUpstreamOffset} /> bp
                          </span>
                        : regionType === 'downstream'
                        ? <span>
                            Downstream: <TextBox value={downstreamOffset} onChange={updateDownstreamOffset} /> bp
                          </span>
                        : <span>
                            Custom: 
                            <div className={cx('--RegionConfig-CustomRegionParams')}>
                              <div className={cx('--RegionConfig-CustomRegionParams-BeginHeader')}>
                                begin at:
                              </div>
                              <div className={cx('--RegionConfig-CustomRegionParams-BeginBody')}>
                                {spanBeginElement} {spanBeginDirectionElement} {spanBeginOffsetElement} bp
                              </div>
                              <div className={cx('--RegionConfig-CustomRegionParams-EndHeader')}>
                                end at:
                              </div>
                              <div className={cx('--RegionConfig-CustomRegionParams-EndBody')}>
                                {spanEndElement} {spanEndDirectionElement} {spanEndOffsetElement} bp
                              </div>
                            </div>
                          </span>
                    }
                  </label>
                </div>
              )
            )
          }
        </div>
      </div>
    </div>
  );
};

type RegionProps = {
  left: number,
  right: number,
  dy: number,
  y: number,
  name: string,
  className?: string
};

const Region = ({ left, right, dy, y, name, className }: RegionProps) => {
  const fontSize = dy * 2;
  const strokeWidth = dy / 4;

  return (
    <g className={className}>
      <rect
        x={left}
        y={y - dy}
        height={2 * dy}
        width={right - left}
        opacity={0}
      >
        <title>{name}</title>
      </rect>
      <line
        x1={left}
        y1={y}
        x2={right}
        y2={y}
        strokeWidth={strokeWidth}
      />
      <line
        x1={left}
        y1={y - dy}
        x2={left}
        y2={y + dy}
        strokeWidth={strokeWidth}
      />
      <line
        x1={right}
        y1={y - dy}
        x2={right}
        y2={y + dy}
        strokeWidth={strokeWidth}
      />
      <text x={left + fontSize} y={y + 2.5 * dy} fontSize={fontSize}>
        {name}
      </text>
    </g>
  );
};

type FeatureProps = {
  left: number,
  right: number,
  dy: number,
  y: number,
  name: string,
  singleBp?: boolean,
  className?: string
};

const Feature = ({
  left,
  right,
  dy,
  y,
  name,
  singleBp = false,
  className
}: FeatureProps) => {
  const width = right - left;
  const dx = dy;

  const points = (singleBp || width < 2 * dx
    ? [
        [left - dx, y], 
        [left, y - dy], 
        [left + dx, y], 
        [left, y + dy]
      ]
    : [
        [left, y - dy],
        [right - dx, y - dy],
        [right, y],
        [right - dx, y + dy],
        [left, y + dy]
      ]
  )
    .map(([x, y]) => `${x} ${y}`)
    .join(",");

  const fontSize = dy * 2;

  return (
    <g className={className}>
      <polygon points={points}>
        <title>{name}</title>
      </polygon>
      <text x={left + fontSize} y={y + 3 * dy} fontSize={fontSize}>
        {name}
      </text>
    </g>
  );
};
