import React from 'react';
import DraggablePanel from './index';

describe('<DraggablePanel />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <div>
        <DraggablePanel
          isOpen
          showPanelTitle
          panelTitle="This is my title!"
          confineToParentContainer
        >
          <h1>Hello, world!</h1>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Porro enim
            id odio, fugiat alias beatae numquam delectus illum ea reiciendis
            iste ex esse laboriosam praesentium libero nostrum, aliquam
            voluptate illo?
          </p>
        </DraggablePanel>
      </div>
    );
  });
});
