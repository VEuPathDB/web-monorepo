import React from 'react';
import { ViewController } from 'wdk-client/Controllers';
import { Header } from 'wdk-client/Components';

// Used for legacy jsp pages
export default class HeaderController extends ViewController {
  renderView() {
    return <Header/>;
  }
}
