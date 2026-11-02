import React, { Component, ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { GroupCacheGate } from './groupCache';

class Boundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <p>failed: {this.state.error.message}</p>
    ) : (
      this.props.children
    );
  }
}

function renderGate(getVersion: () => Promise<number>) {
  // only getVersion is used; the context's other members are irrelevant here
  const dependencies = {
    wdkService: { getVersion },
  } as unknown as React.ContextType<typeof WdkDependenciesContext>;
  return render(
    <WdkDependenciesContext.Provider value={dependencies}>
      <Boundary>
        <GroupCacheGate group="OG1">
          <p>page</p>
        </GroupCacheGate>
      </Boundary>
    </WdkDependenciesContext.Provider>
  );
}

describe('GroupCacheGate', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('renders its children once the service version is known', async () => {
    renderGate(() => Promise.resolve(1));
    await waitFor(() => expect(screen.getByText('page')).toBeTruthy());
  });

  it('fails, rather than render with an unchecked cache, when there is no version', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    renderGate(() => Promise.reject(new Error('no version')));
    await waitFor(() =>
      expect(screen.getByText('failed: no version')).toBeTruthy()
    );
    expect(screen.queryByText('page')).toBeNull();
  });
});
