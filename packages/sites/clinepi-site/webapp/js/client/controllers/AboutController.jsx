import React from 'react';
import { PageController } from 'wdk-client/Controllers';
import About from '../components/About';

export default class AboutController extends PageController {
  renderView() {
    return <About/>
  }
}
