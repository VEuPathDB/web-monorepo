import { DraggablePanel } from '@veupathdb/coreui/dist/components/containers';
import React from 'react';

describe('<DraggablePanel />', () => {
  it('users can move a panel by dragging', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <div style={{ height: '500px', width: '500px' }}>
        <DraggablePanel
          isOpen
          showPanelTitle
          panelTitle="Drag handle"
          confineToParentContainer
          defaultPosition={{ x: 0, y: 0 }}
          styleOverrides={{ zIndex: 2 }}
        >
          <h1>Hello, world!</h1>
        </DraggablePanel>
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            padding: 0,
            margin: 0,
          }}
        >
          Cover me
        </div>
      </div>
    );

    const dragHandle = cy.findByText(`Drag handle`);
    cy.dragTo(dragHandle, { x: 250, y: 250 });

    cy.findByText('Cover me').should('not.be.visible');
  });
});
