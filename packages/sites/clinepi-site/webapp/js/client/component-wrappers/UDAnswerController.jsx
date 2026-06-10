import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { makeEdaRoute } from '@veupathdb/web-common/lib/routes';
import { useEda } from '@veupathdb/web-common/lib/config';

const USERDATASET_SORTING = [
  { attributeName: 'creation_date', direction: 'DESC' },
];

// Wrapping WDKClient AnswerController for specific rendering on primary_key column for user datasets
function UDAnswerController(props) {
  const renderCellContent = useMemo(() => makeRenderCellContent(), []);

  // Wrap dispatchProps to inject custom sorting on initial load
  const customDispatchProps = useMemo(
    () => ({
      ...props.dispatchProps,
      loadAnswer: (searchName, recordClassName, opts) => {
        const customOpts = {
          ...opts,
          displayInfo: {
            ...opts.displayInfo,
            sorting: USERDATASET_SORTING,
          },
        };
        return props.dispatchProps.loadAnswer(
          searchName,
          recordClassName,
          customOpts
        );
      },
    }),
    [props.dispatchProps]
  );

  return (
    <props.DefaultComponent
      {...props}
      dispatchProps={customDispatchProps}
      renderCellContent={renderCellContent}
    />
  );
}

/* prop types defined in WDKClient/../AnswerController.jsx
   and used in Answer.jsx

interface CellContentProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}
interface RenderCellProps extends CellContentProps {
  CellContent: React.ComponentType<CellContentProps>;
}
*/

const makeRenderCellContent = () => (props) => {
  // Override primary_key column to link to EDA workspace, matching StudyAnswerController pattern
  if (props.attribute.name === 'primary_key' && useEda) {
    return (
      <Link to={`${makeEdaRoute(props.record.id[0].value)}/new/details`}>
        {safeHtml(props.record.attributes.primary_key)}
      </Link>
    );
  }

  return <props.CellContent {...props} />;
};

export default UDAnswerController;
