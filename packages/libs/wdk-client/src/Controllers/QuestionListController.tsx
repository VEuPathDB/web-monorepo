import * as React from 'react';
import { connect } from 'react-redux';

import PageController from '../Core/Controllers/PageController';
import { safeHtml, wrappable } from '../Utils/ComponentUtils';
import { Question } from '../Utils/WdkModel';
import { Loading } from '../Components';
import { RootState } from '../Core/State/Types';

class QuestionListController extends PageController<{
  questions?: Question[];
}> {
  isRenderDataLoaded() {
    return this.props.questions != null;
  }

  getTitle() {
    return 'Question List';
  }

  renderView() {
    if (this.props.questions == null) return <Loading />;

    return (
      <div>
        <h2>Available Questions</h2>
        <ol>
          {this.props.questions.map((question) => (
            <li key={question.urlSegment} style={{ margin: '10px 0' }}>
              <span style={{ fontSize: '1.3em' }}>{question.displayName}</span>{' '}
              ({question.urlSegment})
              {/* <Link to={`/answer/${question.fullName}`}>answer page</Link> */}
              <div style={{ margin: '0.5em' }}>
                <strong>Summary:</strong>
                <br />
                <div style={{ marginLeft: '2em' }}>
                  {safeHtml(question.summary || '<em>No summary</em>')}
                </div>
              </div>
              <div style={{ margin: '0.5em' }}>
                <strong>Description:</strong>
                <br />
                <div style={{ marginLeft: '2em' }}>
                  {safeHtml(question.description || '<em>No description</em>')}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

const enhance = connect(
  (state: RootState) => ({ questions: state.globalData.questions }),
  () => ({})
);
export default enhance(wrappable(QuestionListController));
