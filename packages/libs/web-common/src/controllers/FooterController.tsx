import React from 'react';
import { ViewController } from '@veupathdb/wdk-client/lib/Controllers';
import { Footer } from '@veupathdb/wdk-client/lib/Components';

// Used for legacy jsp pages
export default class FooterController extends ViewController {
  renderView() {
    return <Footer />;
  }
}
