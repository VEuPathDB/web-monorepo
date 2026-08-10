import React, { ComponentType, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Props } from '@veupathdb/wdk-client/lib/Controllers/AnswerController';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import { makeEdaRoute } from '../routes';
import { useEda } from '../config';

const USERDATASET_SORTING = [
  { attributeName: 'creation_date', direction: 'DESC' },
];

type UDAnswerControllerProps = Props & {
  DefaultComponent: ComponentType<Props>;
};

export default function UDAnswerController({
  DefaultComponent,
  ...props
}: UDAnswerControllerProps) {
  const renderCellContent = useMemo(() => makeRenderCellContent(), []);

  const customDispatchProps = useMemo(
    () => ({
      ...props.dispatchProps,
      loadAnswer: (searchName: string, recordClassName: string, opts: any) =>
        props.dispatchProps.loadAnswer(searchName, recordClassName, {
          ...opts,
          displayInfo: {
            ...opts.displayInfo,
            sorting: USERDATASET_SORTING,
          },
        }),
    }),
    [props.dispatchProps]
  );

  return (
    <DefaultComponent
      {...props}
      dispatchProps={customDispatchProps}
      renderCellContent={renderCellContent}
    />
  );
}

const makeRenderCellContent = () => (props: any) => {
  if (props.attribute.name === 'primary_key' && useEda) {
    return (
      <Link to={`${makeEdaRoute(props.record.id[0].value)}/new/details`}>
        {safeHtml(props.record.attributes.primary_key)}
      </Link>
    );
  }
  return <props.CellContent {...props} />;
};
