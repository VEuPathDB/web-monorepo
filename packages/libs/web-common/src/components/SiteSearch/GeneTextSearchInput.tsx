import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import './SiteSearch.scss';
import { useSessionBackedState } from '@veupathdb/wdk-client/lib/Hooks/SessionBackedState';

const cx = makeClassNameHelper('SiteSearch');
const TEXT_SEARCH_NAME = 'GenesByText';
const TEXT_SEARCH_ROUTE = `/search/transcript/${TEXT_SEARCH_NAME}`;

export function GeneTextSearchInput() {
  const history = useHistory();
  const [textExpression, setTextExpression] = useSessionBackedState(
    '',
    'ebrc/gene-text-expression',
    (value) => value,
    (value) => value
  );
  const searchPageUrl = history.createHref({ pathname: TEXT_SEARCH_ROUTE });
  const textSearchQuestion = useWdkService(
    async (wdkService) => wdkService.getQuestionAndParameters(TEXT_SEARCH_NAME),
    []
  );
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const formData = new FormData(event.currentTarget);
      const inputValue = formData.get('param.text_expression');
      setTextExpression(typeof inputValue === 'string' ? inputValue : '');
      if (event instanceof MouseEvent && (event.ctrlKey || event.shiftKey))
        return;
      event.preventDefault();
      const search = new URLSearchParams(formData as any);
      history.push(TEXT_SEARCH_ROUTE + '?' + search);
    },
    []
  );

  if (textSearchQuestion == null) return null;

  const textExpressionParam = textSearchQuestion.parameters.find(
    (p) => p.name === 'text_expression'
  );

  if (textExpressionParam == null) return null;

  return (
    <form
      className={cx('--SearchBox')}
      action={searchPageUrl}
      method="get"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="autoRun" value="1" />
      {textSearchQuestion.parameters.map(
        (p) =>
          p.name !== 'text_expression' && (
            <input
              key={p.name}
              type="hidden"
              name={`param.${p.name}`}
              value={p.initialDisplayValue}
            />
          )
      )}
      <input
        type="input"
        name="param.text_expression"
        defaultValue={textExpression}
        placeholder={`E.g., ${textExpressionParam.initialDisplayValue}`}
      />
      <button type="submit">
        <i className="fa fa-search" />
      </button>
    </form>
  );
}
