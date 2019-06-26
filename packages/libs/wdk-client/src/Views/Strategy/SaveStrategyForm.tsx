import React, {useState} from 'react';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import './SaveStrategyForm.css';
import {UiStepTree} from 'wdk-client/Views/Strategy/Types';

interface Props extends RouteComponentProps<void> {
  strategy: StrategyDetails;
  uiStepTree: UiStepTree;
  action?: string;
  onStrategyRename: (name: string) => void;
  onStrategyCopy: (signature: string) => void;
  onStrategySave: (name: string, isPublic: boolean, description?: string) => void;
  onStrategyDelete: () => void;
}

function SaveStrategyForm(props: Props) {
  const [ name, setName ] = useState(props.strategy.name);
  const [ isPublic, setIsPublic ] = useState(props.strategy.isPublic);
  const [ description, setDescription ] = useState(props.strategy.description || '');
  const maxDescriptionSize = 4000;
  const descriptionSize = description.length;
  const descriptionTooLong = descriptionSize > maxDescriptionSize;
  return (
    <React.Fragment>
      <div>
        <ul className="SaveStrategyForm--Notes">
          <li>You are saving the configuration of this search strategy, not the data in the result.</li>
          <li>Re-running the saved search strategy could possibly yield different results in subsequent releases of the site, if the underlying data have changed.</li>
          <li>To store the exact data in this result, please <Link to={`/step/${props.strategy.rootStepId}/download`}>download the result</Link>.</li>
        </ul>
        <form className="SaveStrategyForm" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="save-strat--name" className="SaveStrategyForm--Label">Name</label>
            <input id="save-strat--name" className="SaveStrategyForm--Control" type="text" required value={name} onChange={handleNameChange} />
          </div>
          <div>
            <div className="SaveStrategyForm--Label">Public</div>
            <input id="save-strat--is-public" className="SaveStrategyForm--Control" type="checkbox" checked={isPublic} onChange={handleIsPublicChange} />
            <label htmlFor="save-strat--is-public" >Allow this strategy to be listed on the public strategies page.</label>
          </div>
          <div>
            <label htmlFor="save-strat--description" className="SaveStrategyForm--Label">Description (optional)</label>
            <textarea id="save-strat--description" className="SaveStrategyForm--Control" rows={8} value={description} onChange={handleDescriptionChange} />
            <aside className={`SaveStrategyForm--Caption ${descriptionTooLong ? 'SaveStrategyForm--Caption__error' : ''}`}>
              {descriptionSize.toLocaleString()} / {maxDescriptionSize.toLocaleString()} characters
            </aside>
          </div>
          <div className="SaveStrategyForm--Buttons">
            <button type="submit" className="btn">Save</button> <Link className="btn" replace to="#">Close</Link>
          </div>
        </form>
      </div>
    </React.Fragment>
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onStrategySave(name, isPublic, description);
    props.history.replace('#');
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { target } = event;
    const { value } = target;
    setName(value);
    target.setCustomValidity(value.length > 200 ? 'The value is too long.' : '');
  }

  function handleDescriptionChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const { target } = event;
    const { value } = target;
    setDescription(value);
    target.setCustomValidity(value.length > maxDescriptionSize ? 'The value is too long.' : '');
  }

  function handleIsPublicChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIsPublic(event.target.checked);
  }
}

export default withRouter(SaveStrategyForm);
