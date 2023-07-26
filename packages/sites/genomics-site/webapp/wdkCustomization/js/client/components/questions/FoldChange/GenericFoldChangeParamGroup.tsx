import React from 'react';

import { PreAndPostParameterEntries, ParamLine } from './ParamLine';
import { SamplesParamSubgroup } from './SamplesParamSubgroup';
import { Props } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

type GroupProps = Props & {
  valueType: string;
};

const preAndPostParams = (props: GroupProps): PreAndPostParameterEntries[] =>
  props.state.question.parametersByName['protein_coding_only']
    ? [
        {
          preParameterContent: (
            <span>
              For the <b>Experiment</b>
            </span>
          ),
          parameterName: 'profileset_generic',
          postParameterContent: null,
        },
        {
          preParameterContent: <span>return</span>,
          parameterName: 'protein_coding_only',
          postParameterContent: (
            <span>
              <b>Genes</b>
            </span>
          ),
        },
        {
          preParameterContent: <span>that are</span>,
          parameterName: 'regulated_dir',
          postParameterContent: null,
        },
        {
          preParameterContent: (
            <span>
              with a <b>Fold change</b> {'>='}
            </span>
          ),
          parameterName: 'fold_change',
          postParameterContent: null,
        },
      ]
    : [
        {
          preParameterContent: (
            <span>
              For the <b>Experiment</b>
            </span>
          ),
          parameterName: 'profileset_generic',
          postParameterContent: null,
        },
        {
          preParameterContent: <span>return genes that are</span>,
          parameterName: 'regulated_dir',
          postParameterContent: null,
        },
        {
          preParameterContent: (
            <span>
              with a <b>Fold change</b> {'>='}
            </span>
          ),
          parameterName: 'fold_change',
          postParameterContent: null,
        },
      ];

export const GenericFoldChangeParamGroup: React.FunctionComponent<GroupProps> =
  (props) => {
    const {
      state: {
        question: { parametersByName },
      },
      parameterElements,
    } = props;

    return (
      <div className="wdk-FoldChangeParams">
        {preAndPostParams(props).map(
          ({ preParameterContent, parameterName, postParameterContent }) => (
            <ParamLine
              key={parameterName}
              preParameterContent={preParameterContent}
              parameterElement={parameterElements[parameterName]}
              parameter={parametersByName[parameterName]}
              postParameterContent={postParameterContent}
            />
          )
        )}
        <SamplesParamSubgroup {...props} />
      </div>
    );
  };
