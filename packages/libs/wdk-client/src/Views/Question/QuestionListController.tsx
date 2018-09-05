import * as React from 'react';

import WdkPageController from '../../Core/Controllers/WdkPageController';
import { safeHtml, wrappable } from '../../Utils/ComponentUtils';

class QuestionListController extends WdkPageController {

  isRenderDataLoaded() {
    return this.state.globalData.questions != null;
  }

  getTitle() {
    return "Question List";
  }

  renderView() {
    if (this.state.globalData.questions == null) return null;

    return (
      <div>
        <h2>Available Questions</h2>
        <ol>
          {this.state.globalData.questions.map(question => (
            <li key={question.name} style={{margin:'10px 0'}}>
              <span style={{fontSize:'1.3em'}}>{question.displayName}</span> ({question.urlSegment})
              { /* <Link to={`/answer/${question.name}`}>answer page</Link> */ }
              <div style={{margin:'0.5em'}}>
                <strong>Summary:</strong><br/>
                <div style={{marginLeft:'2em'}}>{safeHtml(question.summary||'<em>No summary</em>')}</div>
              </div>
              <div style={{margin:'0.5em'}}>
                <strong>Description:</strong><br/>
                <div style={{marginLeft:'2em'}}>{safeHtml(question.description||'<em>No description</em>')}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

export default wrappable(QuestionListController);
