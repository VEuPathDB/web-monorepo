import React, { createContext, useState } from 'react';

export const ShowHideVariableContext = createContext({
  toggleShowHideVariable: false,
  setToggleShowHideVariableHandler: (toggleShowHideVariable: boolean) => {},
});

const ShowHideVariableContextProvider: React.FC<React.ReactNode> = ({
  children,
}) => {
  const [toggleShowHideVariable, setToggleShowHideVariable] = useState(false);
  const setToggleShowHideVariableHandler = (toggleShowHideVariable: boolean) =>
    setToggleShowHideVariable(toggleShowHideVariable);

  return (
    <ShowHideVariableContext.Provider
      value={{ toggleShowHideVariable, setToggleShowHideVariableHandler }}
    >
      {children}
    </ShowHideVariableContext.Provider>
  );
};

export default ShowHideVariableContextProvider;
