import React from 'react';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import About from '../components/About';

export default class AboutController extends PageController {
  renderView() {
    return <About/>
  }
}
