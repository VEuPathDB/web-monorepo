import React from 'react';
import { ViewController } from 'wdk-client/Controllers';
import { Footer } from 'wdk-client/Components';

// Used for legacy jsp pages
export default class FooterController extends ViewController {
  renderView() {
    return <Footer/>
  }
}
