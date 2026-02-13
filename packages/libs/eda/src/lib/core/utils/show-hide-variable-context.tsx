import React, { createContext, useState } from 'react';

export const ShowHideVariableContext = createContext({
  showOnlyCompatibleVariables: false,
  setShowOnlyCompatibleVariablesHandler: (
    showOnlyCompatibleVariables: boolean
  ) => {},
});

interface ShowHideVariableContextProviderProps {
  defaultShowOnlyCompatible?: boolean;
  children: React.ReactNode;
}

const ShowHideVariableContextProvider: React.FC<
  ShowHideVariableContextProviderProps
> = ({ defaultShowOnlyCompatible = false, children }) => {
  const [showOnlyCompatibleVariables, setShowOnlyCompatibleVariables] =
    useState(defaultShowOnlyCompatible);
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
