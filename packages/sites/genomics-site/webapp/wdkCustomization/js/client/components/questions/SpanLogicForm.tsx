import React, { useCallback, useState } from 'react';

import { Props } from 'wdk-client/Views/Question/DefaultQuestionForm';
import { TextBox } from 'wdk-client/Components';

type RegionType = 'exact' | 'upstream' | 'downstream' | 'custom';

const regionTypeOrder: RegionType[] = [
  'exact',
  'upstream',
  'downstream',
  'custom'
];

export function SpanLogicForm(
  { 
    eventHandlers: { updateParamValue }, 
    state: { paramValues, question: { parametersByName, urlSegment } },
    parameterElements
  }: Props) {
  const updateSpanLogicParam = useCallback((paramName: string, paramValue: string) => {
    updateParamValue({
      parameter: parametersByName[paramName],
      paramValues,
      paramValue,
      searchName: urlSegment
    });
  }, [ updateParamValue ]);

  const updateRegionA = useCallback((newRegion: string) => {
    updateSpanLogicParam('region_a', newRegion);
  }, [ updateParamValue, parametersByName, paramValues ]);

  const updateRegionB = useCallback((newRegion: string) => {
    updateSpanLogicParam('region_b', newRegion);
  }, [ updateParamValue, parametersByName, paramValues ]);

  return (
    <RegionConfig
      regionParamValue={paramValues['region_a']}
      regionParamName={'region_a'}
      updateRegionParam={updateRegionA}
      spanBeginElement={parameterElements['span_begin_a']}
      spanBeginDirectionElement={parameterElements['span_begin_direction_a']}
      spanBeginOffsetElement={parameterElements['span_begin_offset_a']}
      spanEndElement={parameterElements['span_end_a']}
      spanEndDirectionElement={parameterElements['span_end_direction_a']}
      spanEndOffsetElement={parameterElements['span_end_offset_a']}
    />
  );
}

type RegionConfigProps = {
  regionParamValue: string,
  regionParamName: string,
  spanBeginElement: React.ReactNode,
  spanBeginDirectionElement: React.ReactNode,
  spanBeginOffsetElement: React.ReactNode,
  spanEndElement: React.ReactNode,
  spanEndDirectionElement: React.ReactNode,
  spanEndOffsetElement: React.ReactNode,
  updateRegionParam: (newRegion: string) => void
};

const RegionConfig = ({
  regionParamValue,
  regionParamName,
  spanBeginElement,
  spanBeginOffsetElement,
  spanBeginDirectionElement,
  spanEndElement,
  spanEndDirectionElement,
  spanEndOffsetElement,
  updateRegionParam
}: RegionConfigProps) => {
  const [ upstreamOffset, setUpstreamOffset ] = useState('1000');
  const [ downstreamOffset, setDownstreamOffset ] = useState('1000');

  return (
    <div>
      {
        regionTypeOrder.map(
          regionType => (
            <div key={regionType} onFocus={() => updateRegionParam(regionType)}>
              <input 
                id={regionType}
                name={regionParamName}
                type="radio" 
                value={regionType}
                checked={regionType === regionParamValue}
                onChange={e => updateRegionParam(e.target.value)}
              />
              <label htmlFor={regionType}>
                {
                  regionType === 'exact' &&
                  'Exact'
                }
                {
                  regionType === 'upstream' &&
                  <div>
                    Upstream: <TextBox value={upstreamOffset} onChange={setUpstreamOffset} /> bp
                  </div>
                }
                {
                  regionType === 'downstream' &&
                  <div>
                    Downstream: <TextBox value={downstreamOffset} onChange={setDownstreamOffset} /> bp
                  </div>
                }
                {
                  regionType === 'custom' &&
                  <div>
                    Custom: 
                    <div>
                      {spanBeginElement} {spanBeginDirectionElement} {spanBeginOffsetElement} bp
                    </div>
                    <div>
                      {spanEndElement} {spanEndDirectionElement} {spanEndOffsetElement} bp
                    </div>
                  </div>
                }
              </label>
            </div>
          )
        )
      }
    </div>
  );
};
