import React, { createContext, useState } from 'react';

export const ShowHideVariableContext = createContext({
  showOnlyCompatibleVariables: false,
  setShowOnlyCompatibleVariablesHandler: (
    showOnlyCompatibleVariables: boolean
  ) => {},
});

const ShowHideVariableContextProvider: React.FC<React.ReactNode> = ({
  children,
}) => {
  const [showOnlyCompatibleVariables, setShowOnlyCompatibleVariables] =
    useState(false);
  const setShowOnlyCompatibleVariablesHandler = (
    showOnlyCompatibleVariables: boolean
  ) => setShowOnlyCompatibleVariables(showOnlyCompatibleVariables);

  return (
    <ShowHideVariableContext.Provider
      value={{
        showOnlyCompatibleVariables,
        setShowOnlyCompatibleVariablesHandler,
      }}
    >
      {children}
    </ShowHideVariableContext.Provider>
  );
};

export default ShowHideVariableContextProvider;
