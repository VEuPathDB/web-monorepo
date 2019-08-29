import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import { StrategySummary, StrategyProperties, SaveStrategyOptions, EditStrategySpec } from 'wdk-client/Utils/WdkUser';

import './SaveStrategyForm.css';

interface Props {
  strategy: StrategySummary;
  clearActiveModal: () => void;
  editStrategy: (strategyId: number, properties: EditStrategySpec) => void;
  saveStrategy: (strategyId: number, properties: StrategyProperties, options: SaveStrategyOptions) => void;
  /* If true, the name conflicts are rejected */
  isEdit?: boolean; // default to false
}

export default function SaveStrategyForm(props: Props) {
  const { isEdit } = props;
  const [ name, setName ] = useState(props.strategy.name);
  const [ isPublic, setIsPublic ] = useState(props.strategy.isPublic);
  const [ description, setDescription ] = useState(props.strategy.description || '');
  const maxDescriptionSize = 4000;
  const descriptionSize = description.length;
  const descriptionTooLong = descriptionSize > maxDescriptionSize;
  return (
    <React.Fragment>
      <div>
        {!isEdit &&
          <div className="SaveStrategyForm--Notes">
            <p className="important">
              <strong>NOTE:</strong> You will be saving the <strong>configuration</strong> of this search strategy, <strong>not the data</strong> in the result.
            </p>
            <ul>
              <li>Re-running the saved search strategy might yield different results in subsequent releases of the site, if the underlying data have changed.</li>
              <li>To store the exact data in this result, please <Link to={`/step/${props.strategy.rootStepId}/download`}>download the result</Link>.</li>
            </ul>
          </div>
        }
        <form className="SaveStrategyForm" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="save-strat--name" className="SaveStrategyForm--Label">Name</label>
            <input id="save-strat--name" className="SaveStrategyForm--Control" type="text" required value={name} onChange={handleNameChange} />
          </div>
          {( !isEdit || props.strategy.isSaved ) &&
            <div>
              <div className="SaveStrategyForm--Label">Public</div>
              <input id="save-strat--is-public" className="SaveStrategyForm--Control" type="checkbox" checked={isPublic} onChange={handleIsPublicChange} />
              <label htmlFor="save-strat--is-public" >Allow this strategy to be listed on the public strategies page.</label>
            </div>
          }
          {( !isEdit || props.strategy.isSaved ) &&
            <div>
              <label htmlFor="save-strat--description" className="SaveStrategyForm--Label">Description (optional)</label>
              <textarea id="save-strat--description" className="SaveStrategyForm--Control" rows={8} value={description} onChange={handleDescriptionChange} />
              <aside className={`SaveStrategyForm--Caption ${descriptionTooLong ? 'important' : ''}`}>
                {descriptionSize.toLocaleString()} / {maxDescriptionSize.toLocaleString()} characters
              </aside>
            </div>
          }
          <div className="SaveStrategyForm--Buttons">
            <button type="submit" className="btn">Save</button> <button type="button" className="btn" onClick={() => props.clearActiveModal()}>Cancel</button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { isSaved } = props.strategy;
    if (isEdit) props.editStrategy(props.strategy.strategyId, { name, isPublic, description });
    else props.saveStrategy(props.strategy.strategyId, { name, isPublic, description, isSaved }, { removeOrigin: !isSaved });
    props.clearActiveModal();
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
