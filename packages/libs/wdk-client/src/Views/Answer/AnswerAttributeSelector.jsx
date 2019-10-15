import React from 'react';

function AttributeSelector({ onSubmit, allAttributes, selectedAttributes, onChange }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="wdk-AnswerTable-AttributeSelectorButtonWrapper">
        <button>Update Columns</button>
      </div>
      <ul className="wdk-AnswerTable-AttributeSelector">
        {allAttributes.filter(({ isDisplayable }) => isDisplayable).map(attribute => {
          return (
            <li key={attribute.name}>
              <input
                type="checkbox"
                id={'column-select-' + attribute.name}
                name="pendingAttribute"
                value={attribute.name}
                disabled={!attribute.isRemovable}
                checked={selectedAttributes.includes(attribute.name)}
                onChange={({ target }) => onChange(target.value, target.checked)}
              />
              <label htmlFor={`column-select-${attribute.name}`}> {attribute.displayName} </label>
            </li>
          );
        })}
      </ul>
      <div className="wdk-AnswerTable-AttributeSelectorButtonWrapper">
        <button>Update Columns</button>
      </div>
    </form>
  );
};

export default AttributeSelector;
