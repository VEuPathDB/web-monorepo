import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { ThemedUpdateButton } from '../../../../Components/ThemedUpdateButton';

export const EditDatasetButton = (): React.ReactElement => {
  const { path } = useRouteMatch();
  const history = useHistory();

  return (
    <ThemedUpdateButton
      buttonText="Edit my dataset"
      onPress={() => history.push({ pathname: path + '/edit' })}
    />
  );
};