import React from 'react';
import { connect } from 'react-redux';
import { IconAlt, Link } from 'wdk-client/Components';
import { getStudyByQuestionName } from '../selectors/siteData';

const injectSearchStudy = connect((state, props) => ({
  activeStudy: getStudyByQuestionName(props.wizardState.question.fullName)(state)
}));


export default QuestionWizard => injectSearchStudy(props => {
  let { activeStudy, wizardState } = props;
  return (
    <QuestionWizard
      {...props}
      additionalHeadingContent={activeStudy
        ? (
          <div className="clinepi-StudyLink">
            <i className="fa fa-info-circle"/>&nbsp;&nbsp;
            <Link to={activeStudy.route} _target="blank">
              Study Details &raquo;
            </Link>
          </div>
        ) : (
          <div>Could not find study based on record class.</div>
        )}
      questionSummary={wizardState.question
        ? (
          <div className="clinepi-Summary">
            <span dangerouslySetInnerHTML={{__html: wizardState.question.summary}}/>
          </div>
        ) : (
          <div>Could not find question.</div>
        )}
    />
  );
})
