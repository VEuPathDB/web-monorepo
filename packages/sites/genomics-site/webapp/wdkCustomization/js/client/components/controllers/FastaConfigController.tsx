import React from 'react';
import { PageController } from 'wdk-client/Controllers';
import { Srt } from '../Srt';

export default class FastaConfigController extends PageController {
  renderView() {
    return <Srt />;
  }
}
