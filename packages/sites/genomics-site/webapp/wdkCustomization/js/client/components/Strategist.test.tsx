import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { createStore } from 'redux';

import { StrategistController } from '@veupathdb/web-common/lib/controllers/StrategistController';

let mockStrategistUrl = '/strategist';

jest.mock('@veupathdb/web-common/lib/config', () => ({
  get strategistUrl() {
    return mockStrategistUrl;
  },
  rootUrl: '/plasmo/app',
}));

function renderAt(location: string) {
  const store = createStore(() => ({ globalData: {} }));
  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[location]}>
        <Route path="/strategist" component={StrategistController} />
      </MemoryRouter>
    </Provider>
  );
  const iframe = screen.getByTitle('VEuPathDB Strategist') as HTMLIFrameElement;
  return { ...view, iframe };
}

function post(
  iframe: HTMLIFrameElement,
  data: unknown,
  { origin = window.location.origin, source = iframe.contentWindow } = {}
) {
  window.dispatchEvent(new MessageEvent('message', { data, origin, source }));
}

afterEach(() => {
  mockStrategistUrl = '/strategist';
  jest.restoreAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('Strategist', () => {
  it('frames the Strategist path after /strategist, in any letter case', () => {
    expect(renderAt('/Strategist/plasmodb/x?a=1').iframe.src).toBe(
      'http://localhost/strategist/plasmodb/x?a=1'
    );
  });

  it('never frames a protocol-relative src', () => {
    mockStrategistUrl = '/';
    expect(renderAt('/strategist//evil.com/x').iframe.src).toBe(
      'http://localhost/evil.com/x'
    );
  });

  it('writes a reported path into the address bar, keeping history state', () => {
    window.history.replaceState({ key: 'abc' }, '', '/');
    const replaceState = jest.spyOn(window.history, 'replaceState');
    const { iframe } = renderAt('/strategist');
    post(iframe, { type: 'strategist:location', path: '//evil.com/x' });
    expect(replaceState).toHaveBeenCalledWith(
      { key: 'abc' },
      '',
      '/plasmo/app/strategist//evil.com/x'
    );
    expect(window.location.origin).toBe('http://localhost');
  });

  it('ignores other origins, other windows and malformed messages', () => {
    const replaceState = jest.spyOn(window.history, 'replaceState');
    const { iframe } = renderAt('/strategist');
    const message = { type: 'strategist:location', path: '/plasmodb' };
    post(iframe, message, { origin: 'https://example.org' });
    post(iframe, message, { source: window });
    post(iframe, { ...message, type: 'other' });
    post(iframe, { ...message, path: 'plasmodb' });
    post(iframe, { ...message, path: 7 });
    post(iframe, null);
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('removes its listener on unmount', () => {
    const addEventListener = jest.spyOn(window, 'addEventListener');
    const removeEventListener = jest.spyOn(window, 'removeEventListener');
    renderAt('/strategist').unmount();
    const added = addEventListener.mock.calls.find(([t]) => t === 'message');
    expect(removeEventListener).toHaveBeenCalledWith('message', added?.[1]);
  });
});
