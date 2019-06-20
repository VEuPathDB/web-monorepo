import React, {useState} from 'react';
import { StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import './SaveStrategyForm.css';

interface Props extends RouteComponentProps<void> {
  strategy: StrategyDetails;
  recordClassesByName: Record<string, RecordClass>;
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
            <input id="save-strat--name" className="SaveStrategyForm--Control" type="text" minLength={1} maxLength={200} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="save-strat--is-public" className="SaveStrategyForm--Label">Public</label>
            <input id="save-strat--is-public" className="SaveStrategyForm--Control" type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            <label htmlFor="save-strat--is-public"  className="SaveStrategyForm--Caption">Allow this strategy to be listed on the public strategies page.</label>
          </div>
          <div>
            <label htmlFor="save-strat--description" className="SaveStrategyForm--Label">Description (optional)</label>
            <textarea id="save-strat--description" className="SaveStrategyForm--Control" maxLength={maxDescriptionSize} rows={8} value={description} onChange={e => setDescription(e.target.value)} />
            <aside className={`SaveStrategyForm--Caption ${descriptionTooLong ? 'SaveStrategyForm--Caption__error' : ''}`}>
              {descriptionSize.toLocaleString()} / {maxDescriptionSize.toLocaleString()} characters
            </aside>
          </div>
          <div className="SaveStrategyForm--Buttons">
            <button disabled={descriptionTooLong} type="submit" className="btn">Save</button> <Link className="btn" replace to="#">Close</Link>
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
}

export default withRouter(SaveStrategyForm);