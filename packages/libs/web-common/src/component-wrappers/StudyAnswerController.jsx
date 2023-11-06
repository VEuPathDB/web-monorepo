import { get } from 'lodash';
import React, { useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import DownloadLink from '../App/Studies/DownloadLink';
import CategoryIcon from '../App/Categories/CategoryIcon';
import StudySearchIconLinks from '../App/Studies/StudySearches';
import { isPrereleaseStudy } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUtils';
import { makeEdaRoute } from '../routes';
import { useEda } from '../config';

// wrapping WDKClient AnswerController for specific rendering on certain columns
function StudyAnswerController(props) {
  const studyEntities = useSelector(
    (state) => state.studies && state.studies.entities
  );

  const { visibleRecords, totalCount } = useMemo(() => {
    const enabledStudyIds =
      studyEntities &&
      studyEntities.filter(({ disabled }) => !disabled).map(({ id }) => id);

    const enabledStudyIdsSet = new Set(enabledStudyIds);

    return {
      visibleRecords:
        props.stateProps.records &&
        props.stateProps.records.filter((record) =>
          enabledStudyIdsSet.has(record.id[0].value)
        ),
      totalCount:
        props.stateProps.unfilteredRecords &&
        props.stateProps.unfilteredRecords.reduce(
          (count, record) =>
            count + (enabledStudyIdsSet.has(record.id[0].value) ? 1 : 0),
          0
        ),
    };
  }, [
    studyEntities,
    props.stateProps.records,
    props.stateProps.unfilteredRecords,
  ]);

  const renderCellContent = useMemo(
    () => makeRenderCellContent(props.permissions),
    [props.permissions]
  );

  return (
    <React.Fragment>
      hello
      <props.DefaultComponent
        {...props}
        stateProps={{
          ...props.stateProps,
          records: visibleRecords,
          meta: props.stateProps.meta && {
            ...props.stateProps.meta,
            totalCount,
          },
        }}
        renderCellContent={renderCellContent}
      />
    </React.Fragment>
  );
}

// StudySearchCellContent wraps StudySearchIconLinks
// - accessing the store to get new props needed to render StudySearchIconLinks (aka StudySearches)
// --- using connect(mapStateToProps,..): pattern also used in StudyRecordHeading
let StudySearchCellContent = connect(
  mapStateToProps,
  null
)(StudySearchIconLinks);

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

const makeRenderCellContent = (permissions) => (props) => {
  const shouldRenderAsPrerelease = isPrereleaseStudy(
    props.record.attributes.study_access.toLowerCase(),
    props.record.attributes.dataset_id,
    permissions
  );

  if (props.attribute.name === 'primary_key' && useEda) {
    return (
      <Link to={`${makeEdaRoute(props.record.id[0].value)}/new/details`}>
        {safeHtml(props.record.attributes.primary_key)}
      </Link>
    );
  }

  if (props.attribute.name === 'study_categories') {
    let studyCategories = JSON.parse(props.record.attributes.study_categories);
    return (
      <div style={{ textAlign: 'center' }}>
        {studyCategories &&
          studyCategories.map((cat) => (
            <CategoryIcon category={cat} key={cat} />
          ))}
      </div>
    );
  }
  if (props.attribute.name === 'disease') {
    const disease = props.record.attributes.disease || 'Unknown';
    const categories = disease.split(/\s*,\s*/);
    return categories[0] === 'Unknown' ? (
      <div>&nbsp;</div>
    ) : (
      <div style={{ textAlign: 'center' }}>
        {categories.map((cat) => (
          <CategoryIcon category={cat} key={cat} />
        ))}
        <strong>{disease}</strong>
      </div>
    );
  }
  if (props.attribute.name === 'card_questions') {
    return !shouldRenderAsPrerelease ? (
      <StudySearchCellContent {...props} />
    ) : (
      <div>&nbsp;</div>
    );
  }
  if (props.attribute.name === 'bulk_download_url') {
    return !shouldRenderAsPrerelease ? (
      <DownloadLink
        studyId={props.record.id[0].value}
        studyUrl={props.record.attributes.bulk_download_url.url}
      />
    ) : (
      <div>&nbsp;</div>
    );
  }
  return <props.CellContent {...props} />;
};

// mapStateToProps()
// - input props: StudySearchCellContent, of type RenderCellProps
//   will be converted into new props needed to render StudySearchIconLinks (defined in StudySearches.jsx)
// --- entries = [{question, recordClass}],
// --- webAppUrl
//
function mapStateToProps(state, props) {
  const { record } = props;
  const { globalData, studies } = state;
  const { siteConfig } = globalData;
  const { webAppUrl } = siteConfig;

  if (studies.loading) {
    return { loading: true };
  }

  const studyId = record.id
    .filter((part) => part.name === 'dataset_id')
    .map((part) => part.value)[0];

  const study = get(studies, 'entities', []).find(
    (study) => study.id === studyId
  );

  return { study, webAppUrl };
}

export default StudyAnswerController;
