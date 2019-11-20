import React, {useState} from 'react';
import { StrategySummary, EditStrategySpec } from 'wdk-client/Utils/WdkUser';

import './EditStrategyForm.css';

interface Props {
  strategy: StrategySummary;
  clearActiveModal: () => void;
  editStrategy: (strategyId: number, properties: EditStrategySpec) => void;
}

export default function SaveStrategyForm(props: Props) {
  const [ name, setName ] = useState(props.strategy.name);
  const [ isPublic, setIsPublic ] = useState(props.strategy.isPublic);
  const [ description, setDescription ] = useState(props.strategy.description || '');
  const maxDescriptionSize = 4000;
  const descriptionSize = description.length;
  const descriptionTooLong = descriptionSize > maxDescriptionSize;
  return (
    <React.Fragment>
      <div>
        <form className="SaveStrategyForm" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="save-strat--name" className="SaveStrategyForm--Label">Name</label>
            <input id="save-strat--name" className="SaveStrategyForm--Control" type="text" required value={name} onChange={handleNameChange} />
          </div>
          {props.strategy.isSaved &&
            <div>
              <div className="SaveStrategyForm--Label">Public</div>
              <input id="save-strat--is-public" className="SaveStrategyForm--Control" type="checkbox" disabled={!props.strategy.isSaved} checked={isPublic} onChange={handleIsPublicChange} />
              <label htmlFor="save-strat--is-public" >Allow this strategy to be listed on the public strategies page.</label>
            </div>
          }
          <div>
            <label htmlFor="save-strat--description" className="SaveStrategyForm--Label">Description (optional)</label>
            <textarea id="save-strat--description" className="SaveStrategyForm--Control" rows={8} value={description} onChange={handleDescriptionChange} />
            <aside className={`SaveStrategyForm--Caption ${descriptionTooLong ? 'important' : ''}`}>
              {descriptionSize.toLocaleString()} / {maxDescriptionSize.toLocaleString()} characters
            </aside>
          </div>
          <div className="SaveStrategyForm--Buttons">
            <button className="btn">Update</button> <button className="btn" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </React.Fragment>
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.editStrategy(props.strategy.strategyId, { name, isPublic, description });
    props.clearActiveModal();
  }

  function handleCancel(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
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
