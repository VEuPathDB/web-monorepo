import React from 'react';

type Props = {
  /* TODO: Pass whatever props are needed to render the preview images */
  operationName: string;
  isSelected: boolean;
  onSelectMenuItem: () => void;
}

export const AddStepMenuSelection = (props: Props) =>
  <button 
    onClick={props.onSelectMenuItem} 
    style={
      props.isSelected 
        ? {
            border: '1px solid red',
            outline: 'none'
          }
        : {}
    }
  >
    {props.operationName}
  </button>;
