import React from 'react';
import { ViewController } from '@veupathdb/wdk-client/lib/Controllers';
import { Header } from '@veupathdb/wdk-client/lib/Components';

// Used for legacy jsp pages
export default class HeaderController extends ViewController {
  renderView() {
    return <Header/>;
  }
}
